'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { Coins, Gift } from 'lucide-react';

interface RewardCardProps {
  reward: {
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
  };
  onRedeem: (rewardId: string) => void;
  userCoins: number;
  disabled?: boolean;
}

export function RewardCard({ reward, onRedeem, userCoins, disabled }: RewardCardProps) {
  const isOutOfStock = reward.stock <= 0;
  const notEnoughCoins = userCoins < reward.coinCost;
  const isDisabled = disabled || isOutOfStock || notEnoughCoins;

  const getTypeIcon = () => {
    switch (reward.type) {
      case 'voucher': return <Gift className="h-5 w-5 text-purple-500" />;
      case 'product': return <Gift className="h-5 w-5 text-green-500" />;
      case 'credit': return <Coins className="h-5 w-5 text-amber-500" />;
      default: return <Gift className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = () => {
    switch (reward.type) {
      case 'voucher': return 'from-purple-50 to-purple-100 border-purple-200';
      case 'product': return 'from-green-50 to-green-100 border-green-200';
      case 'credit': return 'from-amber-50 to-amber-100 border-amber-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <ZPCard 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${getTypeColor()} ${isDisabled ? 'opacity-70' : ''}`}
    >
      <div className="absolute top-2 right-2">
        {getTypeIcon()}
      </div>
      
      {reward.imageUrl ? (
        <img 
          src={reward.imageUrl} 
          alt={reward.title} 
          className="w-full h-40 object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
          <Gift className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{reward.title}</h3>
            {reward.description && (
              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
            )}
          </div>
          {reward.partnerId && (
            <span className="inline-flex h-6 items-center rounded-full bg-indigo-50 px-2.5 text-xs font-medium text-indigo-700">Partner</span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-amber-600">{reward.coinCost} HC</span>
          </div>
          
          <div className="text-sm">
            {isOutOfStock ? (
              <span className="text-red-500 font-medium">Out of stock</span>
            ) : (
              <span className="text-gray-600">{reward.stock} available</span>
            )}
          </div>
        </div>
        
        <ZPButton
          variant="primary"
          className="w-full"
          onClick={() => onRedeem(reward.id)}
          disabled={isDisabled}
          title={
            isOutOfStock 
              ? "This reward is out of stock" 
              : notEnoughCoins 
                ? `You need ${reward.coinCost - userCoins} more HealCoins` 
                : "Redeem this reward"
          }
        >
          {isOutOfStock ? "Out of Stock" : "Redeem"}
        </ZPButton>
      </div>
    </ZPCard>
  );
}