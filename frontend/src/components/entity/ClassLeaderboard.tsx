'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPBadge } from '@/components/ZPBadge';
import { Trophy, TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';

interface LeaderboardItem {
  id: string;
  name: string;
  score: number;
  rank: number;
  change: number;
  department?: string;
  co2Saved?: number;
  healCoins?: number;
}

interface ClassLeaderboardProps {
  items: LeaderboardItem[];
  title?: string;
  entityType: 'school' | 'msme';
}

export const ClassLeaderboard: React.FC<ClassLeaderboardProps> = ({
  items,
  title = 'Leaderboard',
  entityType,
}) => {
  const [sortField, setSortField] = useState<'score' | 'co2Saved' | 'healCoins'>('score');
  
  const sortedItems = [...items].sort((a, b) => {
    if (sortField === 'score') {
      return b.score - a.score;
    } else if (sortField === 'co2Saved' && a.co2Saved && b.co2Saved) {
      return b.co2Saved - a.co2Saved;
    } else if (sortField === 'healCoins' && a.healCoins && b.healCoins) {
      return b.healCoins - a.healCoins;
    }
    return 0;
  });

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const unitLabel = entityType === 'school' ? 'Class' : 'Unit';

  return (
    <ZPCard className="w-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium text-gray-800">{title || `${unitLabel} Leaderboard`}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortField('score')}
              className={`px-2 py-1 text-xs rounded-md ${
                sortField === 'score' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              EcoScore
            </button>
            <button
              onClick={() => setSortField('co2Saved')}
              className={`px-2 py-1 text-xs rounded-md ${
                sortField === 'co2Saved' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              CO₂ Saved
            </button>
            <button
              onClick={() => setSortField('healCoins')}
              className={`px-2 py-1 text-xs rounded-md ${
                sortField === 'healCoins' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              HealCoins
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {unitLabel}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EcoScore
              </th>
              {entityType === 'msme' && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CO₂ Saved
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                HealCoins
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedItems.map((item, index) => (
              <tr key={item.id} className={index < 3 ? 'bg-green-50' : ''}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {index < 3 ? (
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {index + 1}
                      </div>
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ZPBadge variant={
                    item.score >= 80 ? 'success' :
                    item.score >= 60 ? 'warning' : 'danger'
                  }>
                    {item.score}
                  </ZPBadge>
                </td>
                {entityType === 'msme' && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.department || 'N/A'}
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.co2Saved ? `${item.co2Saved} kg` : 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.healCoins || 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {getChangeIcon(item.change)}
                    <span className={`ml-1 text-sm ${
                      item.change > 0 ? 'text-green-500' :
                      item.change < 0 ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {Math.abs(item.change)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ZPCard>
  );
};

export default ClassLeaderboard;