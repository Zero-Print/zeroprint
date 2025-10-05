'use client';

import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { ZPCard } from '@/components/ZPCard';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface WalletCardProps {
  healCoins: number;
  inrBalance: number;
  walletAddress?: string;
  recentTransactions?: {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    timestamp: string;
  }[];
  onViewHistory?: () => void;
}

export function WalletCard({
  healCoins = 0,
  inrBalance = 0,
  walletAddress,
  recentTransactions = [],
  onViewHistory,
}: WalletCardProps) {
  const [showTransactions, setShowTransactions] = useState(false);

  const toggleTransactions = () => {
    setShowTransactions(!showTransactions);
  };

  return (
    <ZPCard className="overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Your Wallet</h3>
          </div>
          {walletAddress && (
            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">HealCoins</div>
            <div className="text-2xl font-bold text-green-600">{healCoins.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">INR Balance</div>
            <div className="text-2xl font-bold text-blue-600">₹{formatCurrency(inrBalance)}</div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full bg-white"
          onClick={toggleTransactions}
          aria-expanded={showTransactions}
        >
          {showTransactions ? 'Hide' : 'Show'} Recent Transactions
        </Button>
      </div>

      {showTransactions && (
        <div className="p-4 bg-white border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Transactions</h4>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {transaction.type === 'credit' ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{transaction.description}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'} {transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500 text-sm">No recent transactions</div>
          )}
          {recentTransactions.length > 3 && onViewHistory && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-blue-600"
              onClick={onViewHistory}
            >
              View Full History
            </Button>
          )}
        </div>
      )}
    </ZPCard>
  );
}