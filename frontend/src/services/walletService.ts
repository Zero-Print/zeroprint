/**
 * Mock Wallet Service
 * 
 * Mock implementation for testing purposes
 */

export interface Wallet {
  id: string;
  userId: string;
  inrBalance: number;
  healCoins: number;
  totalEarned: number;
  totalRedeemed: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'earn' | 'redeem' | 'transfer' | 'refund';
  amount: number;
  source?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletOperationResult {
  success: boolean;
  data?: Wallet;
  error?: string;
  newBalance?: number;
}

export interface TransactionResult {
  success: boolean;
  data?: Transaction;
  error?: string;
}

export class WalletService {
  private static instance: WalletService;

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public async getWalletBalance(userId: string): Promise<WalletOperationResult> {
    return jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: `wallet_${userId}`,
        userId,
        inrBalance: 0,
        healCoins: 100,
        totalEarned: 200,
        totalRedeemed: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })();
  }

  public async createWallet(userId: string): Promise<Wallet> {
    return jest.fn().mockResolvedValue({
      id: `wallet_${userId}`,
      userId,
      inrBalance: 0,
      healCoins: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })();
  }

  public async earnCoins(
    userId: string,
    amount: number,
    source: string,
    description: string
  ): Promise<WalletOperationResult> {
    return jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: `wallet_${userId}`,
        userId,
        inrBalance: 0,
        healCoins: 100 + amount,
        totalEarned: 200 + amount,
        totalRedeemed: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      newBalance: 100 + amount
    })();
  }

  public async redeemCoins(
    userId: string,
    amount: number,
    source: string,
    description: string
  ): Promise<WalletOperationResult> {
    return jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: `wallet_${userId}`,
        userId,
        inrBalance: 0,
        healCoins: 100 - amount,
        totalEarned: 200,
        totalRedeemed: 100 + amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      newBalance: 100 - amount
    })();
  }

  public async getTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ transactions: Transaction[]; total: number }> {
    return jest.fn().mockResolvedValue({
      transactions: [],
      total: 0
    })();
  }

  public async transferCoins(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string
  ): Promise<WalletOperationResult> {
    return jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: `wallet_${fromUserId}`,
        userId: fromUserId,
        inrBalance: 0,
        healCoins: 100 - amount,
        totalEarned: 200,
        totalRedeemed: 100 + amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      newBalance: 100 - amount
    })();
  }

  public async getWalletStats(userId: string): Promise<{
    totalEarned: number;
    totalRedeemed: number;
    currentBalance: number;
    transactionCount: number;
  }> {
    return jest.fn().mockResolvedValue({
      totalEarned: 200,
      totalRedeemed: 100,
      currentBalance: 100,
      transactionCount: 5
    })();
  }

  public clearAll(): void {
    jest.fn().mockImplementation(() => {});
  }

  // Legacy method names for backward compatibility
  public async creditHealCoins(
    userId: string,
    amount: number,
    description: string,
    source?: string
  ): Promise<TransactionResult> {
    return jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: `txn_${Date.now()}`,
        walletId: `wallet_${userId}`,
        type: 'earn',
        amount,
        source: source || 'manual',
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })();
  }

  public async debitHealCoins(
    userId: string,
    amount: number,
    description: string,
    purpose?: string
  ): Promise<TransactionResult> {
    return jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: `txn_${Date.now()}`,
        walletId: `wallet_${userId}`,
        type: 'redeem',
        amount,
        source: purpose || 'manual',
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })();
  }

  public async getWalletLimits(userId: string): Promise<any> {
    return jest.fn().mockResolvedValue({
      earn: {
        daily: 100,
        monthly: 1000
      },
      redeem: {
        daily: 50,
        monthly: 500
      }
    })();
  }

  public async updateWallet(userId: string, updates: Partial<Wallet>): Promise<WalletOperationResult> {
    return jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: `wallet_${userId}`,
        userId,
        inrBalance: 0,
        healCoins: 100,
        totalEarned: 200,
        totalRedeemed: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates
      }
    })();
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance();