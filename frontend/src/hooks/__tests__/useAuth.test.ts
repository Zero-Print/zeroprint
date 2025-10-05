/**
 * useAuth Hook Tests
 * Tests authentication hook with MSW mocks
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useAuth } from '../useAuth';
import { AuthProvider } from '@/modules/auth/AuthProvider';

// Mock Firebase Auth
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
}));

// Mock API client
jest.mock('@/lib/apiClient', () => ({
  auth: {
    signup: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

// MSW server setup
const server = setupServer(
  rest.post('/api/auth/signup', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          userId: 'test-user-id',
          token: 'mock-token',
        },
      })
    );
  }),
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          userId: 'test-user-id',
          token: 'mock-token',
        },
      })
    );
  }),
  rest.get('/api/auth/profile', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'citizen',
          profile: {
            preferences: {
              theme: 'light',
              language: 'en',
              units: 'metric',
            },
          },
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }),
  rest.put('/api/auth/profile', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Updated User',
          role: 'citizen',
          profile: {
            preferences: {
              theme: 'dark',
              language: 'en',
              units: 'metric',
            },
          },
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useAuth', () => {
  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should sign up successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      userData: {
        name: 'Test User',
        role: 'citizen' as const,
      },
    };

    await act(async () => {
      const response = await result.current.signup(signupData);
      expect(response.success).toBe(true);
    });
  });

  it('should handle signup error', async () => {
    server.use(
      rest.post('/api/auth/signup', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            error: 'Email already exists',
          })
        );
      })
    );

    const { result } = renderHook(() => useAuth());
    
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      userData: {
        name: 'Test User',
        role: 'citizen' as const,
      },
    };

    await act(async () => {
      const response = await result.current.signup(signupData);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Email already exists');
    });
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    await act(async () => {
      const response = await result.current.login(loginData);
      expect(response.success).toBe(true);
    });
  });

  it('should handle login error', async () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            success: false,
            error: 'Invalid credentials',
          })
        );
      })
    );

    const { result } = renderHook(() => useAuth());
    
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    await act(async () => {
      const response = await result.current.login(loginData);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
    });
  });

  it('should update profile successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    const profileData = {
      name: 'Updated User',
      profile: {
        preferences: {
          theme: 'dark' as const,
          language: 'en' as const,
          units: 'metric' as const,
        },
      },
    };

    await act(async () => {
      const response = await result.current.updateProfile(profileData);
      expect(response.success).toBe(true);
    });
  });

  it('should check user role correctly', () => {
    const { result } = renderHook(() => useAuth());
    
    // Mock user with role
    act(() => {
      result.current.user = {
        role: 'admin',
      } as any;
    });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('citizen')).toBe(false);
    expect(result.current.isAdmin()).toBe(true);
  });

  it('should check authentication status', () => {
    const { result } = renderHook(() => useAuth());
    
    // Mock authenticated user
    act(() => {
      result.current.user = {
        id: 'test-user-id',
      } as any;
    });

    expect(result.current.isAuthenticated()).toBe(true);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.error = 'Test error';
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
