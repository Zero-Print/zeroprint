import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '../../../src/hooks/useWallet';
import { TEST_WALLETS } from '../../fixtures/seed-data';

// Mock Firebase
const mockDoc = {
  get: jest.fn(),
  onSnapshot: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
  where: jest.fn(() => ({
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  })),
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
};

jest.mock('firebase/firestore', () => ({
  getFirestore: () => mockDb,
  collection: jest.fn(() => mockCollection),
  doc: jest.fn(() => mockDoc),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn(date => ({ toDate: () => date })),
  },
}));

// Mock auth hook
const mockUseAuth = {
  user: {
    uid: 'test-citizen-1',
    email: 'citizen@test.com',
    role: 'citizen',
  },
  loading: false,
};

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock wallet service
const mockWalletService = {
  creditHealCoins: jest.fn(),
  debitHealCoins: jest.fn(),
  getWalletLimits: jest.fn(),
};

jest.mock('../../../src/services/walletService', () => ({
  WalletService: jest.fn(() => mockWalletService),
}));

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.loading).toBe(true);
      expect(result.current.wallet).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should not load wallet when user is not authenticated', () => {
      mockUseAuth.user = null;

      const { result } = renderHook(() => useWallet());

      expect(result.current.loading).toBe(false);
      expect(result.current.wallet).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Wallet Loading', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };
    });

    it('should load wallet successfully', async () => {
      const testWallet = TEST_WALLETS['test-citizen-1'];

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => testWallet,
        id: 'test-citizen-1',
      });

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.wallet).toEqual({
        ...testWallet,
        id: 'test-citizen-1',
      });
      expect(result.current.error).toBe(null);
    });

    it('should handle wallet not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.wallet).toBe(null);
      expect(result.current.error).toBe('Wallet not found');
    });

    it('should handle loading error', async () => {
      mockDoc.get.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.wallet).toBe(null);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };
    });

    it('should set up real-time listener', async () => {
      const testWallet = TEST_WALLETS['test-citizen-1'];
      let snapshotCallback: any;

      mockDoc.onSnapshot.mockImplementation(callback => {
        snapshotCallback = callback;
        return jest.fn(); // Unsubscribe function
      });

      const { result } = renderHook(() => useWallet());

      // Simulate initial snapshot
      act(() => {
        snapshotCallback({
          exists: true,
          data: () => testWallet,
          id: 'test-citizen-1',
        });
      });

      await waitFor(() => {
        expect(result.current.wallet).toEqual({
          ...testWallet,
          id: 'test-citizen-1',
        });
      });

      // Simulate wallet update
      const updatedWallet = { ...testWallet, healCoins: 120 };
      act(() => {
        snapshotCallback({
          exists: true,
          data: () => updatedWallet,
          id: 'test-citizen-1',
        });
      });

      await waitFor(() => {
        expect(result.current.wallet?.healCoins).toBe(120);
      });
    });

    it('should handle real-time errors', async () => {
      let snapshotCallback: any;
      let errorCallback: any;

      mockDoc.onSnapshot.mockImplementation((callback, errorCb) => {
        snapshotCallback = callback;
        errorCallback = errorCb;
        return jest.fn();
      });

      const { result } = renderHook(() => useWallet());

      // Simulate error
      act(() => {
        errorCallback(new Error('Connection lost'));
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Connection lost');
      });
    });
  });

  describe('Wallet Operations', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };
    });

    it('should credit coins successfully', async () => {
      const testWallet = TEST_WALLETS['test-citizen-1'];
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => testWallet,
        id: 'test-citizen-1',
      });

      const mockTransaction = {
        id: 'txn_123',
        type: 'credit',
        amount: 10,
        status: 'completed',
      };

      mockWalletService.creditHealCoins.mockResolvedValue(mockTransaction);

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let creditResult: any;
      await act(async () => {
        creditResult = await result.current.creditCoins(10, 'Test reward', 'game');
      });

      expect(mockWalletService.creditHealCoins).toHaveBeenCalledWith(
        'test-citizen-1',
        10,
        'Test reward',
        'game'
      );
      expect(creditResult).toEqual(mockTransaction);
    });

    it('should debit coins successfully', async () => {
      const testWallet = TEST_WALLETS['test-citizen-1'];
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => testWallet,
        id: 'test-citizen-1',
      });

      const mockTransaction = {
        id: 'txn_456',
        type: 'debit',
        amount: 25,
        status: 'completed',
      };

      mockWalletService.debitHealCoins.mockResolvedValue(mockTransaction);

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let debitResult: any;
      await act(async () => {
        debitResult = await result.current.debitCoins(25, 'Voucher redemption', 'redeem');
      });

      expect(mockWalletService.debitHealCoins).toHaveBeenCalledWith(
        'test-citizen-1',
        25,
        'Voucher redemption',
        'redeem'
      );
      expect(debitResult).toEqual(mockTransaction);
    });

    it('should handle insufficient balance error', async () => {
      const testWallet = TEST_WALLETS['test-citizen-1'];
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => testWallet,
        id: 'test-citizen-1',
      });

      mockWalletService.debitHealCoins.mockRejectedValue(new Error('Insufficient balance'));

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.debitCoins(200, 'Large redemption');
        } catch (error) {
          expect(error).toEqual(new Error('Insufficient balance'));
        }
      });
    });
  });

  describe('Transaction History', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };
    });

    it('should fetch transaction history', async () => {
      const mockTransactions = [
        {
          id: 'txn_1',
          type: 'credit',
          amount: 10,
          description: 'Quiz reward',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
        {
          id: 'txn_2',
          type: 'debit',
          amount: 25,
          description: 'Voucher redemption',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
      ];

      const mockQuerySnapshot = {
        docs: mockTransactions.map(tx => ({
          id: tx.id,
          data: () => tx,
        })),
      };

      mockCollection.where().orderBy().limit().get.mockResolvedValue(mockQuerySnapshot);

      const { result } = renderHook(() => useWallet());

      let transactions: any;
      await act(async () => {
        transactions = await result.current.getTransactionHistory(10);
      });

      expect(transactions).toEqual(mockTransactions.map(tx => ({ ...tx, id: tx.id })));
    });

    it('should handle empty transaction history', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockCollection.where().orderBy().limit().get.mockResolvedValue(mockQuerySnapshot);

      const { result } = renderHook(() => useWallet());

      let transactions: any;
      await act(async () => {
        transactions = await result.current.getTransactionHistory();
      });

      expect(transactions).toEqual([]);
    });
  });

  describe('Wallet Limits', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };
    });

    it('should fetch wallet limits', async () => {
      const mockLimits = {
        earn: {
          daily: { limit: 100, used: 20, remaining: 80 },
          monthly: { limit: 1000, used: 150, remaining: 850 },
        },
        redeem: {
          daily: { limit: 50, used: 10, remaining: 40 },
          monthly: { limit: 500, used: 75, remaining: 425 },
        },
      };

      mockWalletService.getWalletLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => useWallet());

      let limits: any;
      await act(async () => {
        limits = await result.current.getWalletLimits();
      });

      expect(mockWalletService.getWalletLimits).toHaveBeenCalledWith('test-citizen-1');
      expect(limits).toEqual(mockLimits);
    });
  });

  describe('Wallet Refresh', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };
    });

    it('should refresh wallet data', async () => {
      const testWallet = TEST_WALLETS['test-citizen-1'];
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => testWallet,
        id: 'test-citizen-1',
      });

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear the mock to test refresh
      mockDoc.get.mockClear();

      const updatedWallet = { ...testWallet, healCoins: 150 };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => updatedWallet,
        id: 'test-citizen-1',
      });

      await act(async () => {
        await result.current.refreshWallet();
      });

      expect(mockDoc.get).toHaveBeenCalledTimes(1);
      expect(result.current.wallet?.healCoins).toBe(150);
    });

    it('should handle refresh errors', async () => {
      const testWallet = TEST_WALLETS['test-citizen-1'];
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => testWallet,
        id: 'test-citizen-1',
      });

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock refresh error
      mockDoc.get.mockRejectedValue(new Error('Refresh failed'));

      await act(async () => {
        await result.current.refreshWallet();
      });

      expect(result.current.error).toBe('Refresh failed');
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from real-time updates on unmount', () => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };

      const mockUnsubscribe = jest.fn();
      mockDoc.onSnapshot.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useWallet());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user changing during hook lifecycle', async () => {
      // Start with one user
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen1@test.com',
        role: 'citizen',
      };

      const wallet1 = TEST_WALLETS['test-citizen-1'];
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => wallet1,
        id: 'test-citizen-1',
      });

      const { result, rerender } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.wallet?.id).toBe('test-citizen-1');
      });

      // Change user
      mockUseAuth.user = {
        uid: 'test-citizen-2',
        email: 'citizen2@test.com',
        role: 'citizen',
      };

      const wallet2 = { ...wallet1, id: 'test-citizen-2', healCoins: 200 };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => wallet2,
        id: 'test-citizen-2',
      });

      rerender();

      await waitFor(() => {
        expect(result.current.wallet?.id).toBe('test-citizen-2');
        expect(result.current.wallet?.healCoins).toBe(200);
      });
    });

    it('should handle operations when wallet is not loaded', async () => {
      mockUseAuth.user = {
        uid: 'test-citizen-1',
        email: 'citizen@test.com',
        role: 'citizen',
      };

      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const { result } = renderHook(() => useWallet());

      await waitFor(() => {
        expect(result.current.wallet).toBe(null);
      });

      await act(async () => {
        try {
          await result.current.creditCoins(10, 'Test');
        } catch (error) {
          expect(error).toEqual(new Error('Wallet not loaded'));
        }
      });
    });
  });
});
