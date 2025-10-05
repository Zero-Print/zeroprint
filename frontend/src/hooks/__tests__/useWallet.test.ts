/**
 * useWallet Hook Tests
 * Tests wallet hook with mocked services
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '../useWallet';

// Mock the wallet service
jest.mock('@/services/walletService', () => ({
  walletService: {
    getWallet: jest.fn(),
    createWallet: jest.fn(),
    creditHealCoins: jest.fn(),
    debitHealCoins: jest.fn(),
    getTransactions: jest.fn(),
    getWalletLimits: jest.fn(),
    updateWallet: jest.fn(),
  },
}));

// Mock the auth service
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: {
    now: jest.fn(),
    fromDate: jest.fn(),
  },
}));

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWallet());

    expect(result.current.wallet).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should provide wallet operations', () => {
    const { result } = renderHook(() => useWallet());

    expect(typeof result.current.earnCoins).toBe('function');
    expect(typeof result.current.redeemCoins).toBe('function');
    expect(typeof result.current.loadTransactions).toBe('function');
    expect(typeof result.current.refreshWallet).toBe('function');
  });

  it('should handle wallet operations', async () => {
    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.earnCoins({ gameId: 'test-game', coins: 100 });
    });

    await act(async () => {
      await result.current.redeemCoins({ amount: 50 });
    });

    await act(async () => {
      await result.current.loadTransactions();
    });

    await act(async () => {
      await result.current.refreshWallet();
    });

    // These should not throw errors
    expect(result.current.earnCoins).toBeDefined();
    expect(result.current.redeemCoins).toBeDefined();
    expect(result.current.loadTransactions).toBeDefined();
    expect(result.current.refreshWallet).toBeDefined();
  });
});