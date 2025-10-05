/**
 * Typed dashboard fetchers with pagination and indexes
 * All dashboard data fetching goes through these functions
 */

import api from './api';
import type {
  CitizenDashboard,
  EntityDashboard,
  GovernmentDashboard,
  AdminDashboard,
  PaginatedResult,
  Leaderboard,
  ActivityLog,
  MSMEReport,
  WardData,
  TimeRange,
} from '@/types';

// Citizen Dashboard Fetchers
export const fetchCitizenDashboard = async (): Promise<CitizenDashboard | null> => {
  try {
    const response = await api.dashboards.getCitizen();
    if (response.success && response.data) {
      return response.data as CitizenDashboard;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch citizen dashboard:', error);
    return null;
  }
};

// Entity Dashboard Fetchers
export const fetchEntityDashboard = async (
  entityType: 'school' | 'msme',
  entityId: string
): Promise<EntityDashboard | null> => {
  try {
    const response = await api.dashboards.getEntity(entityType, entityId);
    if (response.success && response.data) {
      return response.data as EntityDashboard;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch entity dashboard:', error);
    return null;
  }
};

// Government Dashboard Fetchers
export const fetchGovernmentDashboard = async (): Promise<GovernmentDashboard | null> => {
  try {
    const response = await api.dashboards.getGovernment();
    if (response.success && response.data) {
      return response.data as GovernmentDashboard;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch government dashboard:', error);
    return null;
  }
};

export const fetchGovernmentWardData = async (wardId: string): Promise<WardData | null> => {
  try {
    const response = await api.dashboards.getGovernmentWard(wardId);
    if (response.success && response.data) {
      return response.data as WardData;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch government ward data:', error);
    return null;
  }
};

// Admin Dashboard Fetchers
export const fetchAdminDashboard = async (): Promise<AdminDashboard | null> => {
  try {
    const response = await api.dashboards.getAdmin();
    if (response.success && response.data) {
      return response.data as AdminDashboard;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch admin dashboard:', error);
    return null;
  }
};

// Leaderboard Fetchers
export const fetchLeaderboard = async (
  type: 'citizen' | 'school' | 'msme' | 'government',
  page = 1,
  limit = 20
): Promise<PaginatedResult<Leaderboard> | null> => {
  try {
    const response = await api.get(`/leaderboards?type=${type}&page=${page}&limit=${limit}`);
    if (response.success && response.data) {
      return {
        data: response.data as Leaderboard[],
        pagination: response.pagination || {
          page,
          limit,
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return null;
  }
};

// Activity Log Fetchers
export const fetchActivityLogs = async (
  page = 1,
  limit = 20,
  filters?: {
    userId?: string;
    action?: string;
    module?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<PaginatedResult<ActivityLog> | null> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.action && { action: filters.action }),
      ...(filters?.module && { module: filters.module }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    });

    const response = await api.get(`/activity-logs?${queryParams}`);
    if (response.success && response.data) {
      return {
        data: response.data as ActivityLog[],
        pagination: response.pagination || {
          page,
          limit,
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return null;
  }
};

// MSME Report Fetchers
export const fetchMSMEReports = async (
  orgId?: string,
  page = 1,
  limit = 20
): Promise<PaginatedResult<MSMEReport> | null> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(orgId && { orgId }),
    });

    const response = await api.get(`/msme-reports?${queryParams}`);
    if (response.success && response.data) {
      return {
        data: response.data as MSMEReport[],
        pagination: response.pagination || {
          page,
          limit,
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch MSME reports:', error);
    return null;
  }
};

// Analytics Fetchers
export const fetchAnalytics = async (
  timeRange: TimeRange = '7d',
  module?: string
): Promise<any | null> => {
  try {
    const queryParams = new URLSearchParams({
      timeRange,
      ...(module && { module }),
    });

    const response = await api.get(`/analytics?${queryParams}`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return null;
  }
};

// Export Fetchers
export const exportAnalytics = async (
  timeRange: TimeRange = '7d',
  format: 'csv' | 'pdf' = 'csv',
  module?: string
): Promise<Blob | null> => {
  try {
    const queryParams = new URLSearchParams({
      timeRange,
      format,
      ...(module && { module }),
    });

    const response = await fetch(`${api['baseUrl']}/analytics/export?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${await api['getAuthToken']()}`,
      },
    });

    if (response.ok) {
      return await response.blob();
    }
    return null;
  } catch (error) {
    console.error('Failed to export analytics:', error);
    return null;
  }
};

// Real-time Data Fetchers (for live updates)
export const subscribeToDashboardUpdates = (
  dashboardType: 'citizen' | 'entity' | 'government' | 'admin',
  callback: (data: any) => void
): (() => void) => {
  // This would typically use WebSocket or Server-Sent Events
  // For now, we'll use polling as a fallback
  const interval = setInterval(async () => {
    try {
      let data = null;
      switch (dashboardType) {
        case 'citizen':
          data = await fetchCitizenDashboard();
          break;
        case 'entity':
          // Would need entityId parameter
          break;
        case 'government':
          data = await fetchGovernmentDashboard();
          break;
        case 'admin':
          data = await fetchAdminDashboard();
          break;
      }
      if (data) {
        callback(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard updates:', error);
    }
  }, 30000); // Poll every 30 seconds

  return () => clearInterval(interval);
};

// Cache Management
const dashboardCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const getCachedDashboard = (key: string, ttl = 300000): any | null => {
  const cached = dashboardCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
};

export const setCachedDashboard = (key: string, data: any, ttl = 300000): void => {
  dashboardCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

export const clearDashboardCache = (key?: string): void => {
  if (key) {
    dashboardCache.delete(key);
  } else {
    dashboardCache.clear();
  }
};
