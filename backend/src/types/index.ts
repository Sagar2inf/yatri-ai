export interface SessionData {
  id: string;
  ip: string;
  createdAt: number;
  lastActive: number;
  conversationHistory: ChatMessage[];
  currentItinerary: Itinerary | null;
  tripContext: TripContext | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface TripContext {
  from?: string;
  to?: string;
  destinations?: string[];
  budget?: number;
  budgetTier?: 'budget' | 'economy' | 'mid' | 'premium' | 'luxury';
  travelers?: number;
  travelMode?: 'train' | 'flight' | 'bus' | 'car' | 'mixed';
  durationDays?: number;
  startDate?: string;
  preferences?: string[];
  dietaryPreference?: 'veg' | 'non-veg' | 'jain' | 'any';
  hasChildren?: boolean;
  needsAccessibility?: boolean;
}

export interface Itinerary {
  id: string;
  generatedAt: number;
  title: string;
  summary: string;
  trip: TripMeta;
  budget: BudgetSummary;
  days: DayPlan[];
  tips: string[];
  weather: WeatherInfo;
  emergencyContacts: EmergencyContact[];
}

export interface TripMeta {
  from: string;
  to: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: number;
  travelMode: string;
}

export interface BudgetSummary {
  total: number;
  perPerson: number;
  currency: 'INR';
  breakdown: BudgetBreakdown;
}

export interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
}

export interface LocalTransportOption {
  mode: string;
  costPerDay: number;
  pros: string;
  cons: string;
}

export interface LocalTransportInfo {
  recommended: string;
  estimatedCostPerDay: number;
  options: LocalTransportOption[];
  tips: string;
}

export interface DayPlan {
  day: number;
  date: string;
  location: string;
  theme: string;
  accommodation: Hotel | null;
  localTransport?: LocalTransportInfo;
  steps: ItineraryStep[];
  meals: Meal[];
  enRouteAttractions: Attraction[];
  dailyBudget: DailyBudget;
  coordinates: Coordinates | null;
  notes: string;
}

export interface ItineraryStep {
  id: string;
  time: string;
  duration: string;
  type: 'transport' | 'train' | 'flight' | 'bus' | 'activity' | 'checkin' | 'checkout' | 'food' | 'rest' | 'local-transport';
  title: string;
  description: string;
  cost: number;
  tips?: string;
  details?: TrainDetails | FlightDetails | ActivityDetails;
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

export interface Hotel {
  name: string;
  type: 'hostel' | 'budget' | 'economy' | 'mid-range' | 'premium' | 'luxury' | 'homestay' | 'heritage';
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
  estimatedCost: number;
  area: string;
  cuisine: string;
  tip: string;
  alternatives: string[];
  dietaryNote?: string;
}

export interface Attraction {
  name: string;
  type: 'historical' | 'religious' | 'nature' | 'adventure' | 'cultural' | 'food' | 'shopping';
  location: string;
  detourTime: string;
  entryFee: number;
  description: string;
  bestTime: string;
  coordinates?: Coordinates;
}

export interface DailyBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WeatherInfo {
  season: string;
  temperature: string;
  advisory: string;
  packingTips: string[];
}

export interface EmergencyContact {
  name: string;
  number: string;
  type: 'police' | 'ambulance' | 'fire' | 'tourist-helpline' | 'railway';
}

export interface LLMResponse {
  type: 'clarification' | 'itinerary' | 'answer' | 'modification';
  questions?: string[];
  answer?: string;
  itinerary?: Itinerary;
  modification?: Partial<Itinerary>;
  thinking?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  sessionId?: string;
}
