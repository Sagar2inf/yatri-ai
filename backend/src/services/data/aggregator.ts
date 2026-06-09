import { fetchCityPlaces, formatPlacesForLLM } from './overpass.js';
import { fetchCityWeather, formatWeatherForLLM } from './weather.js';
import { fetchCitySummary, formatWikiForLLM } from './wikipedia.js';
import { findTrainRoutes, formatTrainsForLLM } from './railways.js';
import { optimizeDestinations, estimateDistanceKm } from '../route/optimizer.js';
import { buildTripGraph, parseUserPreferences, type UserPreferences } from '../graph/index.js';

const MAJOR_INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Jodhpur', 'Jaisalmer', 'Udaipur', 'Agra',
  'Varanasi', 'Goa', 'Panaji', 'Kochi', 'Thiruvananthapuram', 'Mysuru', 'Mysore',
  'Amritsar', 'Chandigarh', 'Shimla', 'Manali', 'Darjeeling', 'Dehradun',
  'Haridwar', 'Rishikesh', 'Puri', 'Bhubaneswar', 'Aurangabad', 'Coimbatore',
  'Madurai', 'Ooty', 'Kodaikanal', 'Leh', 'Srinagar', 'Jammu', 'Pondicherry',
  'Hampi', 'Khajuraho', 'Bodh Gaya', 'Ajmer', 'Pushkar', 'Mount Abu',
];

export function extractCitiesFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return MAJOR_INDIAN_CITIES.filter((city) =>
    lower.includes(city.toLowerCase())
  );
}

export interface AggregatedContext {
  cities: string[];
  contextString: string;
  dataFetched: boolean;
}

export async function aggregateRealData(
  cities: string[],
  originCity?: string,
  totalDays?: number,
  userMessage?: string,
  preferences?: UserPreferences
): Promise<AggregatedContext> {
  if (!cities.length) {
    return { cities: [], contextString: '', dataFetched: false };
  }

  // Limit to at most 3 cities to keep latency reasonable
  const targetCities = cities.slice(0, 3);

  // Compute optimal visit order before fetching — this becomes a hard instruction to the LLM
  const routeOpt = originCity
    ? optimizeDestinations(originCity, targetCities)
    : { ordered: targetCities, optimized: false, routeDescription: targetCities.join(' → ') };
  const orderedCities = routeOpt.ordered;

  const [placesResults, weatherResults, wikiResults] = await Promise.allSettled([
    Promise.all(orderedCities.map((c) => fetchCityPlaces(c))),
    Promise.all(orderedCities.map((c) => fetchCityWeather(c))),
    Promise.all(orderedCities.map((c) => fetchCitySummary(c))),
  ]);

  const placesData = placesResults.status === 'fulfilled' ? placesResults.value : [];
  const weatherData = weatherResults.status === 'fulfilled' ? weatherResults.value : [];
  const wikiData = wikiResults.status === 'fulfilled' ? wikiResults.value : [];

  // Train routes in the OPTIMIZED order
  const trainSections: string[] = [];
  const routePairs: Array<[string, string]> = [];
  if (originCity && orderedCities[0]) {
    routePairs.push([originCity, orderedCities[0]]);
  }
  for (let i = 0; i < orderedCities.length - 1; i++) {
    routePairs.push([orderedCities[i], orderedCities[i + 1]]);
  }
  // Return leg
  if (orderedCities.length > 0 && originCity) {
    routePairs.push([orderedCities[orderedCities.length - 1], originCity]);
  }

  for (const [from, to] of routePairs) {
    const routes = findTrainRoutes(from, to);
    if (routes.length) {
      const distKm = estimateDistanceKm(from, to);
      const distNote = distKm ? ` (~${distKm} km)` : '';
      trainSections.push(`Train options ${from} → ${to}${distNote}:\n${formatTrainsForLLM(routes)}`);
    }
  }

  const sections: string[] = [];
  sections.push('=== REAL DATA FROM APIs (use this data, do not invent) ===\n');

  // Mandatory route order — LLM MUST follow this sequence
  if (originCity) {
    sections.push(`--- MANDATORY ROUTE ORDER (geographically optimized, no backtracking) ---`);
    sections.push(`Visit sequence: ${routeOpt.routeDescription}`);
    if (routeOpt.optimized) {
      sections.push(`NOTE: This order was computed to minimize travel distance. DO NOT reorder destinations.`);
    }
    sections.push(`RULE: Never visit the same city twice unless it is the origin/departure city. No A→B→A patterns.\n`);
  }

  // Wikipedia summaries
  for (const wiki of wikiData) {
    if (wiki) sections.push(formatWikiForLLM(wiki));
  }

  // Weather
  for (const wx of weatherData) {
    sections.push(formatWeatherForLLM(wx));
  }

  // Graph-based optimization analysis — time allocation, heat advisory, en-route attractions
  if (originCity && orderedCities.length > 0) {
    try {
      const prefs = preferences ?? parseUserPreferences(userMessage ?? '');
      const graph = buildTripGraph(
        originCity,
        orderedCities,
        weatherData,
        totalDays ?? orderedCities.length * 2,
        prefs
      );
      sections.push('\n' + graph.summaryLines.join('\n'));
    } catch {
      // graph analysis is advisory only — never block generation
    }
  }

  // Train routes
  if (trainSections.length) {
    sections.push('\n--- Train Routes ---');
    sections.push(...trainSections);
  }

  // Hotels / restaurants / attractions
  for (const places of placesData) {
    const formatted = formatPlacesForLLM(places);
    if (formatted) {
      sections.push(`\n--- ${places.city} ---`);
      sections.push(formatted);
    }
  }

  sections.push('\n=== END REAL DATA ===');

  // Hard cap: Groq free tier has 12k TPM. System prompt is ~4k tokens, output needs ~7k.
  // Keep context under 10k chars (~2.5k tokens) to stay safely within budget.
  const MAX_CONTEXT_CHARS = 10000;
  let contextString = sections.join('\n');
  if (contextString.length > MAX_CONTEXT_CHARS) {
    contextString = contextString.slice(0, MAX_CONTEXT_CHARS) + '\n[context trimmed for token limit]';
  }
  return { cities: targetCities, contextString, dataFetched: true };
}
