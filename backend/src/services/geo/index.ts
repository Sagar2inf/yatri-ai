import { NominatimClient } from './nominatim.js';
import type { Itinerary } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class GeoService {
  private readonly nominatim: NominatimClient;

  constructor() {
    this.nominatim = new NominatimClient();
  }

  async enrichItineraryWithCoordinates(itinerary: Itinerary): Promise<Itinerary> {
    const locations = itinerary.days.map((d) => d.location).filter(Boolean);
    const uniqueLocations = [...new Set(locations)];

    logger.debug('Enriching itinerary with coordinates', { locations: uniqueLocations });

    const coordsMap = await this.nominatim.geocodeBatch(uniqueLocations);

    const enriched = {
      ...itinerary,
      days: itinerary.days.map((day) => ({
        ...day,
        coordinates: coordsMap.get(day.location) ?? day.coordinates ?? null,
      })),
    };

    return enriched;
  }

  async getCoordinates(location: string) {
    return this.nominatim.geocode(location);
  }
}
