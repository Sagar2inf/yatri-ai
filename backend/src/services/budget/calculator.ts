import type { Itinerary, BudgetBreakdown, DailyBudget } from '../../types/index.js';
import { INDIA_BUDGET_TIERS } from '../../config/constants.js';

export function recalculateBudget(itinerary: Itinerary): Itinerary {
  const days = Array.isArray(itinerary.days) ? itinerary.days : [];

  const accumulated: BudgetBreakdown = {
    transport: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    miscellaneous: 0,
  };

  const updatedDays = days.map((day) => {
    const daily: DailyBudget = {
      transport: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      miscellaneous: 0,
      total: 0,
    };

    let hasLocalTransportStep = false;
    for (const step of Array.isArray(day.steps) ? day.steps : []) {
      const cost = Number(step.cost) || 0;
      if (['transport', 'train', 'flight', 'bus'].includes(step.type)) {
        daily.transport += cost;
      } else if (step.type === 'local-transport') {
        daily.transport += cost;
        hasLocalTransportStep = true;
      } else if (step.type === 'activity') {
        daily.activities += cost;
      } else if (step.type === 'food') {
        daily.food += cost;
      } else {
        daily.miscellaneous += cost;
      }
    }

    // Use localTransport.estimatedCostPerDay if no local-transport steps captured it
    const ltCost = Number((day as any).localTransport?.estimatedCostPerDay) || 0;
    if (!hasLocalTransportStep && ltCost > 0) {
      daily.transport += ltCost;
    }

    for (const meal of Array.isArray(day.meals) ? day.meals : []) {
      daily.food += Number(meal.estimatedCost) || 0;
    }

    if (day.accommodation) {
      daily.accommodation += Number(day.accommodation.pricePerNight) || 0;
    }

    if (!daily.miscellaneous) {
      daily.miscellaneous = Math.round(
        (daily.transport + daily.accommodation + daily.food + daily.activities) * 0.05
      );
    }

    daily.total =
      daily.transport + daily.accommodation + daily.food + daily.activities + daily.miscellaneous;

    accumulated.transport += daily.transport;
    accumulated.accommodation += daily.accommodation;
    accumulated.food += daily.food;
    accumulated.activities += daily.activities;
    accumulated.miscellaneous += daily.miscellaneous;

    return {
      ...day,
      steps: Array.isArray(day.steps) ? day.steps : [],
      meals: Array.isArray(day.meals) ? day.meals : [],
      enRouteAttractions: Array.isArray(day.enRouteAttractions) ? day.enRouteAttractions : [],
      dailyBudget: daily,
    };
  });

  const total = Object.values(accumulated).reduce((s, v) => s + v, 0);
  const travelers = Math.max(1, Number(itinerary.trip?.travelers) || 1);

  return {
    ...itinerary,
    tips: Array.isArray(itinerary.tips) ? itinerary.tips : [],
    emergencyContacts: Array.isArray(itinerary.emergencyContacts) ? itinerary.emergencyContacts : [],
    days: updatedDays,
    budget: {
      total,
      perPerson: Math.round(total / travelers),
      currency: 'INR',
      breakdown: accumulated,
    },
  };
}

export function estimateBudgetTier(
  totalBudget: number,
  durationDays: number,
  travelers: number
): keyof typeof INDIA_BUDGET_TIERS {
  const perPersonPerDay = totalBudget / (travelers * durationDays);
  if (perPersonPerDay < 1000) return 'budget';
  if (perPersonPerDay < 2000) return 'economy';
  if (perPersonPerDay < 4000) return 'mid';
  if (perPersonPerDay < 8000) return 'premium';
  return 'luxury';
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
