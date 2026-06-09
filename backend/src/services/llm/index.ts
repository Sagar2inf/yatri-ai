import { OllamaClient, GroqClient } from './ollama.js';
import { GeminiClient } from './gemini.js';
import { YATRA_SYSTEM_PROMPT, OLLAMA_COMPACT_PROMPT, buildItineraryContext, buildOllamaContext } from './prompts.js';
import type { LLMResponse, ChatMessage, Itinerary } from '../../types/index.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { extractAndRepairJSON } from '../../utils/jsonRepair.js';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Returns ordered list of cloud providers to try, based on LLM_PROVIDER setting. */
function cloudOrder(provider: string): Array<'groq' | 'gemini'> {
  if (provider === 'gemini') return ['gemini', 'groq'];
  return ['groq', 'gemini']; // default: groq first
}

export class LLMService {
  private readonly ollama: OllamaClient;
  private readonly groq: GroqClient;
  private readonly gemini: GeminiClient;

  constructor() {
    this.ollama = new OllamaClient();
    this.groq = new GroqClient();
    this.gemini = new GeminiClient();
  }

  /** Non-streaming call — used by /chat/message */
  async processMessage(
    userMessage: string,
    conversationHistory: ChatMessage[],
    currentItinerary: Itinerary | null,
    realDataContext?: string
  ): Promise<LLMResponse> {
    const messages = this.buildMessages(userMessage, conversationHistory, currentItinerary, realDataContext, false);
    const raw = await this.callLLM(messages, userMessage, conversationHistory, currentItinerary, realDataContext);
    return this.parseResponse(raw);
  }

  /** Streaming call — used by /chat/stream (SSE). */
  async streamMessage(
    userMessage: string,
    conversationHistory: ChatMessage[],
    currentItinerary: Itinerary | null,
    onToken: (token: string) => void,
    realDataContext?: string
  ): Promise<LLMResponse> {
    if (config.llmProvider === 'ollama') {
      const raw = await this.callLLM(
        this.buildMessages(userMessage, conversationHistory, currentItinerary, realDataContext, true),
        userMessage, conversationHistory, currentItinerary, realDataContext
      );
      onToken(raw);
      return this.parseResponse(raw);
    }

    const messages = this.buildMessages(userMessage, conversationHistory, currentItinerary, realDataContext);

    for (const name of cloudOrder(config.llmProvider)) {
      const client = name === 'groq' ? this.groq : this.gemini;
      if (!client.isConfigured()) continue;
      let full = '';
      try {
        const stream = name === 'groq'
          ? this.groq.chatStream(messages)
          : this.gemini.chatStream(messages);
        for await (const token of stream) {
          full += token;
          onToken(token);
        }
        return this.parseResponse(full);
      } catch (err) {
        logger.error(`${name} stream error`, { error: errMsg(err) });
        // Always try next provider — don't throw here
      }
    }

    // All cloud providers failed — fall back to Ollama non-streaming
    logger.warn('All streaming providers failed, falling back to Ollama');
    const raw = await this.callLLM(messages, userMessage, conversationHistory, currentItinerary, realDataContext);
    onToken(raw);
    return this.parseResponse(raw);
  }

  private buildMessages(
    userMessage: string,
    history: ChatMessage[],
    currentItinerary: Itinerary | null,
    realDataContext?: string,
    useCompactPrompt = false
  ): Msg[] {
    const hasItinerary = currentItinerary !== null;

    let systemContent: string;
    if (useCompactPrompt) {
      // Small Ollama model: compact prompt + minimal context to fit in limited context window
      const ctx = buildOllamaContext(hasItinerary, realDataContext, currentItinerary);
      systemContent = OLLAMA_COMPACT_PROMPT + '\n\n' + ctx;
    } else {
      // Cloud model (Gemini/Groq): full prompt + rich context
      systemContent =
        YATRA_SYSTEM_PROMPT + '\n\n' +
        buildItineraryContext(userMessage, history, hasItinerary, realDataContext, currentItinerary);
    }

    const messages: Msg[] = [{ role: 'system', content: systemContent }];

    // Include recent conversation history (skip raw JSON blobs)
    for (const msg of history.slice(-4)) {
      if (msg.role !== 'user' && msg.role !== 'assistant') continue;
      let content = msg.content;
      if (content.startsWith('{"type":"itinerary"')) {
        try {
          const obj = JSON.parse(content) as { type: string; title?: string };
          content = `[Itinerary generated: "${obj.title ?? 'your trip'}"]`;
        } catch { content = '[Itinerary generated]'; }
      }
      messages.push({ role: msg.role, content });
    }

    messages.push({ role: 'user', content: userMessage });
    return messages;
  }

  private async callLLM(
    messages: Msg[],
    userMessage?: string,
    history?: ChatMessage[],
    currentItinerary?: Itinerary | null,
    realDataContext?: string
  ): Promise<string> {
    // Try cloud providers in priority order (any failure → next provider)
    if (config.llmProvider !== 'ollama') {
      for (const name of cloudOrder(config.llmProvider)) {
        const client = name === 'groq' ? this.groq : this.gemini;
        if (!client.isConfigured()) continue;
        try {
          logger.debug(`Using ${name}`);
          return await client.chat(messages);
        } catch (err) {
          logger.warn(`${name} failed, trying next`, { error: errMsg(err) });
        }
      }
    }

    // Ollama fallback — rebuild with compact prompt so it fits small context window
    const ollamaUp = await this.ollama.isAvailable();
    if (ollamaUp) {
      logger.debug('Using Ollama (compact prompt)');
      const compact = userMessage !== undefined
        ? this.buildMessages(userMessage, history ?? [], currentItinerary ?? null, realDataContext, true)
        : messages;
      return this.ollama.chat(compact);
    }

    throw new Error(
      'No LLM provider available. Set GROQ_API_KEY + LLM_PROVIDER=groq in backend/.env and restart.'
    );
  }

  parseResponse(raw: string): LLMResponse {
    try {
      const repaired = extractAndRepairJSON(raw);
      const parsed = JSON.parse(repaired) as LLMResponse;
      if (!parsed.type) throw new Error('Missing type field');

      if ((parsed.type === 'itinerary' || parsed.type === 'modification') && parsed.itinerary) {
        parsed.itinerary.generatedAt = Date.now();
        if (!parsed.itinerary.id) parsed.itinerary.id = `itin-${Date.now()}`;
      }

      return parsed;
    } catch (err) {
      logger.warn('LLM response was not valid JSON, treating as plain answer', {
        preview: raw.slice(0, 200),
        err: err instanceof Error ? err.message : String(err),
      });
      return { type: 'answer', answer: raw.replace(/```json|```/g, '').trim().slice(0, 2000) };
    }
  }
}
