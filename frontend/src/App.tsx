import { useEffect } from 'react';
import { useAppStore } from './store/index.js';
import { ChatInterface } from './components/Chat/ChatInterface.js';
import { ItineraryView } from './components/Itinerary/ItineraryView.js';
import { getSession, getItinerary } from './services/api.js';

export default function App() {
  const { itinerary, setItinerary, setSessionId } = useAppStore();

  useEffect(() => {
    const restore = async () => {
      try {
        const session = await getSession();
        if (session) {
          setSessionId(session.id);
          if (session.hasItinerary) {
            const existing = await getItinerary();
            if (existing) setItinerary(existing);
          }
        }
      } catch {
        // session will be created on first message
      }
    };

    restore();
  }, [setSessionId, setItinerary]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div
        className={`flex flex-col border-r border-gray-200 bg-white shadow-lg transition-all duration-500 ease-in-out ${
          itinerary ? 'w-full sm:w-[400px] lg:w-[440px] shrink-0' : 'w-full max-w-2xl mx-auto'
        }`}
      >
        <ChatInterface />
      </div>

      {itinerary && (
        <div className="hidden sm:flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <ItineraryView itinerary={itinerary} />
        </div>
      )}

      {itinerary && (
        <div className="sm:hidden fixed inset-0 z-50 bg-white pointer-events-none opacity-0" />
      )}
    </div>
  );
}
