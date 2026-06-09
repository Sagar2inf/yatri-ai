import type { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import type { SessionData, ChatMessage, Itinerary, TripContext } from '../../types/index.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

const SESSION_PREFIX = 'session:';

export class SessionStore {
  constructor(private readonly redis: Redis) {}

  private key(sessionId: string): string {
    return `${SESSION_PREFIX}${sessionId}`;
  }

  async create(ip: string): Promise<SessionData> {
    const session: SessionData = {
      id: uuidv4(),
      ip,
      createdAt: Date.now(),
      lastActive: Date.now(),
      conversationHistory: [],
      currentItinerary: null,
      tripContext: null,
    };
    await this.save(session);
    logger.debug('Session created', { id: session.id, ip });
    return session;
  }

  async get(sessionId: string): Promise<SessionData | null> {
    try {
      const raw = await this.redis.get(this.key(sessionId));
      if (!raw) return null;
      return JSON.parse(raw) as SessionData;
    } catch (err) {
      logger.error('Session GET error', { sessionId, err });
      return null;
    }
  }

  async save(session: SessionData): Promise<void> {
    try {
      await this.redis.setex(
        this.key(session.id),
        config.redis.sessionTTL,
        JSON.stringify(session)
      );
    } catch (err) {
      logger.error('Session SAVE error', { id: session.id, err });
    }
  }

  async touch(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;
    session.lastActive = Date.now();
    await this.save(session);
  }

  async appendMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;
    session.conversationHistory.push(message);
    session.lastActive = Date.now();
    if (session.conversationHistory.length > 50) {
      session.conversationHistory = session.conversationHistory.slice(-50);
    }
    await this.save(session);
  }

  async saveItinerary(sessionId: string, itinerary: Itinerary): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;
    session.currentItinerary = itinerary;
    session.lastActive = Date.now();
    await this.save(session);
  }

  async updateTripContext(sessionId: string, context: Partial<TripContext>): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;
    session.tripContext = { ...(session.tripContext ?? {}), ...context };
    session.lastActive = Date.now();
    await this.save(session);
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId));
  }

  async exists(sessionId: string): Promise<boolean> {
    return (await this.redis.exists(this.key(sessionId))) === 1;
  }
}
