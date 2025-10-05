'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ZPCard } from './ZPCard';
import { Leaf, TrendingDown } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface CO2ProjectionData {
  current: number;
  target: number;
  projectedReduction: number;
  monthlyData: {
    labels: string[];
    actual: number[];
    projected: number[];
  };
}

interface CO2ProjectionChartProps {
  data: CO2ProjectionData;
  title?: string;
  className?: string;
}

export function CO2ProjectionChart({ data, title = 'CO₂ Emission Projection', className = '' }: CO2ProjectionChartProps) {
  const chartData = {
    labels: data.monthlyData.labels,
    datasets: [
      {
        label: 'Actual',
        data: data.monthlyData.actual,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Projected',
        data: data.monthlyData.projected,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderDash: [5, 5],
        tension: 0.3,
        fill: {
          target: 'origin',
          above: 'rgba(75, 192, 192, 0.1)',
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(2)} kg CO₂`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'CO₂ Emissions (kg)',
        },
      },
    },
  };

  const percentReduction = ((data.current - data.target) / data.current * 100).toFixed(1);

  return (
    <ZPCard className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Leaf className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">{percentReduction}% reduction target</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Current</div>
          <div className="text-lg font-semibold">{data.current.toFixed(2)} kg</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Target</div>
          <div className="text-lg font-semibold">{data.target.toFixed(2)} kg</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Projected</div>
          <div className="text-lg font-semibold">{(data.current - data.projectedReduction).toFixed(2)} kg</div>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Based on your current habits and planned interventions, you are projected to reduce your CO₂ emissions by {data.projectedReduction.toFixed(2)} kg over the next {data.monthlyData.labels.length} months.</p>
      </div>
    </ZPCard>
  );
}