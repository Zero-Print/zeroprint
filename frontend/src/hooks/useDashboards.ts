/**
 * useDashboards Hook
 * Manages dashboard state and provides dashboard operations
 */

import { useState, useCallback } from 'react';
import api from '@/lib/apiClient';
import { ApiError } from '@/lib/apiClient';
import { 
  CitizenDashboard, 
  EntityDashboard, 
  GovernmentDashboard, 
  AdminDashboard 
} from '@/types';

export interface DashboardState {
  citizenDashboard: CitizenDashboard | null;
  entityDashboard: EntityDashboard | null;
  governmentDashboard: GovernmentDashboard | null;
  adminDashboard: AdminDashboard | null;
  loading: boolean;
  error: string | null;
}

export function useDashboards() {
  const [state, setState] = useState<DashboardState>({
    citizenDashboard: null,
    entityDashboard: null,
    governmentDashboard: null,
    adminDashboard: null,
    loading: false,
    error: null,
  });

  // Load citizen dashboard
  const loadCitizenDashboard = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.dashboards.getCitizenDashboard();
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load citizen dashboard');
      }

      setState(prev => ({
        ...prev,
        citizenDashboard: response.data || null,
        loading: false,
        error: null,
      }));

      return { success: true, dashboard: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load citizen dashboard';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Load entity dashboard
  const loadEntityDashboard = useCallback(async (type: 'school' | 'msme', id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.dashboards.getEntityDashboard(type, id);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load entity dashboard');
      }

      setState(prev => ({
        ...prev,
        entityDashboard: response.data || null,
        loading: false,
        error: null,
      }));

      return { success: true, dashboard: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load entity dashboard';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Load government dashboard
  const loadGovernmentDashboard = useCallback(async (wardId?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = wardId 
        ? await api.dashboards.getGovernmentWardDashboard(wardId)
        : await api.dashboards.getGovernmentDashboard();
      
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load government dashboard');
      }

      setState(prev => ({
        ...prev,
        governmentDashboard: response.data || null,
        loading: false,
        error: null,
      }));

      return { success: true, dashboard: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load government dashboard';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Load admin dashboard
  const loadAdminDashboard = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.dashboards.getAdminDashboard();
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load admin dashboard');
      }

      setState(prev => ({
        ...prev,
        adminDashboard: response.data || null,
        loading: false,
        error: null,
      }));

      return { success: true, dashboard: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load admin dashboard';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    citizenDashboard: state.citizenDashboard,
    entityDashboard: state.entityDashboard,
    governmentDashboard: state.governmentDashboard,
    adminDashboard: state.adminDashboard,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadCitizenDashboard,
    loadEntityDashboard,
    loadGovernmentDashboard,
    loadAdminDashboard,
    clearError,
  };
}
