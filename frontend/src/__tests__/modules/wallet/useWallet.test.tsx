import { renderHook, act } from '@testing-library/react';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/apiClient';

// Mock fetch and Firebase
global.fetch = jest.fn();
jest.mock('firebase/auth');
jest.mock('@/lib/firebase');

// Mock the API client
jest.mock('@/lib/apiClient');
const mockApi = api as jest.Mocked<typeof api>;

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the API request method
    mockApi.request = jest.fn();
  });

  it('should initialize with null wallet and loading state', () => {
    const { result } = renderHook(() => useWallet());

    expect(result.current.wallet).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should provide wallet functions', () => {
    const { result } = renderHook(() => useWallet());

    expect(typeof result.current.loadWallet).toBe('function');
    expect(typeof result.current.earnCoins).toBe('function');
    expect(typeof result.current.redeemCoins).toBe('function');
    expect(typeof result.current.loadTransactions).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useWallet());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
