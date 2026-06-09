import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ItineraryService } from '../services/itinerary/index.js';
import type { ApiResponse } from '../types/index.js';

export function itineraryRouter(itineraryService: ItineraryService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response): Promise<void> => {
    const itinerary = await itineraryService.getItinerary(req.sessionId);
    if (!itinerary) {
      res.status(404).json({ success: false, error: 'No itinerary found for this session' } satisfies ApiResponse);
      return;
    }
    res.json({ success: true, data: itinerary } satisfies ApiResponse);
  });

  return router;
}
