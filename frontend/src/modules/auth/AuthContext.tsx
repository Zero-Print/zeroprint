'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshToken: () => Promise<string | null>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authHook = useAuth();

  const signIn = async (email: string, password: string) => {
    return await authHook.login({ email, password });
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    return await authHook.signup({
      email,
      password,
      userData: {
        name: displayName,
        role,
        profile: {
          preferences: {
            theme: 'light',
            language: 'en',
            units: 'metric',
          },
        },
      },
    });
  };

  const logout = async () => {
    return await authHook.logout();
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    return await authHook.updateProfile(updates);
  };

  const refreshToken = async () => {
    return await authHook.getIdToken(true);
  };

  const value = {
    user: authHook.user,
    loading: authHook.loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    refreshToken,
    hasRole: authHook.hasRole,
    isAdmin: authHook.isAdmin,
    isAuthenticated: authHook.isAuthenticated,
    clearError: authHook.clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Export useAuth as an alias for useAuthContext for backward compatibility
export { useAuthContext as useAuth };
