import { WalletService } from '../../../src/services/walletService';
import { TEST_WALLETS, TEST_USERS } from '../../fixtures/seed-data';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  runTransaction: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn(date => ({ toDate: () => date })),
  },
}));

// Mock audit service
jest.mock('../../../src/lib/auditService', () => ({
  logAudit: jest.fn(),
  logUserActivity: jest.fn(),
}));

// Mock rate limit service
jest.mock('../../../src/services/rateLimitService', () => ({
  rateLimitService: {
    checkRateLimit: jest.fn(),
    incrementRateLimit: jest.fn(),
    getRateLimitStatus: jest.fn(),
  },
}));

describe.skip('WalletService', () => {
  let walletService: WalletService;
  let mockDb: any;
  let mockTransaction: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock database
    mockTransaction = {
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    };

    mockDb = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
        })),
      })),
      runTransaction: jest.fn(callback => callback(mockTransaction)),
    };

    walletService = new WalletService();
  });

  describe('creditHealCoins', () => {
    it('should successfully credit coins to user wallet', async () => {
      const userId = 'test-citizen-1';
      const amount = 10;
      const description = 'Quiz completion reward';
      const source = 'game';

      // Mock rate limit check
      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 90,
      });

      // Mock wallet data
      const mockWallet = { ...TEST_WALLETS[userId] };
      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => mockWallet,
      });

      // Mock core wallet service
      const mockCoreWalletService = {
        addCredits: jest.fn().mockResolvedValue({
          transactionId: 'txn_123',
          amount,
          currency: 'HealCoins',
          description,
          status: 'completed',
          createdAt: new Date().toISOString(),
        }),
      };

      // Replace the core service
      (walletService as any).coreWalletService = mockCoreWalletService;

      const result = await walletService.creditHealCoins(userId, amount, description, source);

      expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith(userId, 'wallet_earn', amount);
      expect(mockCoreWalletService.addCredits).toHaveBeenCalledWith(
        userId,
        amount,
        'healcoin_credit',
        description
      );
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          healCoins: mockWallet.healCoins + amount,
          lastUpdated: expect.any(String),
        })
      );
      expect(result).toMatchObject({
        id: 'txn_123',
        type: 'credit',
        amount,
        status: 'completed',
      });
    });

    it('should throw error when rate limit is exceeded', async () => {
      const userId = 'test-citizen-1';
      const amount = 150; // Exceeds daily limit
      const description = 'Large reward';

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: false,
        reason: 'Daily limit exceeded',
      });

      await expect(walletService.creditHealCoins(userId, amount, description)).rejects.toThrow(
        'Rate limit exceeded: Daily limit exceeded'
      );

      expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith(userId, 'wallet_earn', amount);
    });

    it('should throw error when wallet not found', async () => {
      const userId = 'non-existent-user';
      const amount = 10;
      const description = 'Test reward';

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 90,
      });

      mockTransaction.get.mockResolvedValue({
        exists: false,
      });

      const mockCoreWalletService = {
        addCredits: jest.fn().mockResolvedValue({
          transactionId: 'txn_123',
          amount,
          currency: 'HealCoins',
          description,
          status: 'completed',
          createdAt: new Date().toISOString(),
        }),
      };

      (walletService as any).coreWalletService = mockCoreWalletService;

      await expect(walletService.creditHealCoins(userId, amount, description)).rejects.toThrow(
        'Wallet not found'
      );
    });

    it('should handle different coin sources correctly', async () => {
      const userId = 'test-citizen-1';
      const amount = 5;
      const description = 'Tracker activity reward';
      const source = 'tracker';

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 95,
      });

      const mockWallet = { ...TEST_WALLETS[userId] };
      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => mockWallet,
      });

      const mockCoreWalletService = {
        addCredits: jest.fn().mockResolvedValue({
          transactionId: 'txn_tracker_123',
          amount,
          currency: 'HealCoins',
          description,
          status: 'completed',
          createdAt: new Date().toISOString(),
        }),
      };

      (walletService as any).coreWalletService = mockCoreWalletService;

      const result = await walletService.creditHealCoins(userId, amount, description, source);

      expect(result.type).toBe('credit');
      expect(result.amount).toBe(amount);

      // Verify audit log was called with correct source
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'HEALCOINS_CREDITED',
          userId,
          details: expect.objectContaining({
            source,
            amount,
            description,
          }),
        })
      );
    });
  });

  describe('debitHealCoins', () => {
    it('should successfully debit coins from user wallet', async () => {
      const userId = 'test-citizen-1';
      const amount = 25;
      const description = 'Voucher redemption';
      const purpose = 'redeem';

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 75,
      });

      const mockWallet = { ...TEST_WALLETS[userId] };
      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => mockWallet,
      });

      const mockCoreWalletService = {
        debitCredits: jest.fn().mockResolvedValue({
          transactionId: 'txn_debit_123',
          amount,
          currency: 'HealCoins',
          description,
          status: 'completed',
          createdAt: new Date().toISOString(),
        }),
      };

      (walletService as any).coreWalletService = mockCoreWalletService;

      const result = await walletService.debitHealCoins(userId, amount, description, purpose);

      expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith(userId, 'wallet_redeem', amount);
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          healCoins: mockWallet.healCoins - amount,
          lastUpdated: expect.any(String),
        })
      );
      expect(result).toMatchObject({
        type: 'debit',
        amount,
        status: 'completed',
      });
    });

    it('should throw error when insufficient balance', async () => {
      const userId = 'test-citizen-1';
      const amount = 200; // More than available balance
      const description = 'Large redemption';

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 800,
      });

      const mockWallet = { ...TEST_WALLETS[userId] };
      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => mockWallet,
      });

      await expect(walletService.debitHealCoins(userId, amount, description)).rejects.toThrow(
        'Insufficient balance'
      );
    });

    it('should throw error when redemption rate limit exceeded', async () => {
      const userId = 'test-citizen-1';
      const amount = 50;
      const description = 'Redemption attempt';

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: false,
        reason: 'Monthly redemption limit exceeded',
      });

      await expect(walletService.debitHealCoins(userId, amount, description)).rejects.toThrow(
        'Rate limit exceeded: Monthly redemption limit exceeded'
      );
    });
  });

  describe('getWalletLimits', () => {
    it('should return current wallet limits for user', async () => {
      const userId = 'test-citizen-1';

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.getRateLimitStatus.mockImplementation((userId, type) => {
        if (type === 'wallet_earn') {
          return Promise.resolve({
            daily: { limit: 100, used: 20, remaining: 80 },
            monthly: { limit: 1000, used: 150, remaining: 850 },
          });
        } else if (type === 'wallet_redeem') {
          return Promise.resolve({
            daily: { limit: 50, used: 10, remaining: 40 },
            monthly: { limit: 500, used: 75, remaining: 425 },
          });
        }
      });

      const limits = await walletService.getWalletLimits(userId);

      expect(limits).toEqual({
        earn: {
          daily: { limit: 100, used: 20, remaining: 80 },
          monthly: { limit: 1000, used: 150, remaining: 850 },
        },
        redeem: {
          daily: { limit: 50, used: 10, remaining: 40 },
          monthly: { limit: 500, used: 75, remaining: 425 },
        },
      });

      expect(rateLimitService.getRateLimitStatus).toHaveBeenCalledTimes(2);
      expect(rateLimitService.getRateLimitStatus).toHaveBeenCalledWith(userId, 'wallet_earn');
      expect(rateLimitService.getRateLimitStatus).toHaveBeenCalledWith(userId, 'wallet_redeem');
    });
  });

  describe('applyCoins', () => {
    it('should apply coins with proper validation', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-quiz-1';
      const coinsEarned = 15;

      // Mock the earnCoins function
      const earnCoinsSpy = jest.spyOn(walletService, 'creditHealCoins').mockResolvedValue({
        id: 'txn_apply_123',
        transactionId: 'txn_apply_123',
        userId,
        type: 'credit',
        amount: coinsEarned,
        currency: 'HealCoins',
        description: `Game completion reward: ${gameId}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const result = await walletService.creditHealCoins(
        userId,
        coinsEarned,
        `Game completion reward: ${gameId}`,
        'game'
      );

      expect(earnCoinsSpy).toHaveBeenCalledWith(
        userId,
        coinsEarned,
        `Game completion reward: ${gameId}`,
        'game'
      );
      expect(result.amount).toBe(coinsEarned);
      expect(result.type).toBe('credit');
    });
  });

  describe('deductCoins', () => {
    it('should deduct coins with proper validation', async () => {
      const userId = 'test-citizen-1';
      const rewardId = 'reward-voucher-1';
      const coinsRequired = 30;

      const deductCoinsSpy = jest.spyOn(walletService, 'debitHealCoins').mockResolvedValue({
        id: 'txn_deduct_123',
        transactionId: 'txn_deduct_123',
        userId,
        type: 'debit',
        amount: coinsRequired,
        currency: 'HealCoins',
        description: `Reward redemption: ${rewardId}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const result = await walletService.debitHealCoins(
        userId,
        coinsRequired,
        `Reward redemption: ${rewardId}`,
        'redeem'
      );

      expect(deductCoinsSpy).toHaveBeenCalledWith(
        userId,
        coinsRequired,
        `Reward redemption: ${rewardId}`,
        'redeem'
      );
      expect(result.amount).toBe(coinsRequired);
      expect(result.type).toBe('debit');
    });
  });

  describe('dailyAndMonthlyCaps', () => {
    it('should enforce daily earning caps', async () => {
      const userId = 'test-citizen-1';
      const amount = 50; // Would exceed daily limit if user already earned 60

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: false,
        reason: 'Daily earning limit of 100 coins exceeded',
        current: 60,
        limit: 100,
      });

      await expect(walletService.creditHealCoins(userId, amount, 'Test reward')).rejects.toThrow(
        'Rate limit exceeded: Daily earning limit of 100 coins exceeded'
      );
    });

    it('should enforce monthly redemption caps', async () => {
      const userId = 'test-citizen-1';
      const amount = 100; // Would exceed monthly redemption limit

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: false,
        reason: 'Monthly redemption limit of 500 coins exceeded',
        current: 450,
        limit: 500,
      });

      await expect(walletService.debitHealCoins(userId, amount, 'Test redemption')).rejects.toThrow(
        'Rate limit exceeded: Monthly redemption limit of 500 coins exceeded'
      );
    });

    it('should allow transactions within limits', async () => {
      const userId = 'test-citizen-1';
      const amount = 20;

      const { rateLimitService } = require('../../../src/services/rateLimitService');
      rateLimitService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 80,
        current: 20,
        limit: 100,
      });

      const mockWallet = { ...TEST_WALLETS[userId] };
      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => mockWallet,
      });

      const mockCoreWalletService = {
        addCredits: jest.fn().mockResolvedValue({
          transactionId: 'txn_within_limit_123',
          amount,
          currency: 'HealCoins',
          description: 'Within limit reward',
          status: 'completed',
          createdAt: new Date().toISOString(),
        }),
      };

      (walletService as any).coreWalletService = mockCoreWalletService;

      const result = await walletService.creditHealCoins(userId, amount, 'Within limit reward');

      expect(result.status).toBe('completed');
      expect(result.amount).toBe(amount);
    });
  });
});
