import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { WellnessEntry } from '../../types/index.js';
import { Card } from '../ui/Card.js';
import { BrainCircuit } from 'lucide-react';

interface WellnessTrendsChartProps {
  data: WellnessEntry[];
}

export const WellnessTrendsChart: React.FC<WellnessTrendsChartProps> = ({ data }) => {
  const formattedData = data.map((w, idx) => ({
    name: new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' }) || `Day ${idx + 1}`,
    mood: w.moodScore,
    sleep: w.sleepHours,
    activity: w.activityMinutes,
  }));

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Wellness & Recovery Trends</h3>
            <p className="text-xs text-slate-400">Sleep Duration (hrs) & Mood Score (1-10)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span>
            <span className="text-slate-600 font-medium">Sleep Hours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-400"></span>
            <span className="text-slate-600 font-medium">Mood (1-10)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="sleep" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="mood" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
