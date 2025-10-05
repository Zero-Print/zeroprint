'use client';

import React from 'react';
import { ZPBadge } from '@/components/ZPBadge';
import { Coins, Gift } from 'lucide-react';

interface RedemptionHistoryItemProps {
  redemption: {
    id: string;
    userId: string;
    rewardId: string;
    coinsSpent: number;
    status: 'success' | 'failed' | 'pending';
    voucherCode?: string;
    createdAt: Date;
    processedBy: string;
  };
  rewardTitle: string;
}

export function RedemptionHistoryItem({ redemption, rewardTitle }: RedemptionHistoryItemProps) {
  const getStatusBadge = () => {
    switch (redemption.status) {
      case 'success':
        return <ZPBadge variant="success">Success</ZPBadge>;
      case 'failed':
        return <ZPBadge variant="danger">Failed</ZPBadge>;
      case 'pending':
        return <ZPBadge variant="warning">Pending</ZPBadge>;
      default:
        return <ZPBadge variant="secondary">Unknown</ZPBadge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100">
          <Gift className="h-6 w-6 text-emerald-600" />
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900">{rewardTitle}</h4>
          <p className="text-sm text-gray-500">{formatDate(redemption.createdAt.toString())}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-amber-600">{redemption.coinsSpent} HC</span>
        </div>
        
        {getStatusBadge()}
      </div>
    </div>
  );
}