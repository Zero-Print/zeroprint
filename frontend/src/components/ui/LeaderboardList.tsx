'use client';

import React from 'react';
import Image from 'next/image';
import { ZPCard } from './ZPCard';
import { ZPBadge } from './ZPBadge';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  change?: number; // Position change from last period
  category: 'carbon' | 'mental-health' | 'animal-welfare' | 'overall';
  location?: string;
}

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
  showCategory?: boolean;
  maxEntries?: number;
  className?: string;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  entries,
  currentUserId,
  title = 'Leaderboard',
  showCategory = false,
  maxEntries = 10,
  className = '',
}) => {
  const displayEntries = entries?.slice(0, maxEntries) || [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getCategoryColor = (category: LeaderboardEntry['category']) => {
    switch (category) {
      case 'carbon':
        return 'text-green-600 dark:text-green-400';
      case 'mental-health':
        return 'text-blue-600 dark:text-blue-400';
      case 'animal-welfare':
        return 'text-purple-600 dark:text-purple-400';
      case 'overall':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryLabel = (category: LeaderboardEntry['category']) => {
    switch (category) {
      case 'carbon':
        return 'Carbon';
      case 'mental-health':
        return 'Mental Health';
      case 'animal-welfare':
        return 'Animal Welfare';
      case 'overall':
        return 'Overall';
      default:
        return category;
    }
  };

  const formatScore = (score: number) => {
    return new Intl.NumberFormat('en-US').format(score);
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    if (change > 0) {
      return <span className='text-green-500 text-xs'>↗ +{change}</span>;
    } else if (change < 0) {
      return <span className='text-red-500 text-xs'>↘ {change}</span>;
    }
    return <span className='text-gray-400 text-xs'>→ 0</span>;
  };

  return (
    <ZPCard className={`p-6 ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{title}</h3>
        <ZPBadge variant='secondary'>{displayEntries.length} entries</ZPBadge>
      </div>

      <div className='space-y-3'>
        {displayEntries.map(entry => {
          const isCurrentUser = entry.id === currentUserId;
          const rankIcon = getRankIcon(entry.rank);

          return (
            <div
              key={entry.id}
              className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                isCurrentUser
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-2 ring-blue-500/20'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
              }`}
            >
              {/* Rank */}
              <div className='flex items-center justify-center w-12 h-12 mr-4'>
                {rankIcon ? (
                  <span className='text-2xl'>{rankIcon}</span>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCurrentUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {entry.rank}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className='w-10 h-10 mr-3 flex-shrink-0'>
                {entry.avatar ? (
                  <Image
                    src={entry.avatar}
                    alt={entry.name}
                    width={40}
                    height={40}
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm'>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <h4
                    className={`font-medium truncate ${
                      isCurrentUser
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {entry.name}
                    {isCurrentUser && (
                      <span className='ml-2 text-xs text-blue-600 dark:text-blue-400'>(You)</span>
                    )}
                  </h4>
                  {getChangeIcon(entry.change)}
                </div>

                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  {entry.location && <span className='truncate'>{entry.location}</span>}
                  {showCategory && (
                    <ZPBadge
                      variant='secondary'
                      className={`text-xs ${getCategoryColor(entry.category)}`}
                    >
                      {getCategoryLabel(entry.category)}
                    </ZPBadge>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className='text-right'>
                <div
                  className={`text-lg font-bold ${
                    isCurrentUser
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {formatScore(entry.score)}
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>points</div>
              </div>
            </div>
          );
        })}
      </div>

      {(entries?.length || 0) > maxEntries && (
        <div className='mt-4 text-center'>
          <button className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium'>
            View All {entries?.length || 0} Entries
          </button>
        </div>
      )}
    </ZPCard>
  );
};
