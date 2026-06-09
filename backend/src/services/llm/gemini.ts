import axios, { isAxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

// Google exposes a full OpenAI-compatible endpoint for Gemini models.
// Docs: https://ai.google.dev/gemini-api/docs/openai
const GEMINI_OPENAI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

interface StreamChunk {
  choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
}

function isStreamObject(data: unknown): boolean {
  // When axios receives responseType:'stream' and the request fails, err.response.data
  // is a raw Node.js Readable/Zlib stream. JSON.stringify(stream) produces garbage.
  if (!data || typeof data !== 'object') return false;
  return '_readableState' in data || typeof (data as Record<string, unknown>).pipe === 'function';
}

function extractHttpError(err: unknown): string {
  if (!isAxiosError(err)) return err instanceof Error ? err.message : String(err);
  const status = err.response?.status;
  const data = err.response?.data;

  // Never serialize stream objects
  if (!isStreamObject(data) && data && typeof data === 'object') {
    // Gemini sometimes returns [{error:{...}}] array
    if (Array.isArray(data) && (data[0] as { error?: { message?: string } })?.error?.message) {
      return `Gemini: ${(data[0] as { error: { message: string } }).error.message}`;
    }
    if ('error' in data) {
      const e = (data as { error: { message?: string } | string }).error;
      return typeof e === 'string' ? e : (e.message ?? JSON.stringify(e));
    }
  }

  switch (status) {
    case 400: return 'Gemini 400: bad request — check API key format and model name';
    case 401: return 'Gemini 401: invalid API key — get one at https://aistudio.google.com/app/apikey';
    case 403: return 'Gemini 403: access denied — key may not have Gemini API access';
    case 429: return 'Gemini 429: rate limited';
    case 503: return 'Gemini 503: service overloaded — try again in a moment';
    default: return `Gemini HTTP ${status ?? 'error'}: ${err.message}`;
  }
}

export class GeminiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: GEMINI_OPENAI_BASE,
      timeout: 120000,
      headers: {
        Authorization: `Bearer ${config.gemini.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  isConfigured(): boolean {
    const key = config.gemini.apiKey;
    if (key.length < 20) return false;
    if (key.includes('PASTE_YOUR') || key.includes('YOUR_KEY')) return false;
    // Accept both old format (AIzaSy...) and new Google AI Studio format (AQ....)
    return key.startsWith('AIza') || key.startsWith('AQ.');
  }

  /** Non-streaming call, returns complete JSON string. */
  async chat(messages: Msg[]): Promise<string> {
    try {
      const response = await this.client.post<{
        choices: Array<{ message: { content: string } }>;
      }>('/chat/completions', {
        model: config.gemini.model,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8192,
      });
      const content = response.data.choices[0]?.message.content ?? '';
      if (!content.trim()) throw new Error('Gemini returned empty response');
      return content;
    } catch (err) {
      const msg = extractHttpError(err);
      logger.error('Gemini chat error', { error: msg });
      throw new Error(msg);
    }
  }

  /** Streaming: yields token chunks as they arrive. */
  async *chatStream(messages: Msg[]): AsyncGenerator<string> {
    let response;
    try {
      response = await this.client.post<NodeJS.ReadableStream>('/chat/completions', {
        model: config.gemini.model,
        messages,
        temperature: 0.7,
        max_tokens: 8192,
        stream: true,
      }, { responseType: 'stream' });
    } catch (err) {
      // When responseType:'stream' and request fails, response.data is a stream —
      // read status code directly instead of trying to parse the body.
      const msg = extractHttpError(err);
      logger.error('Gemini stream connection error', { error: msg });
      throw new Error(msg);
    }

    let buffer = '';
    for await (const rawChunk of response.data) {
      buffer += String(rawChunk);
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.replace(/^data:\s*/, '').trim();
        if (!trimmed || trimmed === '[DONE]') continue;
        try {
          const parsed = JSON.parse(trimmed) as StreamChunk;
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) yield token;
        } catch {
          // partial chunk — skip
        }
      }
    }
  }
}
