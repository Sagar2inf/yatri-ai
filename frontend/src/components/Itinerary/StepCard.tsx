import { useState } from 'react';
import {
  Train, Plane, Bus, Car, MapPin, Utensils, Bed,
  Clock, ChevronDown, ChevronUp, IndianRupee, Info, Lightbulb,
} from 'lucide-react';
import type { ItineraryStep, TrainDetails, FlightDetails } from '../../types/index.js';
import { formatINR, getStepColor, getStepBgColor } from '../../utils/formatters.js';

const STEP_ICONS: Record<string, React.ReactNode> = {
  train: <Train className="w-3.5 h-3.5" />,
  flight: <Plane className="w-3.5 h-3.5" />,
  bus: <Bus className="w-3.5 h-3.5" />,
  transport: <Car className="w-3.5 h-3.5" />,
  'local-transport': <Car className="w-3.5 h-3.5" />,
  activity: <MapPin className="w-3.5 h-3.5" />,
  checkin: <Bed className="w-3.5 h-3.5" />,
  checkout: <Bed className="w-3.5 h-3.5" />,
  food: <Utensils className="w-3.5 h-3.5" />,
  rest: <Clock className="w-3.5 h-3.5" />,
};

interface Props {
  step: ItineraryStep;
}

export function StepCard({ step }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasDetails = step.details !== null && step.details !== undefined;
  const hasTips = step.tips && step.tips.length > 0;
  const isExpandable = hasDetails || hasTips;

  const trainDetails = (step.type === 'train' && step.details) ? step.details as TrainDetails : null;
  const flightDetails = (step.type === 'flight' && step.details) ? step.details as FlightDetails : null;

  return (
    <div className={`rounded-xl border ${getStepBgColor(step.type)} overflow-hidden`}>
      <div
        className={`flex items-start gap-3 p-3 ${isExpandable ? 'cursor-pointer hover:opacity-90' : ''}`}
        onClick={() => isExpandable && setExpanded(!expanded)}
      >
        <div className={`w-6 h-6 rounded-full ${getStepColor(step.type)} text-white flex items-center justify-center shrink-0 mt-0.5`}>
          {STEP_ICONS[step.type] ?? <MapPin className="w-3.5 h-3.5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  {step.time}
                </span>
                {step.duration && (
                  <span className="text-[10px] text-gray-400">· {step.duration}</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-snug">{step.title}</p>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{step.description}</p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <div className="flex items-center gap-0.5 text-gray-700">
                <IndianRupee className="w-3 h-3" />
                <span className="text-xs font-semibold">{formatINR(step.cost).replace('₹', '')}</span>
              </div>
              {isExpandable && (
                expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-current/10 pt-2 space-y-2">
          {trainDetails && (
            <div className="bg-blue-100/50 rounded-lg p-2.5 text-xs space-y-1">
              <div className="font-semibold text-blue-800 flex items-center gap-1">
                <Train className="w-3.5 h-3.5" />
                {trainDetails.trainNumber} · {trainDetails.trainName}
              </div>
              <div className="grid grid-cols-2 gap-1 text-gray-700">
                <div>
                  <span className="text-gray-500">From:</span> {trainDetails.from}
                </div>
                <div>
                  <span className="text-gray-500">To:</span> {trainDetails.to}
                </div>
                <div>
                  <span className="text-gray-500">Dep:</span> {trainDetails.departure}
                </div>
                <div>
                  <span className="text-gray-500">Arr:</span> {trainDetails.arrival}
                </div>
                <div>
                  <span className="text-gray-500">Class:</span> {trainDetails.travelClass}
                </div>
                <div>
                  <span className="text-gray-500">Distance:</span> {trainDetails.distance}
                </div>
              </div>
              <div className="text-blue-700 font-medium flex items-center gap-1 mt-1">
                <Info className="w-3 h-3" />
                Book via {trainDetails.bookingLink}
              </div>
            </div>
          )}

          {flightDetails && (
            <div className="bg-indigo-100/50 rounded-lg p-2.5 text-xs space-y-1">
              <div className="font-semibold text-indigo-800 flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" />
                {flightDetails.airline} · {flightDetails.flightNumber}
              </div>
              <div className="grid grid-cols-2 gap-1 text-gray-700">
                <div><span className="text-gray-500">From:</span> {flightDetails.from}</div>
                <div><span className="text-gray-500">To:</span> {flightDetails.to}</div>
                <div><span className="text-gray-500">Dep:</span> {flightDetails.departure}</div>
                <div><span className="text-gray-500">Arr:</span> {flightDetails.arrival}</div>
              </div>
            </div>
          )}

          {hasTips && (
            <div className="flex gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{step.tips}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
