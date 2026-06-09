import type { Request, Response, NextFunction } from 'express';
import type { SessionStore } from '../services/session/store.js';
import { logger } from '../utils/logger.js';

const SESSION_COOKIE = 'yatra_session';

export function sessionMiddleware(store: SessionStore) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      'unknown';

    let sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;

    if (sessionId) {
      const exists = await store.exists(sessionId);
      if (!exists) {
        sessionId = undefined;
      }
    }

    if (!sessionId) {
      const session = await store.create(clientIp);
      sessionId = session.id;
      logger.debug('New session created', { sessionId, ip: clientIp });
    }

    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env['NODE_ENV'] === 'production',
    });

    req.sessionId = sessionId;
    req.clientIp = clientIp;

    await store.touch(sessionId);
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
      clientIp: string;
    }
  }
}
