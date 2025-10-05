'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { Coins, Users, Leaf, TrendingUp } from 'lucide-react';

interface KPIBarProps {
  healCoins: number;
  co2Saved: number;
  activeUsers: number;
  totalMembers: number;
  monthlyGrowth: number;
}

export const KPIBar: React.FC<KPIBarProps> = ({
  healCoins,
  co2Saved,
  activeUsers,
  totalMembers,
  monthlyGrowth,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const activePercentage = Math.round((activeUsers / totalMembers) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <ZPCard className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">HealCoins (30d)</h3>
          <Coins className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatNumber(healCoins)}</p>
            <p className="text-xs text-gray-500">Total earned this month</p>
          </div>
          <div className="flex items-center text-green-500 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+{monthlyGrowth}%</span>
          </div>
        </div>
      </ZPCard>

      <ZPCard className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">CO₂ Saved</h3>
          <Leaf className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatNumber(co2Saved)} kg</p>
            <p className="text-xs text-gray-500">Total carbon reduction</p>
          </div>
          <div className="flex items-center text-green-500 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+{monthlyGrowth}%</span>
          </div>
        </div>
      </ZPCard>

      <ZPCard className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <Users className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{activeUsers}</p>
            <p className="text-xs text-gray-500">{activePercentage}% of total members</p>
          </div>
          <div className="flex items-center text-green-500 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+{monthlyGrowth}%</span>
          </div>
        </div>
      </ZPCard>

      <ZPCard className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Growth</h3>
          <TrendingUp className="h-5 w-5 text-purple-500" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{monthlyGrowth}%</p>
            <p className="text-xs text-gray-500">Month-over-month</p>
          </div>
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full border-4 border-purple-100 flex items-center justify-center">
                <div 
                  className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                >
                  {monthlyGrowth}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </ZPCard>
    </div>
  );
};

export default KPIBar;