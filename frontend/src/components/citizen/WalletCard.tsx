'use client';

import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { ZPCard } from '@/components/ZPCard';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';

interface WalletCardProps {
  healCoins?: number;
  inrBalance?: number;
  walletAddress?: string;
  recentTransactions?: {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    timestamp: string;
  }[];
  onViewHistory?: () => void;
  showTransactions?: boolean;
  lastUpdated?: string;
  isLoading?: boolean;
  error?: string;
  onEarnCoins?: () => void;
  onRedeemCoins?: () => void;
  className?: string;
  compact?: boolean;
  // Support for wallet object from hooks
  wallet?: {
    healCoins?: number;
    balance?: number;
    inrBalance?: number;
    lastUpdated?: string;
    lastTransaction?: {
      type: 'credit' | 'debit';
      amount: number;
      createdAt: string;
    };
  };
}

export function WalletCard({
  healCoins = 0,
  inrBalance = 0,
  walletAddress,
  recentTransactions = [],
  onViewHistory,
  showTransactions = false,
  lastUpdated,
  isLoading = false,
  error,
  onEarnCoins,
  onRedeemCoins,
  className,
  compact = false,
  wallet,
}: WalletCardProps) {
  const [internalShowTransactions, setInternalShowTransactions] = useState(showTransactions);
  
  // Use wallet hook if not provided as prop
  const { wallet: hookWallet, transactions: hookTransactions, loading: hookLoading, error: hookError, refreshWallet: hookRefreshWallet } = useWallet();
  const { user } = useAuth();

  // Use wallet prop if provided, otherwise use hook data, otherwise use individual props
  const displayWallet = wallet || hookWallet || { healCoins: healCoins, inrBalance: inrBalance };
  const displayLoading = isLoading || hookLoading;
  const displayError = error || hookError;
  
  const displayHealCoins = displayWallet.healCoins || displayWallet.balance || 0;
  const displayInrBalance = displayWallet.inrBalance || 0;
  const displayLastUpdated = lastUpdated || displayWallet.lastUpdated;

  const toggleTransactions = () => {
    setInternalShowTransactions(!internalShowTransactions);
  };

  // Mock transaction data for tests
  const mockTransactions = [
    {
      id: 'tx-1',
      type: 'credit' as const,
      amount: 10,
      description: 'Quiz completion reward',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      type: 'debit' as const,
      amount: 25,
      description: 'Voucher redemption',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  // Use provided transactions or empty array (tests expect empty state)
  const displayTransactions = recentTransactions.length > 0 ? recentTransactions : hookTransactions;

  // Handle loading state
  if (displayLoading) {
    return (
      <ZPCard className={`overflow-hidden ${className || ''}`} data-testid="wallet-loading">
        <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="text-center mt-4 text-gray-600">Loading wallet...</div>
        </div>
      </ZPCard>
    );
  }

  // Handle error state
  if (displayError) {
    return (
      <ZPCard className={`overflow-hidden ${className || ''}`} data-testid="wallet-error">
        <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="text-center">
            <div className="text-red-600 font-medium mb-2">Error loading wallet</div>
            <div className="text-sm text-gray-600">{displayError}</div>
            <button 
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => hookRefreshWallet()}
            >
              Retry
            </button>
          </div>
        </div>
      </ZPCard>
    );
  }

  // Handle zero balance state
  const isZeroBalance = displayHealCoins === 0 && displayInrBalance === 0;

  return (
    <ZPCard className={`overflow-hidden ${className || ''}`} data-testid={compact ? "wallet-card-compact" : "wallet-card"} aria-label="Wallet balance">
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
            <div 
              className={`text-2xl font-bold text-green-600 ${displayHealCoins > 0 ? 'animate-balance-change' : ''}`}
              data-testid={
                isZeroBalance ? "wallet-balance-zero" : 
                displayHealCoins >= 100 ? "wallet-balance-high" :
                displayHealCoins < 50 ? "wallet-balance-low" :
                "wallet-balance"
              }
              aria-label={`HealCoins balance: ${displayHealCoins}`}
            >
              {displayHealCoins.toLocaleString('en-US')}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">INR Balance</div>
            <div className="text-2xl font-bold text-blue-600">₹{formatCurrency(displayInrBalance)}</div>
          </div>
        </div>

        {/* Zero balance state */}
        {isZeroBalance && (
          <div className="text-center py-2 text-gray-600 text-sm mb-3">
            Start earning HealCoins!
          </div>
        )}

        {/* Last updated timestamp */}
        {displayLastUpdated && (
          <div className="text-xs text-gray-500 mb-3">
            Last updated: {new Date(displayLastUpdated).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 mb-3">
          {displayHealCoins < 50 && (
            <a
              href="/games"
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full bg-white"
            >
              Earn More Coins
            </a>
          )}
          {displayHealCoins >= 150 && (
            <a
              href="/rewards"
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full bg-white"
            >
              Redeem Rewards
            </a>
          )}
          {displayHealCoins >= 50 && displayHealCoins < 150 && (
            <>
              <a
                href="/games"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full bg-white"
              >
                Earn More Coins
              </a>
              <a
                href="/rewards"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full bg-white"
              >
                Redeem Rewards
              </a>
            </>
          )}
        </div>

        {!compact && (
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white"
            onClick={toggleTransactions}
            aria-expanded={internalShowTransactions}
          >
            {internalShowTransactions ? 'Hide' : 'Show'} Recent Transactions
          </Button>
        )}
      </div>

      {!compact && (internalShowTransactions || showTransactions) && (
        <div className="p-4 bg-white border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Transactions</h4>
          {displayTransactions.length > 0 ? (
            <div className="space-y-3">
              {displayTransactions.slice(0, 3).map((transaction) => (
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
                    {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500 text-sm">
              No transactions yet
              <div className="mt-2 text-xs">
                Start playing games to earn HealCoins!
              </div>
            </div>
          )}
          {displayTransactions.length > 3 && onViewHistory && (
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

      {/* Recent credit indicator */}
      {displayWallet?.lastTransaction && displayWallet.lastTransaction.type === 'credit' && (
        <div className="p-2 bg-green-50 border-t border-green-100" data-testid="recent-credit-indicator">
          <div className="text-xs text-green-600 text-center" role="status">
            +{displayWallet.lastTransaction.amount} HealCoins earned!
          </div>
        </div>
      )}

      {/* Balance update status for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        Balance updated to {displayHealCoins} HealCoins
      </div>

      {/* Negative balance warning */}
      {displayHealCoins < 0 && (
        <div className="p-2 bg-red-50 border-t border-red-100" data-testid="wallet-balance-negative">
          <div className="text-xs text-red-600 text-center">
            Contact support
          </div>
        </div>
      )}

      {/* Missing wallet data */}
      {!displayHealCoins && !displayInrBalance && !isLoading && !error && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-100">
          <div className="text-center">
            <div className="text-yellow-800 font-medium mb-2">Wallet not found</div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={() => window.location.href = '/wallet/setup'}
            >
              Create Wallet
            </Button>
          </div>
        </div>
      )}
    </ZPCard>
  );
}