/**
 * useAuth Hook
 * Manages authentication state and provides auth operations
 */

import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/apiClient';
import { ApiError } from '@/lib/apiClient';

export interface AuthUser extends User {
  role?: string;
  profile?: any;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface SignupData {
  email: string;
  password: string;
  userData: {
    name: string;
    role?: 'citizen' | 'school' | 'msme' | 'government' | 'admin';
    profile?: any;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      if (user) {
        try {
          // Get additional user data from API only once
          const profileResponse = await api.auth.getProfile();
          if (isMounted && profileResponse.success && profileResponse.data) {
            setState({
              user: {
                ...user,
                role: profileResponse.data.role,
                profile: profileResponse.data.profile,
              } as AuthUser,
              loading: false,
              error: null,
            });
          } else if (isMounted) {
            setState({
              user: user as AuthUser,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (isMounted) {
            setState({
              user: user as AuthUser,
              loading: false,
              error: 'Failed to load user profile',
            });
          }
        }
      } else {
        if (isMounted) {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sign up
  const signup = useCallback(async (data: SignupData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Call backend API to create user profile
      const response = await api.auth.signup({
        email: data.email,
        password: data.password,
        userData: data.userData,
      });

      if (!response.success) {
        throw new ApiError(response.error || 'Signup failed');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Signup failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign in
  const login = useCallback(async (data: LoginData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Call backend API to validate login
      const response = await api.auth.login({
        email: data.email,
        password: data.password,
      });

      if (!response.success) {
        throw new ApiError(response.error || 'Login failed');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Login failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.auth.updateProfile(profileData);
      if (!response.success) {
        throw new ApiError(response.error || 'Profile update failed');
      }

      // Update local state
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...response.data } : null,
        loading: false,
        error: null,
      }));

      return { success: true, user: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Profile update failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get ID token
  const getIdToken = useCallback(async (forceRefresh: boolean = false) => {
    if (!state.user) return null;
    
    try {
      return await state.user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }, [state.user]);

  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    return state.user?.role === role;
  }, [state.user?.role]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!state.user;
  }, [state.user]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    user: state.user,
    loading: state.loading,
    error: state.error,
    
    // Actions
    signup,
    login,
    logout,
    updateProfile,
    getIdToken,
    
    // Utilities
    hasRole,
    isAdmin,
    isAuthenticated,
    clearError,
  };
}
