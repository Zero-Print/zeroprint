/**
 * ZPChart Component
 * Re-usable chart component for dashboard visualizations
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }>;
}

interface ChartOptions {
  responsive?: boolean;
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display?: boolean;
      beginAtZero?: boolean;
      max?: number;
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
}

interface ZPChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: ChartData;
  options?: ChartOptions;
  className?: string;
  height?: number;
  width?: number;
}

export function ZPChart({ 
  type, 
  data, 
  options = {}, 
  className,
  height = 300,
  width = 400
}: ZPChartProps) {
  // For now, we'll render a placeholder chart
  // In a real implementation, this would integrate with a charting library like Chart.js or Recharts
  
  const defaultOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    ...options,
  };

  return (
    <div className={cn('w-full', className)}>
      <div 
        className="flex items-center justify-center border rounded-lg bg-gray-50"
        style={{ height: `${height}px`, width: `${width}px` }}
      >
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {data.labels.length} data points
          </div>
          
          {/* Simple bar chart representation */}
          {type === 'bar' && (
            <div className="flex items-end space-x-1 h-32">
              {data.datasets[0]?.data.slice(0, 5).map((value, index) => (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t"
                  style={{
                    height: `${(value / Math.max(...data.datasets[0].data)) * 100}%`,
                    width: '20px',
                  }}
                  title={`${data.labels[index]}: ${value}`}
                />
              ))}
            </div>
          )}
          
          {/* Simple line chart representation */}
          {type === 'line' && (
            <div className="relative h-32 w-full">
              <svg className="w-full h-full" viewBox="0 0 400 120">
                <polyline
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                  points={data.datasets[0]?.data.map((value, index) => {
                    const x = (index / (data.datasets[0].data.length - 1)) * 400;
                    const y = 120 - (value / Math.max(...data.datasets[0].data)) * 100;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </svg>
            </div>
          )}
          
          {/* Simple doughnut chart representation */}
          {(type === 'doughnut' || type === 'pie') && (
            <div className="relative h-32 w-32 mx-auto">
              <div className="w-full h-full rounded-full border-8 border-blue-500 flex items-center justify-center">
                <div className="text-sm font-medium">
                  {data.datasets[0]?.data.reduce((sum, value) => sum + value, 0)}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            Chart visualization placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
