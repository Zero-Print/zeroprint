'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';

interface TrackerMetric {
  label: string;
  value: number;
  unit: string;
  change?: {
    value: number;
    period: string;
    isPositive: boolean;
  };
  target?: number;
}

interface TrackerCardProps {
  type: 'carbon' | 'mental-health' | 'animal-welfare' | 'digital-twin';
  title: string;
  description?: string;
  metrics: TrackerMetric[];
  overallScore?: {
    value: number;
    maxValue: number;
    label: string;
  };
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: Date;
  onViewDetails?: () => void;
  onAddEntry?: () => void;
  className?: string;
}

export const TrackerCard: React.FC<TrackerCardProps> = ({
  type,
  title,
  description,
  metrics,
  overallScore,
  trend,
  lastUpdated,
  onViewDetails,
  onAddEntry,
  className = '',
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'carbon':
        return '🌱';
      case 'mental-health':
        return '🧠';
      case 'animal-welfare':
        return '🐾';
      case 'digital-twin':
        return '🌍';
      default:
        return '📊';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'carbon':
        return {
          gradient: 'from-green-500 to-emerald-600',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-600 dark:text-green-400',
          button: 'bg-green-600 hover:bg-green-700',
        };
      case 'mental-health':
        return {
          gradient: 'from-blue-500 to-indigo-600',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'animal-welfare':
        return {
          gradient: 'from-purple-500 to-pink-600',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-600 dark:text-purple-400',
          button: 'bg-purple-600 hover:bg-purple-700',
        };
      case 'digital-twin':
        return {
          gradient: 'from-orange-500 to-red-600',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-600 dark:text-orange-400',
          button: 'bg-orange-600 hover:bg-orange-700',
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          button: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return { icon: '📈', color: 'text-green-600 dark:text-green-400', label: 'Improving' };
      case 'declining':
        return { icon: '📉', color: 'text-red-600 dark:text-red-400', label: 'Declining' };
      case 'stable':
        return { icon: '➡️', color: 'text-gray-600 dark:text-gray-400', label: 'Stable' };
      default:
        return { icon: '📊', color: 'text-gray-600 dark:text-gray-400', label: 'Unknown' };
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    }
    return `${value.toFixed(1)} ${unit}`;
  };

  const formatDate = (date: Date) => {
    // Check if date is valid
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown';
    }
    
    // Use a fixed reference date to avoid hydration mismatches
    const referenceDate = new Date('2023-01-01T00:00:00Z');
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const getScorePercentage = () => {
    if (!overallScore) return 0;
    return Math.min((overallScore.value / overallScore.maxValue) * 100, 100);
  };

  const colors = getTypeColor();
  const trendInfo = getTrendIcon();

  // Ensure metrics is always an array
  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  return (
    <ZPCard className={`p-6 relative overflow-hidden ${className}`}>
      {/* Background Gradient */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.gradient}`} />

      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='text-2xl'>{getTypeIcon()}</div>
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white text-lg'>{title}</h3>
            {description && (
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{description}</p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-lg'>{trendInfo.icon}</span>
          <ZPBadge variant='secondary' className={trendInfo.color}>
            {trendInfo.label}
          </ZPBadge>
        </div>
      </div>

      {/* Overall Score */}
      {overallScore && (
        <div className={`p-4 rounded-lg ${colors.bg} ${colors.border} border mb-4`}>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              {overallScore.label}
            </span>
            <span className={`text-lg font-bold ${colors.text}`}>
              {overallScore.value}/{overallScore.maxValue}
            </span>
          </div>
          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-300`}
              style={{ width: `${getScorePercentage()}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
        {safeMetrics.length > 0 ? safeMetrics.map((metric, index) => (
          <div key={index} className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                {metric.label}
              </span>
              {metric.change && (
                <ZPBadge
                  variant={metric.change.isPositive ? 'success' : 'danger'}
                  size='sm'
                  className='text-xs'
                >
                  {metric.change.isPositive ? '+' : ''}
                  {metric.change.value}
                  {metric.change.period === 'percentage' ? '%' : ''}
                </ZPBadge>
              )}
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='text-xl font-bold text-gray-900 dark:text-white'>
                {formatValue(metric.value, metric.unit)}
              </span>
              {metric.target && (
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  of {metric.target}
                  {metric.unit}
                </span>
              )}
            </div>
          </div>
        )) : (
          <div className='col-span-full text-center py-4 text-gray-500'>
            No metrics available
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='text-xs text-gray-500 dark:text-gray-400'>
          Last updated {formatDate(lastUpdated)}
        </div>

        <div className='flex gap-2'>
          {onAddEntry && (
            <ZPButton variant='outline' size='sm' onClick={onAddEntry}>
              <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              Add Entry
            </ZPButton>
          )}

          {onViewDetails && (
            <ZPButton variant='primary' size='sm' className={colors.button} onClick={onViewDetails}>
              View Details
            </ZPButton>
          )}
        </div>
      </div>
    </ZPCard>
  );
};