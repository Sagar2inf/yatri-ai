import type { Itinerary, DayPlan, DailyBudget, LocalTransport } from '../types/index.js';

function num(v: unknown): number {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' && v.length > 0 ? v : fallback;
}

function normalizeDailyBudget(raw: unknown): DailyBudget {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    transport: num(b['transport']),
    accommodation: num(b['accommodation']),
    food: num(b['food']),
    activities: num(b['activities']),
    miscellaneous: num(b['miscellaneous']),
    total: num(b['total']),
  };
}

function normalizeDay(raw: unknown, index: number): DayPlan {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const accommodation = d['accommodation'] && typeof d['accommodation'] === 'object'
    ? (() => {
        const a = d['accommodation'] as Record<string, unknown>;
        return {
          name: str(a['name'], 'Accommodation'),
          type: str(a['type'], 'hotel'),
          area: str(a['area'], ''),
          pricePerNight: num(a['pricePerNight']),
          rating: num(a['rating']),
          amenities: arr<string>(a['amenities']),
          bookingTip: str(a['bookingTip']),
        };
      })()
    : null;

  const steps = arr<Record<string, unknown>>(d['steps']).map((s, si) => ({
    id: str(s['id'], `d${index + 1}-s${si + 1}`),
    time: str(s['time'], ''),
    duration: str(s['duration'], ''),
    type: str(s['type'], 'activity') as DayPlan['steps'][number]['type'],
    title: str(s['title'], 'Activity'),
    description: str(s['description'], ''),
    cost: num(s['cost']),
    tips: typeof s['tips'] === 'string' ? s['tips'] : undefined,
    details: s['details'] as DayPlan['steps'][number]['details'],
  }));

  const meals = arr<Record<string, unknown>>(d['meals']).map((m) => ({
    mealType: str(m['mealType'], 'lunch') as DayPlan['meals'][number]['mealType'],
    time: str(m['time'], ''),
    suggestion: str(m['suggestion'], ''),
    localSpecialty: typeof m['localSpecialty'] === 'string' ? m['localSpecialty'] : undefined,
    estimatedCost: num(m['estimatedCost']),
    area: str(m['area'], ''),
    cuisine: str(m['cuisine'], ''),
    tip: str(m['tip'], ''),
    alternatives: arr<string>(m['alternatives']),
    dietaryNote: typeof m['dietaryNote'] === 'string' ? m['dietaryNote'] : undefined,
  }));

  const rawLT = d['localTransport'];
  const localTransport: LocalTransport | null = rawLT && typeof rawLT === 'object'
    ? (() => {
        const lt = rawLT as Record<string, unknown>;
        return {
          recommended: str(lt['recommended'], ''),
          estimatedCostPerDay: num(lt['estimatedCostPerDay']),
          options: arr<Record<string, unknown>>(lt['options']).map((o) => ({
            mode: str(o['mode'], ''),
            costPerDay: num(o['costPerDay']),
            pros: str(o['pros'], ''),
            cons: str(o['cons'], ''),
          })),
          tips: str(lt['tips'], ''),
        };
      })()
    : null;

  const enRouteAttractions = arr<Record<string, unknown>>(d['enRouteAttractions']).map((a) => ({
    name: str(a['name'], 'Attraction'),
    type: str(a['type'], ''),
    location: str(a['location'], ''),
    detourTime: str(a['detourTime'], ''),
    entryFee: num(a['entryFee']),
    description: str(a['description'], ''),
    bestTime: str(a['bestTime'], ''),
    coordinates: a['coordinates'] && typeof a['coordinates'] === 'object'
      ? { lat: num((a['coordinates'] as Record<string,unknown>)['lat']), lng: num((a['coordinates'] as Record<string,unknown>)['lng']) }
      : undefined,
  }));

  return {
    day: num(d['day']) || index + 1,
    date: str(d['date'], ''),
    location: str(d['location'], `Day ${index + 1}`),
    theme: str(d['theme'], ''),
    accommodation,
    localTransport,
    steps,
    meals,
    enRouteAttractions,
    dailyBudget: normalizeDailyBudget(d['dailyBudget']),
    coordinates: d['coordinates'] && typeof d['coordinates'] === 'object'
      ? { lat: num((d['coordinates'] as Record<string,unknown>)['lat']), lng: num((d['coordinates'] as Record<string,unknown>)['lng']) }
      : null,
    notes: str(d['notes'], ''),
  };
}

export function normalizeItinerary(raw: Itinerary): Itinerary {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const trip = (r['trip'] && typeof r['trip'] === 'object' ? r['trip'] : {}) as Record<string, unknown>;
  const budget = (r['budget'] && typeof r['budget'] === 'object' ? r['budget'] : {}) as Record<string, unknown>;
  const breakdown = (budget['breakdown'] && typeof budget['breakdown'] === 'object' ? budget['breakdown'] : {}) as Record<string, unknown>;
  const weather = (r['weather'] && typeof r['weather'] === 'object' ? r['weather'] : {}) as Record<string, unknown>;

  return {
    id: str(r['id'], `itin-${Date.now()}`),
    generatedAt: num(r['generatedAt']) || Date.now(),
    title: str(r['title'], 'Your Trip'),
    summary: str(r['summary'], ''),
    trip: {
      from: str(trip['from'], ''),
      to: str(trip['to'], ''),
      destinations: arr<string>(trip['destinations']),
      startDate: str(trip['startDate'], ''),
      endDate: str(trip['endDate'], ''),
      durationDays: num(trip['durationDays']),
      travelers: num(trip['travelers']) || 1,
      travelMode: str(trip['travelMode'], 'train'),
    },
    budget: {
      total: num(budget['total']),
      perPerson: num(budget['perPerson']),
      currency: 'INR',
      breakdown: {
        transport: num(breakdown['transport']),
        accommodation: num(breakdown['accommodation']),
        food: num(breakdown['food']),
        activities: num(breakdown['activities']),
        miscellaneous: num(breakdown['miscellaneous']),
      },
    },
    days: arr<unknown>(r['days']).map((d, i) => normalizeDay(d, i)),
    tips: arr<string>(r['tips']),
    weather: {
      season: str(weather['season'], ''),
      temperature: str(weather['temperature'], ''),
      advisory: str(weather['advisory'], ''),
      packingTips: arr<string>(weather['packingTips']),
    },
    emergencyContacts: arr<Record<string, unknown>>(r['emergencyContacts']).map((c) => ({
      name: str(c['name'], ''),
      number: str(c['number'], ''),
      type: str(c['type'], ''),
    })),
  };
}
