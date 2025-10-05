'use client';

import React from 'react';
import { AdminRewardsDashboard } from '@/modules/rewards/AdminRewardsDashboard';
import { useRewards } from '@/modules/rewards/useRewards';

export default function AdminRewardsPage() {
  const { 
    rewards, 
    redemptions, 
    loading, 
    error, 
    handleAddReward,
    handleUpdateReward,
    handleDeleteReward,
    handleRedeem,
    fetchRewards
  } = useRewards(); // No user ID for admin

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchRewards}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminRewardsDashboard
      rewards={rewards}
      redemptions={redemptions}
      onAddReward={handleAddReward}
      onEditReward={handleUpdateReward}
      onDeleteReward={handleDeleteReward}
      onUploadVouchers={() => console.log('Upload vouchers')}
      onExportRewards={() => console.log('Export rewards')}
      onExportRedemptions={() => console.log('Export redemptions')}
      onRedeem={handleRedeem}
      isLoading={loading}
    />
  );
}