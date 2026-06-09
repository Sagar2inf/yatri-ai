import { useState } from 'react';
import {
  Calendar, Users, MapPin, Cloud, Lightbulb,
  Phone, List, PieChart, Map, Info,
} from 'lucide-react';
import type { Itinerary } from '../../types/index.js';
import { useAppStore } from '../../store/index.js';
import { DayCard } from './DayCard.js';
import { BudgetOverview } from '../Budget/BudgetOverview.js';
import { RouteMap } from '../Map/RouteMap.js';
import { formatDate, formatINR } from '../../utils/formatters.js';

type Tab = 'itinerary' | 'budget' | 'map' | 'info';

interface Props {
  itinerary: Itinerary;
}

export function ItineraryView({ itinerary }: Props) {
  const [tab, setTab] = useState<Tab>('itinerary');
  const { activeDay, setActiveDay } = useAppStore();

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'itinerary', label: 'Itinerary', icon: <List className="w-3.5 h-3.5" /> },
    { id: 'budget', label: 'Budget', icon: <PieChart className="w-3.5 h-3.5" /> },
    { id: 'map', label: 'Map', icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'info', label: 'Tips & Info', icon: <Info className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 shrink-0">
        <h2 className="text-lg font-bold leading-snug">{itinerary.title}</h2>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-prose">{itinerary.summary}</p>

        <div className="flex flex-wrap items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs">{itinerary.trip.destinations.join(' → ')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs">
              {formatDate(itinerary.trip.startDate)} – {formatDate(itinerary.trip.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs">{itinerary.trip.travelers} traveler{itinerary.trip.travelers > 1 ? 's' : ''}</span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-400">Total budget</p>
            <p className="text-lg font-bold text-orange-400">{formatINR(itinerary.budget.total)}</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white shrink-0 px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'itinerary' && (
          <div className="p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {itinerary.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeDay === day.day
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <span className="text-[10px] opacity-70">Day</span>
                  <span className="text-base font-bold leading-none">{day.day}</span>
                  <span className="text-[10px] opacity-70 mt-0.5 max-w-[60px] truncate">{day.location.split('→')[0]?.trim() ?? day.location}</span>
                </button>
              ))}
            </div>

            {itinerary.days.map((day) => (
              <DayCard
                key={day.day}
                day={day}
                isActive={activeDay === day.day}
                onClick={() => setActiveDay(day.day)}
              />
            ))}
          </div>
        )}

        {tab === 'budget' && (
          <div className="p-4">
            <BudgetOverview itinerary={itinerary} />
          </div>
        )}

        {tab === 'map' && (
          <div className="p-4 space-y-4">
            <RouteMap itinerary={itinerary} activeDay={activeDay} />
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Route Summary</h4>
              <div className="space-y-2">
                {itinerary.days.map((day) => (
                  <div
                    key={day.day}
                    onClick={() => { setActiveDay(day.day); }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      activeDay === day.day ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeDay === day.day ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {day.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{day.location}</p>
                      <p className="text-[10px] text-gray-500">{day.theme}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{formatINR(day.dailyBudget.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'info' && (
          <div className="p-4 space-y-4">
            {itinerary.weather && (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" />
                  Weather & Season
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-24">Season:</span>
                    <span className="font-medium text-gray-800">{itinerary.weather.season}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-24">Temperature:</span>
                    <span className="font-medium text-gray-800">{itinerary.weather.temperature}</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2 p-2 bg-blue-100 rounded-lg">{itinerary.weather.advisory}</p>
                  {itinerary.weather.packingTips.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">What to pack:</p>
                      <div className="flex flex-wrap gap-1">
                        {itinerary.weather.packingTips.map((tip) => (
                          <span key={tip} className="text-[10px] bg-blue-100 text-blue-700 rounded px-2 py-0.5">
                            {tip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {itinerary.tips.length > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {itinerary.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {itinerary.emergencyContacts.length > 0 && (
              <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Emergency Contacts
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {itinerary.emergencyContacts.map((contact) => (
                    <a
                      key={contact.name}
                      href={`tel:${contact.number}`}
                      className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-red-100 hover:bg-red-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{contact.name}</p>
                        <p className="text-sm font-bold text-red-600">{contact.number}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
