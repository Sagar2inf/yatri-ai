import { Router } from 'express';
import type { SessionStore } from '../services/session/store.js';
import type { ItineraryService } from '../services/itinerary/index.js';
import { sessionRouter } from './session.js';
import { chatRouter } from './chat.js';
import { itineraryRouter } from './itinerary.js';
import { llmRouter } from './llm.js';

export function createRouter(store: SessionStore, itineraryService: ItineraryService): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  router.use('/session', sessionRouter(store));
  router.use('/chat', chatRouter(itineraryService));
  router.use('/itinerary', itineraryRouter(itineraryService));
  router.use('/llm', llmRouter());

  return router;
}
