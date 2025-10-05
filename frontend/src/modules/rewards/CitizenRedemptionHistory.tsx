'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { RedemptionHistoryItem } from './RedemptionHistoryItem';
import { Gift } from 'lucide-react';

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

interface CitizenRedemptionHistoryProps {
  redemptions: Redemption[];
  isLoading?: boolean;
}

export function CitizenRedemptionHistory({ redemptions, isLoading = false }: CitizenRedemptionHistoryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Redemption History</h2>
        <p className="text-gray-600 mt-1">
          View your past reward redemptions
        </p>
      </div>

      <ZPCard>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : redemptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No redemptions yet</h3>
            <p className="text-gray-500">Redeem rewards to see them appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {redemptions.map((redemption) => (
              <RedemptionHistoryItem 
                key={redemption.id} 
                redemption={redemption} 
                rewardTitle={`Reward ${redemption.rewardId}`}
              />
            ))}
          </div>
        )}
      </ZPCard>
    </div>
  );
}