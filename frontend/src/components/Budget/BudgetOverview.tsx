import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Itinerary } from '../../types/index.js';
import { formatINRFull, formatINR } from '../../utils/formatters.js';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface Props {
  itinerary: Itinerary;
}

const COLORS = ['#f97316', '#8b5cf6', '#22c55e', '#eab308', '#94a3b8'];
const LABELS = ['Transport', 'Accommodation', 'Food', 'Activities', 'Misc'];

export function BudgetOverview({ itinerary }: Props) {
  const { budget, trip } = itinerary;

  const chartData = [
    { name: 'Transport', value: budget.breakdown.transport },
    { name: 'Accommodation', value: budget.breakdown.accommodation },
    { name: 'Food', value: budget.breakdown.food },
    { name: 'Activities', value: budget.breakdown.activities },
    { name: 'Misc', value: budget.breakdown.miscellaneous },
  ].filter((d) => d.value > 0);

  const perPersonPerDay = trip.travelers > 0 && trip.durationDays > 0
    ? Math.round(budget.perPerson / trip.durationDays)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 text-center">
          <p className="text-xs text-orange-600 font-medium">Total Budget</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{formatINR(budget.total)}</p>
          <p className="text-[10px] text-gray-500">{budget.currency}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center">
          <p className="text-xs text-purple-600 font-medium flex items-center justify-center gap-1">
            <Users className="w-3 h-3" /> Per Person
          </p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{formatINR(budget.perPerson)}</p>
          <p className="text-[10px] text-gray-500">{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
          <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" /> Per Day
          </p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{formatINR(perPersonPerDay)}</p>
          <p className="text-[10px] text-gray-500">per person</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Spending Breakdown</h4>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatINRFull(Number(value ?? 0)), '']}
              contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {LABELS.map((label, i) => {
          const value = Object.values(budget.breakdown)[i] as number;
          const pct = budget.total > 0 ? Math.round((value / budget.total) * 100) : 0;
          return (
            <div key={label} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-semibold text-gray-800">{formatINR(value)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-gray-400 w-7 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      {itinerary.days.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Daily Spend
          </h4>
          <div className="space-y-1.5">
            {itinerary.days.map((day) => (
              <div key={day.day} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-12 shrink-0">Day {day.day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((day.dailyBudget.total / (budget.total / itinerary.days.length)) * 50))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-700 w-14 text-right shrink-0">
                  {formatINR(day.dailyBudget.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
