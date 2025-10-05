/**
 * useWallet Hook
 * Manages wallet state and provides wallet operations
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/apiClient';
import { ApiError } from '@/lib/apiClient';
import { Wallet, WalletTransaction } from '@/types';

export interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

export interface EarnCoinsData {
  gameId: string;
  coins: number;
}

export interface RedeemCoinsData {
  amount?: number;
  rewardId?: string;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    wallet: null,
    transactions: [],
    loading: false,
    error: null,
    pagination: null,
  });

  // Load wallet balance
  const loadWallet = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.wallet.getBalance();
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load wallet');
      }

      setState(prev => ({
        ...prev,
        wallet: response.data || null,
        loading: false,
        error: null,
      }));

      return { success: true, wallet: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load wallet';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async (page: number = 1, limit: number = 20) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.wallet.getTransactions(page, limit);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load transactions');
      }

      setState(prev => ({
        ...prev,
        transactions: response.data || [],
        pagination: response.pagination || null,
        loading: false,
        error: null,
      }));

      return { success: true, transactions: response.data, pagination: response.pagination };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load transactions';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Earn coins
  const earnCoins = useCallback(async (data: EarnCoinsData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.wallet.earnCoins(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to earn coins');
      }

      // Update wallet state
      setState(prev => ({
        ...prev,
        wallet: response.data || prev.wallet,
        loading: false,
        error: null,
      }));

      // Reload transactions to show new transaction
      await loadTransactions(1, 20);

      return { success: true, wallet: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to earn coins';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [loadTransactions]);

  // Redeem coins
  const redeemCoins = useCallback(async (data: RedeemCoinsData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.wallet.redeemCoins(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to redeem coins');
      }

      // Update wallet state
      setState(prev => ({
        ...prev,
        wallet: response.data || prev.wallet,
        loading: false,
        error: null,
      }));

      // Reload transactions to show new transaction
      await loadTransactions(1, 20);

      return { success: true, wallet: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to redeem coins';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [loadTransactions]);

  // Refresh wallet data
  const refresh = useCallback(async () => {
    await Promise.all([
      loadWallet(),
      loadTransactions(1, 20),
    ]);
  }, [loadWallet, loadTransactions]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load wallet on mount
  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, [loadWallet, loadTransactions]);

  return {
    // State
    wallet: state.wallet,
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    
    // Actions
    loadWallet,
    loadTransactions,
    earnCoins,
    redeemCoins,
    refresh,
    refreshWallet: refresh,
    clearError,
    
    // Computed values
    balance: state.wallet?.healCoins || 0,
    inrBalance: state.wallet?.inrBalance || 0,
    totalEarned: state.wallet?.totalEarned || 0,
    totalRedeemed: state.wallet?.totalRedeemed || 0,
  };
}
