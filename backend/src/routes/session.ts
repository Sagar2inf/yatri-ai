import { Router } from 'express';
import type { Request, Response } from 'express';
import type { SessionStore } from '../services/session/store.js';
import type { ApiResponse } from '../types/index.js';

export function sessionRouter(store: SessionStore): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const session = await store.get(req.sessionId);
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' } satisfies ApiResponse);
      return;
    }

    const response: ApiResponse = {
      success: true,
      sessionId: session.id,
      data: {
        id: session.id,
        createdAt: session.createdAt,
        lastActive: session.lastActive,
        hasItinerary: session.currentItinerary !== null,
        messageCount: session.conversationHistory.length,
      },
    };
    res.json(response);
  });

  router.delete('/', async (req: Request, res: Response) => {
    await store.delete(req.sessionId);
    res.clearCookie('yatra_session');
    res.json({ success: true } satisfies ApiResponse);
  });

  return router;
}
