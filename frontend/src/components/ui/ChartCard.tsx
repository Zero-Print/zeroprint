'use client';

import React from 'react';
import { ZPCard } from './ZPCard';
import { cn } from '@/lib/utils';

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  type?: 'line' | 'bar' | 'area' | 'pie';
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  color?: string;
  className?: string;
  loading?: boolean;
  error?: string;
  actions?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  data,
  type = 'line',
  dataKey,
  xAxisKey,
  height = 300,
  color = '#2E7D32',
  className,
  loading = false,
  error,
  actions,
}) => {
  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">No data available</p>
        </div>
      );
    }

    // Simple placeholder chart visualization
    const maxValue = Math.max(...data.map(item => Number(item[dataKey]) || 0));
    
    return (
      <div className="w-full h-full flex items-end justify-center space-x-2 p-4">
        {data.slice(0, 10).map((item, index) => {
          const value = Number(item[dataKey]) || 0;
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div
                className="w-8 rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${Math.max(heightPercent, 5)}%`,
                  backgroundColor: color,
                  minHeight: '10px'
                }}
                title={`${item[xAxisKey || 'x']}: ${value}`}
              />
              {xAxisKey && (
                <span className="text-xs text-muted-foreground truncate w-8 text-center">
                  {String(item[xAxisKey]).slice(0, 3)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ZPCard className={cn('', className)}>
      <ZPCard.Header actions={actions}>
        <ZPCard.Title>{title}</ZPCard.Title>
        {description && <ZPCard.Description>{description}</ZPCard.Description>}
      </ZPCard.Header>
      <ZPCard.Body>
        <div style={{ height }}>
          {renderChart()}
        </div>
      </ZPCard.Body>
    </ZPCard>
  );
};

// Preset chart components for common use cases
export const CarbonChart: React.FC<Omit<ChartCardProps, 'type' | 'color'>> = (props) => (
  <ChartCard {...props} type="area" color="#2E7D32" />
);

export const EnergyChart: React.FC<Omit<ChartCardProps, 'type' | 'color'>> = (props) => (
  <ChartCard {...props} type="line" color="#0288D1" />
);

export const HealCoinChart: React.FC<Omit<ChartCardProps, 'type' | 'color'>> = (props) => (
  <ChartCard {...props} type="bar" color="#FFD700" />
);

ChartCard.displayName = 'ChartCard';

export default ChartCard;