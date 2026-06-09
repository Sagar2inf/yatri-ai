import { estimateDistanceKm } from '../route/optimizer.js';
import type { WeatherForecast } from '../data/weather.js';

// ─── City profiles ────────────────────────────────────────────────────────────

interface CityProfile {
  importanceWeight: number;  // 1-10: drives time/budget share
  minDays: number;
  maxDays: number;
  recommendedDays: number;
  dailyExpense: Record<string, number>;  // budget/economy/mid/premium/luxury → INR/person/day
  cityType: 'metro' | 'major-tourist' | 'heritage' | 'religious' | 'hill-station' | 'beach' | 'wildlife' | 'small-town';
}

const CITY_PROFILES: Record<string, CityProfile> = {
  delhi:      { importanceWeight: 7, minDays: 1, maxDays: 3, recommendedDays: 1.5, cityType: 'metro',         dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 12000 } },
  mumbai:     { importanceWeight: 7, minDays: 1, maxDays: 3, recommendedDays: 2,   cityType: 'metro',         dailyExpense: { budget: 800, economy: 1500, mid: 3000, premium: 6000, luxury: 15000 } },
  kolkata:    { importanceWeight: 7, minDays: 1, maxDays: 3, recommendedDays: 2,   cityType: 'metro',         dailyExpense: { budget: 600, economy: 1200, mid: 2200, premium: 4500, luxury: 10000 } },
  bengaluru:  { importanceWeight: 5, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'metro',         dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 12000 } },
  bangalore:  { importanceWeight: 5, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'metro',         dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 12000 } },
  chennai:    { importanceWeight: 6, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'metro',         dailyExpense: { budget: 650, economy: 1200, mid: 2200, premium: 4500, luxury: 10000 } },
  hyderabad:  { importanceWeight: 6, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'metro',         dailyExpense: { budget: 650, economy: 1200, mid: 2200, premium: 4500, luxury: 10000 } },
  jaipur:     { importanceWeight: 9, minDays: 2, maxDays: 3, recommendedDays: 2.5, cityType: 'major-tourist', dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 12000 } },
  agra:       { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'major-tourist', dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  varanasi:   { importanceWeight: 9, minDays: 2, maxDays: 3, recommendedDays: 2.5, cityType: 'heritage',      dailyExpense: { budget: 600, economy: 1000, mid: 2000, premium: 4000, luxury: 9000 } },
  jodhpur:    { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'heritage',      dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  udaipur:    { importanceWeight: 9, minDays: 2, maxDays: 3, recommendedDays: 2,   cityType: 'heritage',      dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 12000 } },
  jaisalmer:  { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'heritage',      dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  ajmer:      { importanceWeight: 5, minDays: 0.5, maxDays: 1, recommendedDays: 1, cityType: 'religious',     dailyExpense: { budget: 500, economy: 900, mid: 1600, premium: 3000, luxury: 7000 } },
  pushkar:    { importanceWeight: 6, minDays: 1, maxDays: 1, recommendedDays: 1,   cityType: 'religious',     dailyExpense: { budget: 500, economy: 900, mid: 1600, premium: 3000, luxury: 7000 } },
  amritsar:   { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'religious',     dailyExpense: { budget: 600, economy: 1000, mid: 1800, premium: 3500, luxury: 8000 } },
  shimla:     { importanceWeight: 8, minDays: 2, maxDays: 3, recommendedDays: 2,   cityType: 'hill-station',  dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 11000 } },
  manali:     { importanceWeight: 9, minDays: 2, maxDays: 4, recommendedDays: 3,   cityType: 'hill-station',  dailyExpense: { budget: 800, economy: 1500, mid: 2800, premium: 5500, luxury: 12000 } },
  darjeeling: { importanceWeight: 8, minDays: 2, maxDays: 3, recommendedDays: 2,   cityType: 'hill-station',  dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 11000 } },
  goa:        { importanceWeight: 9, minDays: 3, maxDays: 5, recommendedDays: 3.5, cityType: 'beach',         dailyExpense: { budget: 800, economy: 1500, mid: 2800, premium: 5500, luxury: 13000 } },
  kochi:      { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'major-tourist', dailyExpense: { budget: 650, economy: 1200, mid: 2200, premium: 4500, luxury: 10000 } },
  alleppey:   { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'beach',         dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 12000 } },
  munnar:     { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'hill-station',  dailyExpense: { budget: 700, economy: 1300, mid: 2500, premium: 5000, luxury: 11000 } },
  ooty:       { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'hill-station',  dailyExpense: { budget: 700, economy: 1200, mid: 2300, premium: 4500, luxury: 10000 } },
  mysuru:     { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'heritage',      dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  mysore:     { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'heritage',      dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  hampi:      { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'heritage',      dailyExpense: { budget: 500, economy: 900, mid: 1700, premium: 3500, luxury: 7500 } },
  pondicherry:{ importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'beach',         dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  madurai:    { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'religious',     dailyExpense: { budget: 600, economy: 1000, mid: 1800, premium: 3500, luxury: 8000 } },
  khajuraho:  { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'heritage',      dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  leh:        { importanceWeight: 9, minDays: 3, maxDays: 5, recommendedDays: 4,   cityType: 'hill-station',  dailyExpense: { budget: 900, economy: 1600, mid: 3000, premium: 6000, luxury: 14000 } },
  srinagar:   { importanceWeight: 8, minDays: 2, maxDays: 3, recommendedDays: 2.5, cityType: 'hill-station',  dailyExpense: { budget: 800, economy: 1500, mid: 2800, premium: 5500, luxury: 12000 } },
  haridwar:   { importanceWeight: 7, minDays: 1, maxDays: 1.5, recommendedDays: 1, cityType: 'religious',     dailyExpense: { budget: 500, economy: 900, mid: 1700, premium: 3500, luxury: 7500 } },
  rishikesh:  { importanceWeight: 8, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'religious',     dailyExpense: { budget: 600, economy: 1000, mid: 1900, premium: 3800, luxury: 8500 } },
  dehradun:   { importanceWeight: 5, minDays: 0.5, maxDays: 1, recommendedDays: 0.5, cityType: 'small-town', dailyExpense: { budget: 600, economy: 1000, mid: 1900, premium: 3800, luxury: 8500 } },
  chandigarh: { importanceWeight: 5, minDays: 0.5, maxDays: 1, recommendedDays: 0.5, cityType: 'small-town', dailyExpense: { budget: 600, economy: 1100, mid: 2100, premium: 4200, luxury: 9000 } },
  puri:       { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'religious',     dailyExpense: { budget: 500, economy: 900, mid: 1700, premium: 3500, luxury: 7500 } },
  aurangabad: { importanceWeight: 7, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'heritage',      dailyExpense: { budget: 600, economy: 1100, mid: 2000, premium: 4000, luxury: 9000 } },
  'mount abu':{ importanceWeight: 6, minDays: 1, maxDays: 2, recommendedDays: 1.5, cityType: 'hill-station',  dailyExpense: { budget: 600, economy: 1100, mid: 2100, premium: 4200, luxury: 9500 } },
  bikaner:    { importanceWeight: 6, minDays: 1, maxDays: 1.5, recommendedDays: 1, cityType: 'heritage',      dailyExpense: { budget: 500, economy: 900, mid: 1700, premium: 3500, luxury: 7500 } },
};

// ─── En-route attractions ─────────────────────────────────────────────────────

interface EnRouteAttraction {
  name: string;
  description: string;
  detourKm: number;
  timeNeeded: string;
  category: string;
  skipIfRushed: boolean;  // set true for minor diversions users might want to skip
}

// Key: "from|to" (lowercased, canonical). Both directions registered.
const EN_ROUTE_ATTRACTIONS: Record<string, EnRouteAttraction[]> = {
  'delhi|jaipur': [
    { name: 'Neemrana Fort Palace', description: 'Stunning 15th-century hilltop fort hotel visible from NH-48; popular stop for breakfast or explore', detourKm: 0, timeNeeded: '1–2 hrs', category: 'heritage', skipIfRushed: false },
    { name: 'Alwar', description: 'Compact heritage city with Bala Quila fort and City Palace; good lunch stop', detourKm: 25, timeNeeded: '1–2 hrs', category: 'heritage', skipIfRushed: true },
  ],
  'delhi|agra': [
    { name: 'Mathura & Vrindavan', description: "Lord Krishna's birthplace town; vibrant ghats, temples and street food. 3km off Yamuna Expressway", detourKm: 3, timeNeeded: '2–3 hrs', category: 'spiritual', skipIfRushed: false },
    { name: 'Fatehpur Sikri', description: "Akbar's abandoned Mughal capital, 40km from Agra; on the way from Jaipur side", detourKm: 10, timeNeeded: '2 hrs', category: 'heritage', skipIfRushed: false },
  ],
  'jaipur|ajmer': [
    { name: 'Kishangarh', description: 'Midway town famous for Kishangarh marble art and a picturesque lake palace', detourKm: 5, timeNeeded: '1 hr', category: 'heritage', skipIfRushed: true },
  ],
  'ajmer|jaipur': [
    { name: 'Kishangarh', description: 'Midway town with lake palace and marble art heritage', detourKm: 5, timeNeeded: '1 hr', category: 'heritage', skipIfRushed: true },
  ],
  'jaipur|jodhpur': [
    { name: 'Ajmer Dargah Sharif', description: "One of India's most revered Sufi shrines; major spiritual stop en route", detourKm: 10, timeNeeded: '2–3 hrs', category: 'spiritual', skipIfRushed: false },
    { name: 'Pushkar Lake & Brahma Temple', description: 'Sacred lake and the only Brahma temple in the world; 15km from Ajmer', detourKm: 15, timeNeeded: '2–3 hrs', category: 'spiritual', skipIfRushed: false },
  ],
  'jodhpur|jaisalmer': [
    { name: 'Osian Temples & Dunes', description: 'Ancient Jain and Brahmin temples + camel dunes; 65km from Jodhpur on the highway', detourKm: 0, timeNeeded: '1.5–2 hrs', category: 'heritage+nature', skipIfRushed: false },
  ],
  'jaisalmer|jodhpur': [
    { name: 'Osian Temples & Dunes', description: 'Ancient Jain temples + sand dunes; good stop on the drive back', detourKm: 0, timeNeeded: '1.5–2 hrs', category: 'heritage+nature', skipIfRushed: false },
  ],
  'jaipur|udaipur': [
    { name: 'Chittorgarh Fort', description: "Rajasthan's largest fort; dramatic hilltop complex with towers, palaces, and temples. 40km detour", detourKm: 40, timeNeeded: '3–4 hrs', category: 'heritage', skipIfRushed: false },
    { name: 'Pushkar', description: 'Sacred lake town; worth an overnight if 2+ extra hours available', detourKm: 20, timeNeeded: '2–3 hrs', category: 'spiritual', skipIfRushed: true },
  ],
  'udaipur|jaipur': [
    { name: 'Chittorgarh Fort', description: "Rajasthan's largest fort on the return route; morning light is best", detourKm: 40, timeNeeded: '3–4 hrs', category: 'heritage', skipIfRushed: false },
  ],
  'mumbai|goa': [
    { name: 'Ganpatipule Beach Temple', description: 'Pristine beach with famous Ganesh temple; 365km from Mumbai, good overnight stop', detourKm: 10, timeNeeded: '2–3 hrs', category: 'spiritual+beach', skipIfRushed: true },
    { name: 'Ratnagiri', description: 'Alphonso mango country + Jaigad Fort; 330km from Mumbai', detourKm: 5, timeNeeded: '1–2 hrs', category: 'nature', skipIfRushed: true },
  ],
  'mumbai|pune': [
    { name: 'Lonavala & Khandala', description: 'Western Ghats hill stations with waterfalls, caves, and chikki sweet shops; 65km on expressway', detourKm: 0, timeNeeded: '2–3 hrs', category: 'nature', skipIfRushed: false },
  ],
  'pune|mumbai': [
    { name: 'Lonavala & Khandala', description: 'Western Ghats viewpoints and waterfalls on the expressway', detourKm: 0, timeNeeded: '2–3 hrs', category: 'nature', skipIfRushed: false },
  ],
  'delhi|shimla': [
    { name: 'Chandigarh (The City Beautiful)', description: "Corbusier-designed modern city with Rock Garden, Sukhna Lake; 260km from Delhi, good 2–4hr halt", detourKm: 0, timeNeeded: '2–4 hrs', category: 'urban', skipIfRushed: true },
    { name: 'Pinjore Gardens', description: 'Mughal gardens en route to Shimla; 1hr stop', detourKm: 5, timeNeeded: '1 hr', category: 'nature', skipIfRushed: true },
  ],
  'shimla|delhi': [
    { name: 'Chandigarh', description: 'Modern city with Rock Garden; good break stop on the way back', detourKm: 0, timeNeeded: '2–3 hrs', category: 'urban', skipIfRushed: true },
  ],
  'delhi|haridwar': [
    { name: 'Meerut', description: 'Historic city with 1857 uprising sites; halfway stop', detourKm: 5, timeNeeded: '1 hr', category: 'heritage', skipIfRushed: true },
  ],
  'haridwar|rishikesh': [
    { name: 'Chandi Devi Temple (cable car)', description: 'Hilltop temple with panoramic Ganges views; 20min from Haridwar', detourKm: 3, timeNeeded: '1.5 hrs', category: 'spiritual', skipIfRushed: true },
  ],
  'varanasi|bodh gaya': [
    { name: 'Sarnath', description: "Where Buddha gave his first sermon; stunning stupa 10km from Varanasi", detourKm: 10, timeNeeded: '2 hrs', category: 'spiritual', skipIfRushed: false },
  ],
  'chennai|mahabalipuram': [
    { name: 'DakshinaChitra Heritage Museum', description: 'Open-air museum of South Indian traditional homes; 25km south of Chennai', detourKm: 0, timeNeeded: '1.5 hrs', category: 'cultural', skipIfRushed: true },
  ],
  'kochi|munnar': [
    { name: 'Cheeyapara & Valara Waterfalls', description: 'Cascading waterfalls in Idukki forests; on NH-85', detourKm: 0, timeNeeded: '0.5–1 hr', category: 'nature', skipIfRushed: false },
  ],
  'kochi|alleppey': [
    { name: 'Mararikulam Beach', description: 'Less-crowded fishing village beach; 15km from Alleppey', detourKm: 5, timeNeeded: '1–2 hrs', category: 'beach', skipIfRushed: true },
  ],
  'amritsar|manali': [
    { name: 'Dharamshala & McLeod Ganj', description: "Dalai Lama's seat; Tibetan culture, monasteries, mountain views; 200km from Amritsar", detourKm: 20, timeNeeded: '4–6 hrs or overnight', category: 'spiritual+nature', skipIfRushed: false },
  ],
};

// ─── Heat advisory ────────────────────────────────────────────────────────────

export interface HeatAdvisory {
  risk: 'comfortable' | 'warm' | 'hot' | 'very-hot' | 'extreme';
  bestOutdoorHours: string;
  advisory: string;
  scheduleNote: string;
}

function getHeatAdvisory(temp: number | undefined, cityType: CityProfile['cityType']): HeatAdvisory {
  if (cityType === 'hill-station') {
    return {
      risk: 'comfortable',
      bestOutdoorHours: 'all day',
      advisory: 'Pleasant hill weather. Carry light woolens for evenings.',
      scheduleNote: 'Outdoor activities fine throughout the day.',
    };
  }
  const t = temp ?? 28;
  if (t < 25) return {
    risk: 'comfortable', bestOutdoorHours: 'all day',
    advisory: 'Pleasant weather, ideal for sightseeing.',
    scheduleNote: 'No heat restrictions. Full day sightseeing possible.',
  };
  if (t < 30) return {
    risk: 'warm', bestOutdoorHours: '7am–12pm and 4pm–7pm',
    advisory: 'Warm weather. Carry water. Short rest after lunch.',
    scheduleNote: 'Schedule heavy outdoor sightseeing before 12pm and after 4pm.',
  };
  if (t < 35) return {
    risk: 'hot', bestOutdoorHours: '6am–11am and 4pm–7pm',
    advisory: 'Hot weather. Mandatory midday rest (12pm–4pm). Carry 2L water.',
    scheduleNote: 'Plan ALL outdoor attractions before 11am or after 4pm. Use midday (12–4pm) for indoor attractions, lunch, rest.',
  };
  if (t < 40) return {
    risk: 'very-hot', bestOutdoorHours: '6am–10am and 5pm–7pm',
    advisory: 'Very hot. Outdoor ONLY 6–10am and 5–7pm. Shade + AC rest 10am–5pm.',
    scheduleNote: 'STRICTLY outdoor 6–10am only in morning, 5–7pm in evening. Book AC hotels. Carry ORS sachets. Sun safety critical.',
  };
  return {
    risk: 'extreme', bestOutdoorHours: '6am–9am',
    advisory: `Extreme heat ${t}°C. Outdoor maximum 6–9am. Rest in AC 9am–6pm. Do not exert in heat.`,
    scheduleNote: `EXTREME HEAT ALERT: Only 6–9am outdoor. Schedule 1 monument per morning max. Afternoon = AC hotel/shopping mall only.`,
  };
}

// ─── Graph node / analysis ────────────────────────────────────────────────────

export interface GraphNode {
  name: string;
  importanceWeight: number;
  allocatedDays: number;
  estimatedDailyExpenseINR: number;
  estimatedTotalExpenseINR: number;
  heatAdvisory: HeatAdvisory;
  enRouteAttractionsFromPrev: EnRouteAttraction[];
}

export interface GraphEdge {
  from: string;
  to: string;
  distanceKm: number | null;
}

export interface TripGraphAnalysis {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalAllocatedDays: number;
  summaryLines: string[];
}

export interface UserPreferences {
  skipEnRoute: boolean;
  preferFewCitiesLonger: boolean;
  budgetTier: string;
  pace: 'relaxed' | 'moderate' | 'fast';
}

export function parseUserPreferences(message: string): UserPreferences {
  const m = message.toLowerCase();
  return {
    skipEnRoute:
      /skip.*attract|no.*side|no.*en.?route|only.*main|direct.*route|just.*cit|no.*detour|no.*stop/i.test(m),
    preferFewCitiesLonger:
      /longer.*stay|more.*time|relaxed|slow.*travel|not.*rush|fewer.*stop|less.*stop/i.test(m),
    budgetTier:
      /luxury|5.*star/.test(m) ? 'luxury'
      : /premium|4.*star/.test(m) ? 'premium'
      : /mid.?range|3.*star/.test(m) ? 'mid'
      : /economy|decent|comfortable/.test(m) ? 'economy'
      : /budget|cheap|backpack|hostel/.test(m) ? 'budget'
      : 'mid',
    pace:
      /slow|relaxed|no.*rush|leisurely/.test(m) ? 'relaxed'
      : /fast|quick|efficient|packed/.test(m) ? 'fast'
      : 'moderate',
  };
}

function lookupProfile(city: string): CityProfile | null {
  const key = city.toLowerCase().trim();
  return CITY_PROFILES[key] ?? null;
}

function getEnRouteAttractions(from: string, to: string, skipEnRoute: boolean): EnRouteAttraction[] {
  if (skipEnRoute) return [];
  const key = `${from.toLowerCase()}|${to.toLowerCase()}`;
  return EN_ROUTE_ATTRACTIONS[key] ?? [];
}

export function buildTripGraph(
  origin: string,
  destinations: string[],
  weatherData: WeatherForecast[],
  totalDays: number,
  preferences: UserPreferences
): TripGraphAnalysis {
  const weatherByCity: Record<string, WeatherForecast> = {};
  for (const wx of weatherData) {
    weatherByCity[wx.city.toLowerCase()] = wx;
  }

  // Collect nodes with profiles
  const destProfiles = destinations.map((d) => {
    const profile = lookupProfile(d);
    const wx = weatherByCity[d.toLowerCase()];
    const heatAdvisory = getHeatAdvisory(wx?.currentTemp, profile?.cityType ?? 'major-tourist');
    return { name: d, profile, heatAdvisory, wx };
  });

  // Total importance weight across all destinations
  const totalWeight = destProfiles.reduce(
    (sum, n) => sum + (n.profile?.importanceWeight ?? 7),
    0
  );

  // Travel overhead: ~0.5 days per inter-city leg
  const legs = destinations.length + 1; // origin→d1, d1→d2, ..., dN→origin
  const travelDays = Math.min(legs * 0.5, totalDays * 0.3); // cap at 30% of trip
  const sightseeingDays = Math.max(totalDays - travelDays, 1);

  // Pace multiplier
  const paceMultiplier = preferences.pace === 'relaxed' ? 1.2 : preferences.pace === 'fast' ? 0.8 : 1.0;

  const nodes: GraphNode[] = [];
  let usedDays = 0;

  for (let i = 0; i < destProfiles.length; i++) {
    const { name, profile, heatAdvisory } = destProfiles[i];
    const weight = profile?.importanceWeight ?? 7;
    const share = weight / totalWeight;
    let allocatedDays = Math.round(share * sightseeingDays * paceMultiplier * 2) / 2; // round to 0.5

    // Clamp to profile min/max if known
    if (profile) {
      allocatedDays = Math.max(profile.minDays, Math.min(profile.maxDays, allocatedDays));
    }
    allocatedDays = Math.max(0.5, allocatedDays);
    usedDays += allocatedDays;

    const dailyExpense = profile?.dailyExpense[preferences.budgetTier] ?? 1500;
    const prevCity = i === 0 ? origin : destinations[i - 1];
    const enRoute = getEnRouteAttractions(prevCity, name, preferences.skipEnRoute);

    nodes.push({
      name,
      importanceWeight: weight,
      allocatedDays,
      estimatedDailyExpenseINR: dailyExpense,
      estimatedTotalExpenseINR: Math.round(dailyExpense * allocatedDays),
      heatAdvisory,
      enRouteAttractionsFromPrev: enRoute,
    });
  }

  // Build edges
  const allCities = [origin, ...destinations, origin];
  const edges: GraphEdge[] = [];
  for (let i = 0; i < allCities.length - 1; i++) {
    edges.push({
      from: allCities[i],
      to: allCities[i + 1],
      distanceKm: estimateDistanceKm(allCities[i], allCities[i + 1]),
    });
  }

  // Build summary lines for LLM injection
  const summaryLines: string[] = [];
  summaryLines.push(`--- TRIP GRAPH ANALYSIS (use to allocate days and budget per city) ---`);
  summaryLines.push(`Total trip: ${totalDays} days | ${destinations.length} destination(s) | Pace: ${preferences.pace}`);
  summaryLines.push(`Budget tier: ${preferences.budgetTier} | Skip en-route stops: ${preferences.skipEnRoute ? 'YES (user preference)' : 'NO'}`);
  summaryLines.push('');
  summaryLines.push('NODE WEIGHTS & TIME ALLOCATION:');
  for (const node of nodes) {
    const wx = weatherByCity[node.name.toLowerCase()];
    const tempStr = wx?.currentTemp !== undefined ? ` | ${Math.round(wx.currentTemp)}°C` : '';
    summaryLines.push(
      `  ${node.name} [weight ${node.importanceWeight}/10] → ${node.allocatedDays} days | ` +
      `~₹${node.estimatedDailyExpenseINR}/person/day | Heat: ${node.heatAdvisory.risk}${tempStr}`
    );
    summaryLines.push(`    Schedule: ${node.heatAdvisory.scheduleNote}`);
    if (node.enRouteAttractionsFromPrev.length > 0) {
      summaryLines.push(`    En-route from ${node.enRouteAttractionsFromPrev.length > 0 ? nodes[nodes.indexOf(node) - 1]?.name || origin : origin}:`);
      for (const a of node.enRouteAttractionsFromPrev) {
        const skipNote = a.skipIfRushed ? ' (skippable)' : ' (recommended)';
        summaryLines.push(`      • ${a.name} — ${a.description}. Detour: ${a.detourKm}km, Time: ${a.timeNeeded}${skipNote}`);
      }
    }
  }
  summaryLines.push('');
  summaryLines.push('ROUTE LEGS (distances):');
  for (const edge of edges) {
    const distStr = edge.distanceKm ? `${edge.distanceKm} km` : 'distance unknown';
    summaryLines.push(`  ${edge.from} → ${edge.to}: ${distStr}`);
  }
  summaryLines.push('');
  summaryLines.push('INSTRUCTIONS FOR LLM:');
  summaryLines.push('1. Allocate days per city as shown above (±0.5 day flexibility only).');
  summaryLines.push('2. Use daily expense estimates for hotel + food + local transport budget.');
  summaryLines.push('3. Schedule outdoor sightseeing per heat advisory (check scheduleNote per city).');
  summaryLines.push('4. Include en-route attractions as morning stops on travel days UNLESS skipIfRushed=true and user wants fast pace.');
  summaryLines.push('5. If a city has extreme/very-hot heat, explicitly note midday rest in the day plan.');

  return { nodes, edges, totalAllocatedDays: usedDays, summaryLines };
}
