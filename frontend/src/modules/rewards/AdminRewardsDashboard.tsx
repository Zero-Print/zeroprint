'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { Gift, History, Settings, BarChart3, Plus } from 'lucide-react';
import { AdminRewardManagement } from './AdminRewardManagement';
import { AdminRedemptionHistory } from './AdminRedemptionHistory';
import { RewardForm } from './RewardForm';
import { RewardsAnalyticsDashboard } from './RewardsAnalyticsDashboard';

interface Reward {
  id: string;
  title: string;
  description?: string;
  coinCost: number;
  stock: number;
  type: 'voucher' | 'product' | 'credit';
  imageUrl?: string;
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

interface AdminRedemptionHistoryItem {
  id: string;
  userId: string;
  userName: string;
  rewardId: string;
  rewardTitle: string;
  coinsSpent: number;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  processedBy: string;
  voucherCode?: string;
}

interface AdminRewardsDashboardProps {
  rewards: Reward[];
  redemptions: Redemption[];
  onAddReward: () => void;
  onEditReward: (rewardId: string) => void;
  onDeleteReward: (rewardId: string) => void;
  onUploadVouchers: (file: File, rewardId: string) => Promise<{ success: boolean; message: string }>;
  onExportRewards: () => void;
  onExportRedemptions: () => void;
  onRedeem: (rewardId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AdminRewardsDashboard({ 
  rewards,
  redemptions,
  onAddReward,
  onEditReward,
  onDeleteReward,
  onUploadVouchers,
  onExportRewards,
  onExportRedemptions,
  onRedeem,
  isLoading = false
}: AdminRewardsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'management' | 'history' | 'analytics'>('management');
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Transform redemptions for AdminRedemptionHistory component
  const transformedRedemptions: AdminRedemptionHistoryItem[] = redemptions.map(redemption => {
    // Find the reward to get the title
    const reward = rewards.find(r => r.id === redemption.rewardId);
    
    return {
      ...redemption,
      userName: `User ${redemption.userId.slice(-4)}`, // Mock user name
      rewardTitle: reward?.title || `Reward ${redemption.rewardId}`,
      createdAt: redemption.createdAt.toISOString()
    };
  });

  const handleAddReward = () => {
    setEditingReward(null);
    setShowRewardForm(true);
  };

  const handleEditReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setEditingReward(reward);
      setShowRewardForm(true);
    }
  };

  const handleFormSubmit = (rewardData: any) => {
    if (editingReward) {
      // Update existing reward
      console.log('Updating reward:', rewardData);
    } else {
      // Add new reward
      console.log('Adding new reward:', rewardData);
    }
    setShowRewardForm(false);
  };

  const handleFormCancel = () => {
    setShowRewardForm(false);
    setEditingReward(null);
  };

  if (showRewardForm) {
    return (
      <RewardForm
        reward={editingReward || undefined}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg shadow-gray-100/30 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
                    Rewards Admin Dashboard ⚙️
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Manage rewards and view redemption history
                  </p>
                </div>
              </div>
            </div>
            
            <ZPButton
              variant="primary"
              onClick={handleAddReward}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Reward
            </ZPButton>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200/30 mt-4">
            <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2">
              {[
                { id: 'management', label: 'Reward Management', icon: Settings },
                { id: 'history', label: 'Redemption History', icon: History },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
        {activeTab === 'management' && (
          <AdminRewardManagement
            rewards={rewards}
            onAddReward={handleAddReward}
            onEditReward={handleEditReward}
            onDeleteReward={onDeleteReward}
            onUploadVouchers={onUploadVouchers}
            onExportRewards={onExportRewards}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'history' && (
          <AdminRedemptionHistory
            redemptions={transformedRedemptions}
            onExport={onExportRedemptions}
            isLoading={isLoading}
          />
        )}
        
        {activeTab === 'analytics' && (
          <RewardsAnalyticsDashboard
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}