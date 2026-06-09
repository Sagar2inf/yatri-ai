import { create } from 'zustand';
import type { ChatMessage, Itinerary, LLMResponse } from '../types/index.js';
import { normalizeItinerary } from '../utils/normalizeItinerary.js';

interface AppState {
  messages: ChatMessage[];
  itinerary: Itinerary | null;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  activeDay: number;
  sidebarOpen: boolean;

  addMessage: (msg: Omit<ChatMessage, 'id'>) => void;
  setItinerary: (itinerary: Itinerary | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSessionId: (id: string) => void;
  setActiveDay: (day: number) => void;
  setSidebarOpen: (open: boolean) => void;
  handleLLMResponse: (response: LLMResponse) => void;
  reset: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Namaste! I'm **YatraAI** — your personal India travel planner. 🇮🇳

I'll help you plan a complete trip itinerary with:
- Transport (trains, flights, buses)
- Hotels for every night
- Day-by-day activities & attractions
- Food recommendations with costs
- Full budget breakdown

Tell me where you want to go, your budget (in ₹), and how many days — and I'll create your perfect itinerary!

*Example: "I want to visit Rajasthan for 7 days with a budget of ₹30,000 for 2 people from Delhi"*`,
  timestamp: Date.now(),
  type: 'text',
};

export const useAppStore = create<AppState>((set) => ({
  messages: [INITIAL_MESSAGE],
  itinerary: null,
  isLoading: false,
  error: null,
  sessionId: null,
  activeDay: 1,
  sidebarOpen: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, { ...msg, id: `msg-${Date.now()}-${Math.random()}` }],
    })),

  setItinerary: (itinerary) => set({ itinerary: itinerary ? normalizeItinerary(itinerary) : null, activeDay: 1 }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setSessionId: (sessionId) => set({ sessionId }),

  setActiveDay: (activeDay) => set({ activeDay }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  handleLLMResponse: (response) =>
    set((state) => {
      const newMessages: ChatMessage[] = [];

      if (response.type === 'clarification' && response.questions) {
        newMessages.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.questions.join('\n\n'),
          timestamp: Date.now(),
          type: 'clarification',
          questions: response.questions,
        });
      } else if (response.type === 'itinerary' && response.itinerary) {
        const itinerary = normalizeItinerary(response.itinerary);
        newMessages.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Your itinerary for **${itinerary.title}** is ready! You can see the full plan on the right. Feel free to ask me to modify anything — add days, change hotels, adjust budget, or get more info about any part of the trip.`,
          timestamp: Date.now(),
          type: 'itinerary',
        });
        return { messages: [...state.messages, ...newMessages], itinerary, activeDay: 1 };
      } else if (response.type === 'modification' && response.itinerary) {
        const itinerary = normalizeItinerary(response.itinerary);
        newMessages.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.answer ?? 'I\'ve updated your itinerary. Check the right panel for the changes.',
          timestamp: Date.now(),
          type: 'modification',
        });
        return { messages: [...state.messages, ...newMessages], itinerary };
      } else if (response.type === 'answer') {
        newMessages.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.answer ?? '',
          timestamp: Date.now(),
          type: 'answer',
        });
      }

      return { messages: [...state.messages, ...newMessages] };
    }),

  reset: () =>
    set({
      messages: [INITIAL_MESSAGE],
      itinerary: null,
      isLoading: false,
      error: null,
      activeDay: 1,
    }),
}));
