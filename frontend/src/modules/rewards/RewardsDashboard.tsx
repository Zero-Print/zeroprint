'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { Coins, Gift, History, BarChart3 } from 'lucide-react';
import { RewardsMarketplace } from './RewardsMarketplace';
import { CitizenRedemptionHistory } from './CitizenRedemptionHistory';

interface Reward {
  id: string;
  title: string;
  description?: string;
  coinCost: number;
  stock: number;
  imageUrl?: string;
  type: 'voucher' | 'product' | 'credit';
  createdAt: Date;
  createdBy: string;
}

interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  coinsSpent: number;
  status: 'success' | 'failed' | 'pending';
  voucherCode?: string;
  createdAt: Date;
  processedBy: string;
}

interface RewardsDashboardProps {
  user: {
    id: string;
    displayName: string;
    healCoins: number;
  };
  rewards: Reward[];
  redemptions: Redemption[];
  onRedeem: (rewardId: string) => Promise<{ success: boolean; message: string; redemptionId?: string }>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function RewardsDashboard({ 
  user, 
  rewards, 
  redemptions, 
  onRedeem, 
  onRefresh,
  isLoading = false
}: RewardsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'history'>('marketplace');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg shadow-gray-100/30 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
                    Rewards Marketplace 🎁
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Redeem your HealCoins for exciting rewards
                  </p>
                </div>
              </div>
              <div className="ml-auto lg:ml-0 flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-200 px-4 py-2 rounded-full border border-amber-300 shadow-sm">
                <Coins className="h-5 w-5 text-amber-600" />
                <span className="font-bold text-amber-700">{user.healCoins} HC</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200/30 mt-4">
            <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2">
              {[
                { id: 'marketplace', label: 'Marketplace', icon: Gift },
                { id: 'history', label: 'Redemption History', icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 font-semibold text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap relative group ${
                    activeTab === tab.id
                      ? 'text-emerald-700'
                      : 'text-gray-500 hover:text-emerald-600'
                  }`}
                >
                  {React.createElement(tab.icon, { className: "h-5 w-5" })}
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                  )}
                  {activeTab !== tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200/50 group-hover:bg-gray-300/70 rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'marketplace' && (
          <RewardsMarketplace
            rewards={rewards}
            userCoins={user.healCoins}
            onRedeem={onRedeem}
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'history' && (
          <CitizenRedemptionHistory
            redemptions={redemptions}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}