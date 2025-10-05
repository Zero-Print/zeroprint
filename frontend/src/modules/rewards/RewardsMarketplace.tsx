'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { t } from '@/lib/i18n';
import { Coins, Gift, RefreshCw, Filter } from 'lucide-react';
import { RewardCard } from './RewardCard';
import { RedemptionModal } from './RedemptionModal';

interface Reward {
  id: string;
  title: string;
  description?: string;
  coinCost: number;
  stock: number;
  imageUrl?: string;
  type: 'voucher' | 'product' | 'credit';
  partnerId?: string;
  createdAt: Date;
  createdBy: string;
}

interface RewardsMarketplaceProps {
  rewards: Reward[];
  userCoins: number;
  onRedeem: (rewardId: string) => Promise<{ success: boolean; message: string; redemptionId?: string }>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function RewardsMarketplace({ 
  rewards, 
  userCoins, 
  onRedeem, 
  onRefresh,
  isLoading = false
}: RewardsMarketplaceProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemClick = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setSelectedReward(reward);
      setIsModalOpen(true);
    }
  };

  const handleConfirmRedemption = async (rewardId: string) => {
    setIsRedeeming(true);
    try {
      await onRedeem(rewardId);
      setIsModalOpen(false);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReward(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
            {t('rewards.marketplaceTitle')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('rewards.marketplaceSubtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Coins className="h-5 w-5 text-amber-500" />
            <span className="font-bold text-amber-600">{userCoins} HC</span>
          </div>
          
          <ZPButton
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('rewards.refresh')}
          </ZPButton>
        </div>
      </div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : rewards.length === 0 ? (
        <ZPCard className="text-center py-12">
          <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No rewards available</h3>
          <p className="text-gray-500">Check back later for new rewards!</p>
        </ZPCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward as any}
              onRedeem={handleRedeemClick}
              userCoins={userCoins}
            />
          ))}
        </div>
      )}

      {/* Redemption Modal */}
      {selectedReward && (
        <RedemptionModal
          reward={selectedReward}
          userCoins={userCoins}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmRedemption}
          isLoading={isRedeeming}
        />
      )}
    </div>
  );
}