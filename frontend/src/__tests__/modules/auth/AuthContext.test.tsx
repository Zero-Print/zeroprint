import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '@/modules/auth/AuthContext';

// Mock Firebase and fetch
global.fetch = jest.fn();
jest.mock('firebase/auth');
jest.mock('@/lib/firebase');

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthContext', () => {
  const mockAuthHook = {
    user: null,
    loading: false,
    error: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    getIdToken: jest.fn(),
    hasRole: jest.fn(),
    isAdmin: false,
    isAuthenticated: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthHook);
  });

  it('should provide auth context to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.signIn).toBeDefined();
    expect(result.current.signUp).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it('should call login with correct parameters', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockAuthHook.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should call signup with correct parameters', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await act(async () => {
      await result.current.signUp('test@example.com', 'password123', 'Test User', 'citizen');
    });

    expect(mockAuthHook.signup).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      userData: {
        name: 'Test User',
        role: 'citizen',
        profile: {
          preferences: {
            theme: 'light',
            language: 'en',
            units: 'metric',
          },
        },
      },
    });
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuthContext());
    }).toThrow('useAuthContext must be used within an AuthProvider');
  });
});
