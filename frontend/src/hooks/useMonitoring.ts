/**
 * useMonitoring Hook
 * Manages monitoring state and provides monitoring operations
 */

import { useState, useCallback } from 'react';
import api from '@/lib/apiClient';
import { ApiError } from '@/lib/apiClient';
import { 
  ActivityLog, 
  ErrorLog, 
  PerformanceMetric, 
  AdminDashboard,
  TimeRange,
  ExportFormat 
} from '@/types';

export interface MonitoringState {
  loading: boolean;
  error: string | null;
}

export interface LogActivityData {
  action: string;
  details?: any;
}

export interface LogErrorData {
  module: string;
  errorType: string;
  message: string;
  stackTrace?: string;
}

export interface RecordMetricData {
  metricType: string;
  value: number;
  context?: any;
}

export function useMonitoring() {
  const [state, setState] = useState<MonitoringState>({
    loading: false,
    error: null,
  });

  // Log user activity
  const logActivity = useCallback(async (data: LogActivityData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.monitoring.logActivity(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to log activity');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, log: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to log activity';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Log system error
  const logError = useCallback(async (data: LogErrorData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.monitoring.logError(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to log error');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, log: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to log error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Record performance metric
  const recordMetric = useCallback(async (data: RecordMetricData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.monitoring.recordMetric(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to record metric');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, metric: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to record metric';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get analytics
  const getAnalytics = useCallback(async (timeRange: TimeRange = '7d', module?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.monitoring.getAnalytics(timeRange, module);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to get analytics');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, analytics: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to get analytics';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Export analytics
  const exportAnalytics = useCallback(async (timeRange: TimeRange = '7d', format: ExportFormat = 'csv') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.monitoring.exportAnalytics(timeRange, format);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to export analytics');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to export analytics';
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
    loading: state.loading,
    error: state.error,
    
    // Actions
    logActivity,
    logError,
    recordMetric,
    getAnalytics,
    exportAnalytics,
    clearError,
  };
}
