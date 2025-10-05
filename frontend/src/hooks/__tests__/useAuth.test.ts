/**
 * useAuth Hook Tests
 * Tests auth hook with mocked services
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()), // Return unsubscribe function
  sendPasswordResetEmail: jest.fn(),
  confirmPasswordReset: jest.fn(),
  updateProfile: jest.fn(),
  User: jest.fn(),
}));

// Mock Firebase Firestore
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

// Mock API client
jest.mock('../../lib/apiClient', () => ({
  api: {
    auth: {
      getProfile: jest.fn(() => Promise.resolve({ success: true, data: { role: 'citizen', profile: {} } })),
    },
  },
}));

describe.skip('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(typeof result.current.isAuthenticated).toBe('function');
  });

  it('should provide auth operations', () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.signup).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.updateProfile).toBe('function');
    expect(typeof result.current.signInWithGoogle).toBe('function');
  });

  it('should handle auth operations', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await act(async () => {
      await result.current.signup({
        email: 'test@example.com',
        password: 'password',
        userData: { name: 'Test User' }
      });
    });

    await act(async () => {
      await result.current.logout();
    });

    await act(async () => {
      await result.current.updateProfile({ displayName: 'Updated Name' });
    });

    // These should not throw errors
    expect(result.current.login).toBeDefined();
    expect(result.current.signup).toBeDefined();
    expect(result.current.logout).toBeDefined();
    expect(result.current.updateProfile).toBeDefined();
  });
});