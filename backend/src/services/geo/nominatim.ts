import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import type { Coordinates } from '../../types/index.js';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
}

const INDIA_COORDS_CACHE: Record<string, Coordinates> = {
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Jodhpur': { lat: 26.2389, lng: 73.0243 },
  'Udaipur': { lat: 24.5854, lng: 73.7125 },
  'Jaisalmer': { lat: 26.9157, lng: 70.9083 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  'Panaji': { lat: 15.4909, lng: 73.8278 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'Alleppey': { lat: 9.4981, lng: 76.3388 },
  'Munnar': { lat: 10.0889, lng: 77.0595 },
  'Thekkady': { lat: 9.6000, lng: 77.1600 },
  'Shimla': { lat: 31.1048, lng: 77.1734 },
  'Manali': { lat: 32.2396, lng: 77.1887 },
  'Leh': { lat: 34.1526, lng: 77.5771 },
  'Darjeeling': { lat: 27.0360, lng: 88.2627 },
  'Gangtok': { lat: 27.3314, lng: 88.6138 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Shillong': { lat: 25.5788, lng: 91.8933 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Haridwar': { lat: 29.9457, lng: 78.1642 },
  'Rishikesh': { lat: 30.0869, lng: 78.2676 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Khajuraho': { lat: 24.8318, lng: 79.9199 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Hampi': { lat: 15.3350, lng: 76.4600 },
  'Mysuru': { lat: 12.2958, lng: 76.6394 },
  'Ooty': { lat: 11.4102, lng: 76.6950 },
  'Coorg': { lat: 12.3375, lng: 75.8069 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Pondicherry': { lat: 11.9416, lng: 79.8083 },
  'Puri': { lat: 19.8135, lng: 85.8312 },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'Rann of Kutch': { lat: 23.7337, lng: 69.8597 },
  'Pushkar': { lat: 26.4899, lng: 74.5514 },
  'Mount Abu': { lat: 24.5926, lng: 72.7156 },
  'Bikaner': { lat: 28.0229, lng: 73.3119 },
};

export class NominatimClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.nominatim.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': config.nominatim.userAgent,
      },
    });
  }

  async geocode(location: string): Promise<Coordinates | null> {
    const normalized = location.trim();

    const cached = INDIA_COORDS_CACHE[normalized];
    if (cached) return cached;

    try {
      await new Promise((res) => setTimeout(res, 1000));

      const response = await this.client.get<NominatimResult[]>('/search', {
        params: {
          q: `${normalized}, India`,
          format: 'json',
          limit: 1,
          countrycodes: 'in',
        },
      });

      if (response.data.length === 0) return null;

      const result = response.data[0];
      if (!result) return null;

      const coords: Coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };

      INDIA_COORDS_CACHE[normalized] = coords;
      return coords;
    } catch (err) {
      logger.warn('Nominatim geocode failed', { location, err });
      return null;
    }
  }

  async geocodeBatch(locations: string[]): Promise<Map<string, Coordinates | null>> {
    const result = new Map<string, Coordinates | null>();

    for (const loc of locations) {
      result.set(loc, await this.geocode(loc));
    }

    return result;
  }
}
