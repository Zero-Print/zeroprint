'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { Leaf, TrendingUp, Info } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface EcoScoreCardProps {
  ecoScore: number;
  carbonSaved: number;
  trendData: {
    date: string;
    ecoScore: number;
    carbonSaved: number;
  }[];
  period?: 'week' | 'month' | 'year';
  onChangePeriod?: (period: 'week' | 'month' | 'year') => void;
}

export function EcoScoreCard({
  ecoScore = 0,
  carbonSaved = 0,
  trendData = [],
  period = 'month',
  onChangePeriod,
}: EcoScoreCardProps) {
  // Calculate percentage change from first to last data point
  const calculateChange = (dataKey: 'ecoScore' | 'carbonSaved') => {
    if (trendData.length < 2) return 0;
    const firstValue = trendData[0][dataKey];
    const lastValue = trendData[trendData.length - 1][dataKey];
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const ecoScoreChange = calculateChange('ecoScore');
  const carbonSavedChange = calculateChange('carbonSaved');

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-100">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm text-green-600">
            EcoScore: {payload[0].value.toFixed(1)}
          </p>
          <p className="text-sm text-blue-600">
            CO₂ Saved: {payload[1].value.toFixed(2)} kg
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ZPCard className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Environmental Impact</h3>
          </div>
          <div className="flex space-x-2">
            {['week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => onChangePeriod && onChangePeriod(p as any)}
                className={`text-xs px-2 py-1 rounded-md ${
                  period === p
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">EcoScore</div>
            <div className="text-2xl font-bold text-green-700">{ecoScore.toFixed(1)}</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp
                className={`h-3 w-3 mr-1 ${
                  ecoScoreChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              />
              <span
                className={
                  ecoScoreChange >= 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {ecoScoreChange.toFixed(1)}% this {period}
              </span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">CO₂ Saved</div>
            <div className="text-2xl font-bold text-blue-700">{carbonSaved.toFixed(2)} kg</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp
                className={`h-3 w-3 mr-1 ${
                  carbonSavedChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              />
              <span
                className={
                  carbonSavedChange >= 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {carbonSavedChange.toFixed(1)}% this {period}
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#22c55e" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#3b82f6" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ecoScore"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="EcoScore"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="carbonSaved"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="CO₂ Saved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 text-xs text-gray-500 flex items-center">
          <Info className="h-3 w-3 mr-1" />
          <span>Your EcoScore is calculated based on your sustainable actions and carbon savings.</span>
        </div>
      </div>
    </ZPCard>
  );
}