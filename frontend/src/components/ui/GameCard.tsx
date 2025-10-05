'use client';

import React from 'react';
import { ZPCard } from './ZPCard';
import { ZPButton } from './ZPButton';
import { ZPBadge } from './ZPBadge';

interface GameCardProps {
  type: 'challenge' | 'achievement' | 'reward' | 'quest';
  title: string;
  description: string;
  icon?: string;
  progress?: {
    current: number;
    total: number;
    unit?: string;
  };
  reward?: {
    amount: number;
    type: 'tokens' | 'points' | 'badge';
  };
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: {
    endDate: Date;
    isExpired: boolean;
  };
  status: 'available' | 'in-progress' | 'completed' | 'locked' | 'expired';
  category: 'carbon' | 'mental-health' | 'animal-welfare' | 'community';
  onStart?: () => void;
  onClaim?: () => void;
  onView?: () => void;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  type,
  title,
  description,
  icon,
  progress,
  reward,
  difficulty,
  timeLimit,
  status,
  category,
  onStart,
  onClaim,
  onView,
  className = '',
}) => {
  const getTypeIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'challenge':
        return '🎯';
      case 'achievement':
        return '🏆';
      case 'reward':
        return '🎁';
      case 'quest':
        return '⚔️';
      default:
        return '🎮';
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'carbon':
        return 'from-green-500 to-emerald-600';
      case 'mental-health':
        return 'from-blue-500 to-indigo-600';
      case 'animal-welfare':
        return 'from-purple-500 to-pink-600';
      case 'community':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'locked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatTimeRemaining = () => {
    if (!timeLimit) return null;

    const now = new Date();
    const diff = timeLimit.endDate.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getProgressPercentage = () => {
    if (!progress) return 0;
    return Math.min((progress.current / progress.total) * 100, 100);
  };

  const isDisabled = status === 'locked' || status === 'expired';

  return (
    <ZPCard
      className={`p-6 relative overflow-hidden ${isDisabled ? 'opacity-60' : ''} ${className}`}
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getCategoryColor()}`} />

      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='text-2xl'>{getTypeIcon()}</div>
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white text-lg'>{title}</h3>
            <div className='flex items-center gap-2 mt-1'>
              <ZPBadge variant='secondary' className={getStatusColor()}>
                {status?.replace('-', ' ') || 'Unknown'}
              </ZPBadge>
              {difficulty && (
                <ZPBadge variant='secondary' className={getDifficultyColor()}>
                  {difficulty}
                </ZPBadge>
              )}
            </div>
          </div>
        </div>

        {timeLimit && !timeLimit.isExpired && (
          <div className='text-right'>
            <div className='text-xs text-gray-500 dark:text-gray-400'>Time left</div>
            <div className='text-sm font-medium text-orange-600 dark:text-orange-400'>
              {formatTimeRemaining()}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className='text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed'>{description}</p>

      {/* Progress Bar */}
      {progress && status === 'in-progress' && (
        <div className='mb-4'>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-gray-600 dark:text-gray-400'>Progress</span>
            <span className='font-medium text-gray-900 dark:text-white'>
              {progress.current}/{progress.total} {progress.unit || ''}
            </span>
          </div>
          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor()} transition-all duration-300`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}

      {/* Reward */}
      {reward && (
        <div className='flex items-center gap-2 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
          <span className='text-yellow-600 dark:text-yellow-400'>🎁</span>
          <span className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
            Reward: {reward.amount} {reward.type === 'tokens' ? 'ZPT' : reward.type}
          </span>
        </div>
      )}

      {/* Action Button */}
      <div className='flex gap-2'>
        {status === 'available' && onStart && (
          <ZPButton variant='primary' onClick={onStart} disabled={isDisabled} className='flex-1'>
            Start {type}
          </ZPButton>
        )}

        {status === 'in-progress' && onView && (
          <ZPButton variant='outline' onClick={onView} className='flex-1'>
            Continue
          </ZPButton>
        )}

        {status === 'completed' && onClaim && (
          <ZPButton variant='primary' onClick={onClaim} className='flex-1'>
            Claim Reward
          </ZPButton>
        )}

        {status === 'completed' && !onClaim && (
          <ZPButton variant='secondary' disabled className='flex-1'>
            ✓ Completed
          </ZPButton>
        )}

        {status === 'locked' && (
          <ZPButton variant='secondary' disabled className='flex-1'>
            🔒 Locked
          </ZPButton>
        )}

        {status === 'expired' && (
          <ZPButton variant='secondary' disabled className='flex-1'>
            ⏰ Expired
          </ZPButton>
        )}
      </div>
    </ZPCard>
  );
};
