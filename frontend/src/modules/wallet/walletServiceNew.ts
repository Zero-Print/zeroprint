// Wallet Service - Handles wallet operations for the rewards system

import api from '@/lib/apiClient';
import { Wallet, WalletTransaction } from '@/types';

// Get wallet by user ID
export async function getWalletByUserId(userId: string): Promise<Wallet | null> {
  try {
    const response = await api.wallet.getBalance();
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw new Error('Failed to fetch wallet');
  }
}

// Deduct coins from wallet
export async function deductCoins(userId: string, amount: number, description: string): Promise<{ success: boolean; message: string; newBalance?: number }> {
  try {
    const response = await api.wallet.redeemCoins({ amount });
    if (response.success && response.data) {
      return { 
        success: true, 
        message: 'Coins deducted successfully', 
        newBalance: response.data.healCoins 
      };
    }
    return { success: false, message: response.error || 'Failed to deduct coins' };
  } catch (error) {
    console.error('Error deducting coins:', error);
    return { success: false, message: 'Failed to deduct coins' };
  }
}

// Check daily redemption cap
export async function checkDailyRedemptionCap(userId: string, amount: number): Promise<{ withinLimit: boolean; message: string }> {
  try {
    // This would be handled by the backend API
    // For now, we'll assume it's within limits
    return { withinLimit: true, message: 'Within daily limit' };
  } catch (error) {
    console.error('Error checking redemption cap:', error);
    return { withinLimit: false, message: 'Failed to check redemption cap' };
  }
}

// Add coins to wallet
export async function addCoins(userId: string, amount: number, source: string, description: string): Promise<{ success: boolean; message: string; newBalance?: number }> {
  try {
    const response = await api.wallet.earnCoins({ 
      gameId: source, 
      coins: amount 
    });
    if (response.success && response.data) {
      return { 
        success: true, 
        message: 'Coins added successfully', 
        newBalance: response.data.healCoins 
      };
    }
    return { success: false, message: response.error || 'Failed to add coins' };
  } catch (error) {
    console.error('Error adding coins:', error);
    return { success: false, message: 'Failed to add coins' };
  }
}

// Get wallet transactions
export async function getWalletTransactions(userId: string, limit: number = 10): Promise<WalletTransaction[]> {
  try {
    const response = await api.wallet.getTransactions(1, limit);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return [];
  }
}

// Check if user has sufficient balance
export async function hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
  try {
    const wallet = await getWalletByUserId(userId);
    return wallet ? wallet.healCoins >= amount : false;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
}

// Get wallet balance
export async function getWalletBalance(userId: string): Promise<number> {
  try {
    const wallet = await getWalletByUserId(userId);
    return wallet ? wallet.healCoins : 0;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
}
