import axios from 'axios';

export interface OSMPlace {
  name: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'transport';
  subtype?: string;
  lat?: number;
  lon?: number;
  address?: string;
  rating?: string;
  cuisine?: string;
  stars?: number;
  website?: string;
}

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await axios.get(NOMINATIM_ENDPOINT, {
      params: { q: `${city}, India`, format: 'json', limit: 1, countrycodes: 'in' },
      headers: { 'User-Agent': 'YatraAI/1.0 travel-planner' },
      timeout: 8000,
    });
    if (res.data?.[0]) {
      return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) };
    }
  } catch { /* ignore */ }
  return null;
}

function buildOverpassQuery(lat: number, lon: number, radiusM = 5000): string {
  return `[out:json][timeout:20];
(
  node["tourism"="hotel"](around:${radiusM},${lat},${lon});
  node["tourism"="guest_house"](around:${radiusM},${lat},${lon});
  node["tourism"="hostel"](around:${radiusM},${lat},${lon});
  node["amenity"="restaurant"](around:3000,${lat},${lon});
  node["amenity"="cafe"](around:3000,${lat},${lon});
  node["tourism"="attraction"](around:${radiusM},${lat},${lon});
  node["historic"](around:${radiusM},${lat},${lon});
  node["leisure"="park"](around:${radiusM},${lat},${lon});
  node["amenity"="place_of_worship"](around:${radiusM},${lat},${lon});
);
out body 60;`;
}

function parseOSMElement(el: Record<string, unknown>): OSMPlace | null {
  const tags = (el['tags'] ?? {}) as Record<string, string>;
  const name = tags['name'] ?? tags['name:en'] ?? '';
  if (!name || name.length < 2) return null;

  const lat = typeof el['lat'] === 'number' ? el['lat'] : undefined;
  const lon = typeof el['lon'] === 'number' ? el['lon'] : undefined;

  if (tags['tourism'] === 'hotel' || tags['tourism'] === 'guest_house' || tags['tourism'] === 'hostel') {
    const stars = tags['stars'] ? parseInt(tags['stars']) : undefined;
    return {
      name,
      type: 'hotel',
      subtype: tags['tourism'],
      lat,
      lon,
      stars: stars && stars >= 1 && stars <= 5 ? stars : undefined,
      website: tags['website'],
    };
  }

  if (tags['amenity'] === 'restaurant' || tags['amenity'] === 'cafe') {
    return {
      name,
      type: 'restaurant',
      subtype: tags['amenity'],
      lat,
      lon,
      cuisine: tags['cuisine'],
    };
  }

  if (tags['tourism'] === 'attraction' || tags['historic'] || tags['amenity'] === 'place_of_worship' || tags['leisure'] === 'park') {
    return {
      name,
      type: 'attraction',
      subtype: tags['tourism'] ?? tags['historic'] ?? tags['amenity'] ?? tags['leisure'],
      lat,
      lon,
    };
  }

  return null;
}

export interface CityPlaces {
  city: string;
  hotels: OSMPlace[];
  restaurants: OSMPlace[];
  attractions: OSMPlace[];
}

export async function fetchCityPlaces(city: string): Promise<CityPlaces> {
  const empty: CityPlaces = { city, hotels: [], restaurants: [], attractions: [] };

  const coords = await geocodeCity(city);
  if (!coords) return empty;

  try {
    const res = await axios.post(OVERPASS_ENDPOINT, buildOverpassQuery(coords.lat, coords.lon), {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 25000,
    });

    const elements: Record<string, unknown>[] = res.data?.elements ?? [];
    const places = elements.map(parseOSMElement).filter(Boolean) as OSMPlace[];

    const hotels = dedupeByName(places.filter((p) => p.type === 'hotel')).slice(0, 4);
    const restaurants = dedupeByName(places.filter((p) => p.type === 'restaurant')).slice(0, 4);
    const attractions = dedupeByName(places.filter((p) => p.type === 'attraction')).slice(0, 6);

    return { city, hotels, restaurants, attractions };
  } catch {
    return empty;
  }
}

function dedupeByName(places: OSMPlace[]): OSMPlace[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    const key = p.name.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatPlacesForLLM(data: CityPlaces): string {
  const lines: string[] = [];
  if (data.hotels.length) {
    lines.push(`Hotels in ${data.city}:`);
    data.hotels.forEach((h) => {
      const stars = h.stars ? ` (${h.stars}★)` : '';
      lines.push(`  • ${h.name}${stars}`);
    });
  }
  if (data.restaurants.length) {
    lines.push(`Restaurants/Cafes in ${data.city}:`);
    data.restaurants.forEach((r) => {
      const cuisine = r.cuisine ? ` [${r.cuisine}]` : '';
      lines.push(`  • ${r.name}${cuisine}`);
    });
  }
  if (data.attractions.length) {
    lines.push(`Attractions in ${data.city}:`);
    data.attractions.forEach((a) => {
      const sub = a.subtype ? ` (${a.subtype})` : '';
      lines.push(`  • ${a.name}${sub}`);
    });
  }
  return lines.join('\n');
}
