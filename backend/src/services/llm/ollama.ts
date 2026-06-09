import axios, { isAxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function is429(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 429;
}

// Returns how long to wait in ms. Returns null when retry-after is too long (should fail over instead).
function retryAfterMs(err: unknown): number | null {
  if (!isAxiosError(err)) return 10000;
  const header = err.response?.headers?.['retry-after'];
  if (header) {
    const secs = parseInt(String(header), 10);
    if (!isNaN(secs) && secs > 0) {
      // If Groq wants us to wait more than 30s, it's a daily/hourly limit reset —
      // don't queue for 68 minutes, just fail over to Gemini/Ollama immediately.
      if (secs > 30) return null;
      return secs * 1000;
    }
  }
  return 10000; // default 10s
}

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaChatResponse {
  message: { role: string; content: string };
  done: boolean;
  error?: string;
}

interface OllamaTagsResponse {
  models?: Array<{ name: string; size: number }>;
}

interface GroqStreamChunk {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
}

function extractError(err: unknown): string {
  if (!isAxiosError(err)) return err instanceof Error ? err.message : String(err);
  if (err.code === 'ECONNREFUSED') return `Cannot connect to Ollama at ${config.ollama.baseUrl}. Run: ollama serve`;
  if (err.code === 'ECONNRESET') return 'Connection reset — model may have run out of RAM.';
  if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
    return `Request timed out after ${config.ollama.timeout / 1000}s.`;
  }
  const data = err.response?.data;
  if (data && typeof data === 'object' && 'error' in data) {
    const e = (data as { error: { message?: string } | string }).error;
    return typeof e === 'string' ? e : (e.message ?? JSON.stringify(e));
  }
  if (typeof data === 'string') return data.slice(0, 300);
  return err.message;
}

// ─── Ollama (local) ───────────────────────────────────────────────────────────

export class OllamaClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.ollama.baseUrl,
      timeout: config.ollama.timeout,
    });
  }

  async chat(messages: OllamaMessage[]): Promise<string> {
    try {
      const response = await this.client.post<OllamaChatResponse>('/api/chat', {
        model: config.ollama.model,
        messages,
        stream: false,
        format: 'json',
        // num_ctx: give the model plenty of room for the prompt + full itinerary response.
        // llama3.2:3b supports up to 128K; 16K is safe and avoids RAM issues.
        // num_predict: a 7-day itinerary JSON is ~5000-7000 tokens, so 8000 gives headroom.
        options: { temperature: config.ollama.temperature, num_predict: 8000, num_ctx: 16384 },
      });
      if (response.data.error) throw new Error(`Ollama: ${response.data.error}`);
      const content = response.data.message?.content ?? '';
      if (!content.trim()) throw new Error('Ollama returned empty response. Check available RAM.');
      return content;
    } catch (err) {
      throw new Error(extractError(err));
    }
  }

  async isAvailable(): Promise<boolean> {
    try { await this.client.get('/api/tags', { timeout: 5000 }); return true; }
    catch { return false; }
  }

  async listModels(): Promise<string[]> {
    try {
      const r = await this.client.get<OllamaTagsResponse>('/api/tags', { timeout: 5000 });
      return (r.data.models ?? []).map((m) => m.name);
    } catch { return []; }
  }
}

// ─── Groq (free API, fast) ────────────────────────────────────────────────────

export class GroqClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.groq.baseUrl,
      timeout: 90000,
      headers: {
        Authorization: `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /** Non-streaming: returns complete JSON string. Retries on 429 only when retry-after ≤ 30s. */
  async chat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.post<{
          choices: Array<{ message: { content: string } }>;
        }>('/chat/completions', {
          model: config.groq.model,
          messages,
          response_format: { type: 'json_object' },
          temperature: config.ollama.temperature,
          max_tokens: 16384,
        });
        return response.data.choices[0]?.message.content ?? '';
      } catch (err) {
        if (is429(err) && attempt < MAX_RETRIES) {
          const waitMs = retryAfterMs(err);
          if (waitMs === null) {
            // Daily/hourly limit — no point retrying, let caller fall over to Gemini/Ollama
            throw new Error('Groq: rate limit reset too far away — switching provider');
          }
          logger.warn(`Groq rate limited, waiting ${waitMs}ms then retrying`, { attempt });
          await sleep(waitMs);
          continue;
        }
        throw new Error(extractError(err));
      }
    }
    throw new Error('Groq: exceeded max retries');
  }

  /**
   * Streaming: yields token chunks as they arrive.
   * Does NOT use response_format (streaming + json_object is unreliable).
   * Caller must collect and parse the final string.
   */
  async *chatStream(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): AsyncGenerator<string> {
    // Retry the initial connection on 429 only when retry-after ≤ 30s
    let response;
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        response = await this.client.post<NodeJS.ReadableStream>('/chat/completions', {
          model: config.groq.model,
          messages,
          temperature: config.ollama.temperature,
          max_tokens: 16384,
          stream: true,
        }, { responseType: 'stream' });
        break;
      } catch (err) {
        if (is429(err) && attempt < MAX_RETRIES) {
          const waitMs = retryAfterMs(err);
          if (waitMs === null) {
            throw new Error('Groq: rate limit reset too far away — switching provider');
          }
          logger.warn(`Groq stream rate limited, waiting ${waitMs}ms`, { attempt });
          await sleep(waitMs);
          continue;
        }
        throw new Error(extractError(err));
      }
    }
    if (!response) throw new Error('Groq: exceeded max retries');

    let buffer = '';
    for await (const rawChunk of response.data) {
      buffer += String(rawChunk);
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.replace(/^data:\s*/, '').trim();
        if (!trimmed || trimmed === '[DONE]') continue;
        try {
          const parsed = JSON.parse(trimmed) as GroqStreamChunk;
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) yield token;
        } catch {
          // partial JSON — skip
        }
      }
    }
  }

  isConfigured(): boolean {
    return config.groq.apiKey.length > 0;
  }
}
