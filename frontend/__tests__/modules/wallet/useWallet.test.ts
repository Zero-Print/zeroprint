import { renderHook, act } from '@testing-library/react';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/apiClient';

// Mock the API client
jest.mock('@/lib/apiClient');
const mockApi = api as jest.Mocked<typeof api>;

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null wallet and loading state', () => {
    const { result } = renderHook(() => useWallet());

    expect(result.current.wallet).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load wallet data successfully', async () => {
    const mockWalletData = {
      wallet: {
        walletId: 'wallet123',
        inrBalance: 100,
        lastUpdated: new Date().toISOString(),
      },
    };

    mockApi.request.mockResolvedValue(mockWalletData);

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.loadWallet();
    });

    expect(result.current.wallet).toEqual({
      userId: 'wallet123',
      balance: 100,
      transactions: [],
      createdAt: mockWalletData.wallet.lastUpdated,
      updatedAt: mockWalletData.wallet.lastUpdated,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle wallet loading errors', async () => {
    const errorMessage = 'Failed to load wallet';
    mockApi.request.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.loadWallet();
    });

    expect(result.current.wallet).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('should earn coins successfully', async () => {
    const mockWalletData = {
      wallet: {
        walletId: 'wallet123',
        inrBalance: 150,
        lastUpdated: new Date().toISOString(),
      },
    };

    mockApi.request
      .mockResolvedValueOnce({ success: true }) // For earn API call
      .mockResolvedValueOnce(mockWalletData); // For reload wallet

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.earnCoins({ gameId: 'game123', coins: 50 });
    });

    expect(mockApi.request).toHaveBeenCalledWith('/wallet/earn', {
      method: 'POST',
      body: JSON.stringify({ gameId: 'game123', coins: 50 }),
    });
  });

  it('should redeem coins successfully', async () => {
    const mockWalletData = {
      wallet: {
        walletId: 'wallet123',
        inrBalance: 50,
        lastUpdated: new Date().toISOString(),
      },
    };

    mockApi.request
      .mockResolvedValueOnce({ success: true }) // For redeem API call
      .mockResolvedValueOnce(mockWalletData); // For reload wallet

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.redeemCoins({ amount: 25, rewardId: 'reward123' });
    });

    expect(mockApi.request).toHaveBeenCalledWith('/wallet/redeem', {
      method: 'POST',
      body: JSON.stringify({ amount: 25, rewardId: 'reward123' }),
    });
  });

  it('should load transactions with pagination', async () => {
    const mockTransactions = {
      transactions: [
        { id: '1', amount: 50, type: 'earn', createdAt: new Date().toISOString() },
        { id: '2', amount: 25, type: 'redeem', createdAt: new Date().toISOString() },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        hasNext: false,
        hasPrev: false,
      },
    };

    mockApi.request.mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.loadTransactions(1, 20);
    });

    expect(result.current.transactions).toEqual(mockTransactions.transactions);
    expect(result.current.pagination).toEqual(mockTransactions.pagination);
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useWallet());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
