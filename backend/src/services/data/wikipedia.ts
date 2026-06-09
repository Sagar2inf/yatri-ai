import axios from 'axios';

export interface PlaceSummary {
  city: string;
  title: string;
  summary: string;
  url: string;
}

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

const CITY_ALIASES: Record<string, string> = {
  bengaluru: 'Bangalore',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  mysore: 'Mysore',
  ooty: 'Ooty',
  panaji: 'Panaji,_Goa',
  puri: 'Puri,_Odisha',
};

function resolveTitle(city: string): string {
  const key = city.toLowerCase().replace(/\s+/g, '_');
  return CITY_ALIASES[key] ?? city.replace(/\s+/g, '_');
}

export async function fetchCitySummary(city: string): Promise<PlaceSummary | null> {
  const title = resolveTitle(city);
  try {
    const res = await axios.get(`${WIKI_API}/${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': 'YatraAI/1.0 travel-planner' },
      timeout: 8000,
    });

    const data = res.data;
    const extract: string = data?.extract ?? '';
    // Limit to first 600 chars so we don't flood LLM context
    const trimmed = extract.length > 600 ? extract.slice(0, 597) + '...' : extract;

    return {
      city,
      title: data?.title ?? city,
      summary: trimmed,
      url: data?.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${title}`,
    };
  } catch {
    return null;
  }
}

export function formatWikiForLLM(summary: PlaceSummary): string {
  return `About ${summary.city}: ${summary.summary}`;
}
