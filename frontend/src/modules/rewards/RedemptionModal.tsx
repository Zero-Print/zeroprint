'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { Coins, Gift, X } from 'lucide-react';

interface RedemptionModalProps {
  reward: {
    id: string;
    title: string;
    description?: string;
    coinCost: number;
    imageUrl?: string;
    type: 'voucher' | 'product' | 'credit';
  };
  userCoins: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rewardId: string) => Promise<{ success: boolean; message: string; redemptionId?: string }>;
  isLoading?: boolean;
}

export function RedemptionModal({ 
  reward, 
  userCoins, 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false
}: RedemptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(reward.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const notEnoughCoins = userCoins < reward.coinCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <ZPCard className="w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="text-center">
          {reward.imageUrl ? (
            <img 
              src={reward.imageUrl} 
              alt={reward.title} 
              className="w-32 h-32 mx-auto mb-4 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
              <Gift className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Redemption</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to redeem this reward?</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{reward.title}</h3>
            {reward.description && (
              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
            )}
            
            <div className="flex justify-center items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <span className="text-xl font-bold text-amber-600">{reward.coinCost} HC</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6 p-3 bg-amber-50 rounded-lg">
            <span className="text-gray-700">Your Balance:</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-amber-600">{userCoins} HC</span>
            </div>
          </div>
          
          {notEnoughCoins && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              You need {reward.coinCost - userCoins} more HealCoins to redeem this reward.
            </div>
          )}
          
          <div className="flex gap-3">
            <ZPButton
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing || isLoading}
            >
              Cancel
            </ZPButton>
            
            <ZPButton
              variant="primary"
              onClick={handleConfirm}
              className="flex-1"
              disabled={notEnoughCoins || isProcessing || isLoading}
              loading={isProcessing || isLoading}
            >
              Confirm
            </ZPButton>
          </div>
        </div>
      </ZPCard>
    </div>
  );
}