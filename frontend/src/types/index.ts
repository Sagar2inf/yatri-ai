export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
}

export interface DailyBudget extends BudgetBreakdown {
  total: number;
}

export interface Hotel {
  name: string;
  type: string;
  area: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  bookingTip: string;
}

export interface Meal {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  suggestion: string;
  localSpecialty?: string;
  estimatedCost: number;
  area: string;
  cuisine: string;
  tip: string;
  alternatives: string[];
  dietaryNote?: string;
}

export interface TrainDetails {
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  travelClass: string;
  distance: string;
  bookingLink: string;
}

export interface FlightDetails {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  terminal?: string;
}

export interface ActivityDetails {
  location: string;
  entryFee: number;
  timings: string;
  bookingRequired: boolean;
}

export type StepType =
  | 'transport'
  | 'train'
  | 'flight'
  | 'bus'
  | 'activity'
  | 'checkin'
  | 'checkout'
  | 'food'
  | 'rest'
  | 'local-transport';

export interface ItineraryStep {
  id: string;
  time: string;
  duration: string;
  type: StepType;
  title: string;
  description: string;
  cost: number;
  tips?: string;
  details?: TrainDetails | FlightDetails | ActivityDetails;
}

export interface LocalTransportOption {
  mode: string;
  costPerDay: number;
  pros: string;
  cons: string;
}

export interface LocalTransport {
  recommended: string;
  estimatedCostPerDay: number;
  options: LocalTransportOption[];
  tips: string;
}

export interface Attraction {
  name: string;
  type: string;
  location: string;
  detourTime: string;
  entryFee: number;
  description: string;
  bestTime: string;
  coordinates?: Coordinates;
}

export interface DayPlan {
  day: number;
  date: string;
  location: string;
  theme: string;
  accommodation: Hotel | null;
  localTransport: LocalTransport | null;
  steps: ItineraryStep[];
  meals: Meal[];
  enRouteAttractions: Attraction[];
  dailyBudget: DailyBudget;
  coordinates: Coordinates | null;
  notes: string;
}

export interface Itinerary {
  id: string;
  generatedAt: number;
  title: string;
  summary: string;
  trip: {
    from: string;
    to: string;
    destinations: string[];
    startDate: string;
    endDate: string;
    durationDays: number;
    travelers: number;
    travelMode: string;
  };
  budget: {
    total: number;
    perPerson: number;
    currency: 'INR';
    breakdown: BudgetBreakdown;
  };
  days: DayPlan[];
  tips: string[];
  weather: {
    season: string;
    temperature: string;
    advisory: string;
    packingTips: string[];
  };
  emergencyContacts: Array<{
    name: string;
    number: string;
    type: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'clarification' | 'itinerary' | 'answer' | 'modification' | 'text';
  questions?: string[];
}

export interface LLMResponse {
  type: 'clarification' | 'itinerary' | 'answer' | 'modification';
  questions?: string[];
  answer?: string;
  itinerary?: Itinerary;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  sessionId?: string;
}

export interface SessionInfo {
  id: string;
  createdAt: number;
  lastActive: number;
  hasItinerary: boolean;
  messageCount: number;
}
