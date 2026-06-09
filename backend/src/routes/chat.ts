import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ItineraryService } from '../services/itinerary/index.js';
import { chatRateLimit } from '../middleware/rateLimit.js';
import type { ApiResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

const MessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

function friendlyError(errMsg: string): string {
  const m = errMsg.toLowerCase();

  if (m.includes('no llm provider') || m.includes('econnrefused')) {
    return 'AI service unreachable. Add GEMINI_API_KEY to backend/.env and set LLM_PROVIDER=gemini, then restart the server.';
  }
  if (m.includes('paste_your') || m.includes('invalid api key') || m.includes('please pass a valid')) {
    return 'API key not set. Open backend/.env, replace PASTE_YOUR_GEMINI_API_KEY_HERE with your real Gemini key (get one free at aistudio.google.com), then restart.';
  }
  if (m.includes('401') || m.includes('invalid_api_key') || m.includes('unauthorized')) {
    return 'Invalid API key. Check GEMINI_API_KEY (or GROQ_API_KEY) in backend/.env and restart the server.';
  }
  if (m.includes('403') || m.includes('access denied')) {
    return 'API key does not have permission. Make sure Gemini API is enabled for your Google account.';
  }
  if (m.includes('timeout') || m.includes('timed out')) {
    return 'The AI took too long to respond. Try again — the model may be warming up.';
  }
  if (m.includes('rate limit') || m.includes('429') || m.includes('switching provider')) {
    return 'All AI providers are rate-limited right now. Please wait 30 seconds and try again.';
  }
  if (m.includes('empty response') || m.includes('not valid json')) {
    return 'The AI returned an incomplete response. Please try again.';
  }
  return `AI error: ${errMsg.slice(0, 200)}`;
}

export function chatRouter(itineraryService: ItineraryService): Router {
  const router = Router();

  // ── Non-streaming endpoint (simple REST) ──────────────────────────────────
  router.post('/message', chatRateLimit, async (req: Request, res: Response): Promise<void> => {
    const parsed = MessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid message' } satisfies ApiResponse);
      return;
    }

    logger.info('Chat message', { sessionId: req.sessionId, len: parsed.data.message.length });

    try {
      const response = await itineraryService.processChat(req.sessionId, parsed.data.message);
      res.json({ success: true, data: response } satisfies ApiResponse);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error('Chat error', { sessionId: req.sessionId, error: errMsg });
      res.status(500).json({ success: false, error: friendlyError(errMsg) } satisfies ApiResponse);
    }
  });

  // ── SSE streaming endpoint (tokens stream as they arrive) ─────────────────
  router.post('/stream', chatRateLimit, async (req: Request, res: Response): Promise<void> => {
    const parsed = MessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid message' });
      return;
    }

    const { message } = parsed.data;
    logger.info('Chat stream', { sessionId: req.sessionId, len: message.length });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Keep-alive ping every 15s to prevent proxy timeout
    const ping = setInterval(() => res.write(': ping\n\n'), 15000);
    req.on('close', () => clearInterval(ping));

    try {
      send('status', { message: 'Connected...' });

      const response = await itineraryService.processChat(
        req.sessionId,
        message,
        (token) => send('token', { token })
      );

      clearInterval(ping);
      send('complete', response);
      res.end();
    } catch (err) {
      clearInterval(ping);
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error('Stream error', { sessionId: req.sessionId, error: errMsg });
      send('error', { error: friendlyError(errMsg) });
      res.end();
    }
  });

  return router;
}
