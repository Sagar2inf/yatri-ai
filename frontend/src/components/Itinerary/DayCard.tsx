import { useState } from 'react';
import {
  MapPin, Hotel, ChevronDown, ChevronUp, Star, Coffee,
  Sunrise, Sun, Moon, IndianRupee, Gem, Info, Car, Utensils,
} from 'lucide-react';
import type { DayPlan } from '../../types/index.js';
import { StepCard } from './StepCard.js';
import { formatDate, formatINR } from '../../utils/formatters.js';

interface Props {
  day: DayPlan;
  isActive: boolean;
  onClick: () => void;
}

const MEAL_ICONS: Record<string, React.ReactNode> = {
  breakfast: <Sunrise className="w-3.5 h-3.5 text-yellow-500" />,
  lunch: <Sun className="w-3.5 h-3.5 text-orange-500" />,
  dinner: <Moon className="w-3.5 h-3.5 text-indigo-500" />,
  snack: <Coffee className="w-3.5 h-3.5 text-amber-500" />,
};

export function DayCard({ day, isActive, onClick }: Props) {
  const [mealExpanded, setMealExpanded] = useState(false);
  const [transportExpanded, setTransportExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
        isActive ? 'border-orange-400 shadow-lg shadow-orange-100' : 'border-gray-100 hover:border-orange-200 hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 ${isActive ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-white'}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>
                Day {day.day}
              </span>
              <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                {formatDate(day.date)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-orange-500'}`} />
              <h3 className={`font-bold text-base ${isActive ? 'text-white' : 'text-gray-800'}`}>
                {day.location}
              </h3>
            </div>
            <p className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
              {day.theme}
            </p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-0.5 justify-end ${isActive ? 'text-white' : 'text-gray-700'}`}>
              <IndianRupee className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">{formatINR(day.dailyBudget.total).replace('₹', '')}</span>
            </div>
            <p className={`text-[10px] ${isActive ? 'text-white/60' : 'text-gray-400'}`}>day total</p>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="bg-white divide-y divide-gray-50">

          {/* Accommodation */}
          {day.accommodation && (
            <div className="p-4 bg-purple-50/50">
              <div className="flex items-start gap-2">
                <Hotel className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{day.accommodation.name}</p>
                    <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      {formatINR(day.accommodation.pricePerNight)}/night
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-600">{day.accommodation.rating}</span>
                    </div>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">{day.accommodation.area}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500 capitalize">{day.accommodation.type}</span>
                  </div>
                  {day.accommodation.amenities.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {day.accommodation.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="text-[10px] bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {day.accommodation.bookingTip && (
                    <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {day.accommodation.bookingTip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Local Transport */}
          {day.localTransport && (
            <div className="p-4 bg-teal-50/60">
              <button
                className="flex items-center justify-between w-full"
                onClick={(e) => { e.stopPropagation(); setTransportExpanded(!transportExpanded); }}
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      Local Transport
                      <span className="ml-2 text-xs font-medium text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-full">
                        {day.localTransport.recommended}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      ~{formatINR(day.localTransport.estimatedCostPerDay)}/day · {day.localTransport.options.length} options
                    </p>
                  </div>
                </div>
                {transportExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {transportExpanded && (
                <div className="mt-3 space-y-2">
                  {day.localTransport.options.map((opt, i) => (
                    <div key={i} className={`rounded-xl p-3 border ${i === 0 ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-800">{opt.mode}</span>
                          {i === 0 && (
                            <span className="text-[10px] bg-teal-600 text-white rounded px-1.5 py-0.5">Recommended</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-teal-700">{formatINR(opt.costPerDay)}/day</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <p className="text-[10px] text-green-700">
                          <span className="font-medium">✓ </span>{opt.pros}
                        </p>
                        <p className="text-[10px] text-red-600">
                          <span className="font-medium">✗ </span>{opt.cons}
                        </p>
                      </div>
                    </div>
                  ))}
                  {day.localTransport.tips && (
                    <p className="text-[10px] text-teal-800 bg-teal-100 rounded-lg p-2 flex items-start gap-1">
                      <Info className="w-3 h-3 shrink-0 mt-0.5" />
                      {day.localTransport.tips}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Steps */}
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Schedule</h4>
            <div className="space-y-2">
              {day.steps.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}
            </div>
          </div>

          {/* Meals */}
          {day.meals.length > 0 && (
            <div className="p-4">
              <button
                className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                onClick={(e) => { e.stopPropagation(); setMealExpanded(!mealExpanded); }}
              >
                <div className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Food & Meals ({day.meals.length})</span>
                </div>
                {mealExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {mealExpanded && (
                <div className="space-y-2">
                  {day.meals.map((meal, i) => (
                    <div key={i} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {MEAL_ICONS[meal.mealType] ?? <Coffee className="w-3.5 h-3.5" />}
                          <span className="text-xs font-semibold text-gray-700 capitalize">
                            {meal.mealType} · {meal.time}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-orange-600">
                          {formatINR(meal.estimatedCost)}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-gray-800">{meal.suggestion}</p>

                      {meal.localSpecialty && (
                        <div className="mt-1.5 flex items-start gap-1.5 bg-amber-50 rounded-lg px-2 py-1.5 border border-amber-200">
                          <Gem className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold text-amber-800">Must Try: </span>
                            <span className="text-[10px] text-amber-700">{meal.localSpecialty}</span>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-500 mt-1">{meal.cuisine} · {meal.area}</p>

                      {meal.tip && (
                        <p className="text-[10px] text-amber-700 mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {meal.tip}
                        </p>
                      )}
                      {meal.dietaryNote && (
                        <span className="text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0.5 mt-1 inline-block">
                          {meal.dietaryNote}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* En-route attractions */}
          {day.enRouteAttractions.length > 0 && (
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">En-Route Attractions</h4>
              <div className="space-y-2">
                {day.enRouteAttractions.map((attr, i) => (
                  <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-800">{attr.name}</p>
                      <span className="text-[10px] text-amber-700">+{attr.detourTime} detour</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">{attr.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500">{attr.location}</span>
                      {attr.entryFee > 0 && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-[10px] text-gray-500">Entry: {formatINR(attr.entryFee)}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {day.notes && (
            <div className="p-4">
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {day.notes}
                </p>
              </div>
            </div>
          )}

          {/* Day budget breakdown */}
          <div className="p-4 bg-gray-50">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Day Budget</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(day.dailyBudget).filter(([k]) => k !== 'total').map(([key, val]) => (
                <div key={key} className="text-center">
                  <p className="text-xs text-gray-500 capitalize">{key}</p>
                  <p className="text-sm font-semibold text-gray-800">{formatINR(val as number)}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-center">
              <p className="text-sm font-bold text-gray-900">Total: {formatINR(day.dailyBudget.total)}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
