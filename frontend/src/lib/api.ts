/**
 * Centralized API client - the ONLY place that calls backend HTTP endpoints
 * All UI components and hooks must use this client instead of direct Firebase calls
 */

import { auth } from './firebase';
import { isFeatureEnabled } from './featureFlags';
import { getApiBaseUrl } from './env';
import { 
  User, 
  Wallet, 
  WalletTransaction, 
  CarbonLog, 
  MentalHealthLog, 
  AnimalWelfareLog, 
  DigitalTwinSimulation, 
  MSMEReport,
  Game,
  GameScore,
  Subscription,
  SubscriptionPlan,
  Reward,
  Redemption,
  ActivityLog,
  AuditLog,
  ErrorLog,
  PerformanceMetric,
  DeploymentLog,
  Leaderboard,
  Achievement,
  NotificationTemplate,
  NotificationLog,
  PartnerConfig,
  WardGeoData,
  FraudAlert,
  CitizenDashboard,
  EntityDashboard,
  GovernmentDashboard,
  AdminDashboard,
  ApiResponse,
  PaginatedApiResponse,
  TimeRange,
  ExportFormat,
  UserRole,
  GameType,
  SubscriptionStatus,
  RedemptionStatus,
  NotificationChannel,
} from '@/types';

// Re-export types for convenience
export type {
  ApiResponse,
  PaginatedApiResponse,
} from '@/types';

// Base configuration - single source of truth
const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  return getApiBaseUrl();
};

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: { baseUrl?: string; timeout?: number } = {}) {
    this.baseUrl = config.baseUrl || getBaseUrl();
    this.timeout = config.timeout || 30000;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('No authenticated user found');
        return null;
      }
      
      const token = await user.getIdToken();
      if (!token) {
        console.warn('Failed to get ID token from user');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Auth endpoints
  auth = {
    signup: (email: string, password: string, userData: any) =>
      this.post('/auth/signup', { email, password, userData }),
    
    login: (email: string, password: string) =>
      this.post('/auth/login', { email, password }),
    
    logout: () => this.post('/auth/logout'),
    
    getProfile: () => this.get('/auth/profile'),
    
    updateProfile: (data: any) => this.put('/auth/profile', data),
  };

  // Wallet endpoints
  wallet = {
    getBalance: () => this.get('/wallet/balance'),
    
    getTransactions: (page = 1, limit = 20) =>
      this.get(`/wallet/transactions?page=${page}&limit=${limit}`),
    
    earnCoins: (gameId: string, coins: number) =>
      this.post('/wallet/earn', { gameId, coins }),
    
    redeemCoins: (amount: number) =>
      this.post('/wallet/redeem', { amount }),
    
    redeemReward: (rewardId: string) =>
      this.post('/wallet/redeem', { rewardId }),
  };

  // Trackers endpoints
  trackers = {
    logCarbon: (actionType: string, value: number, details?: any) =>
      this.post('/trackers/carbon', { actionType, value, details }),
    
    logMood: (mood: string, note?: string) =>
      this.post('/trackers/mood', { mood, note }),
    
    logAnimal: (actions: any[]) =>
      this.post('/trackers/animal', { actions }),
    
    runDigitalTwin: (inputConfig: any) =>
      this.post('/trackers/digital-twin', { inputConfig }),
    
    generateMSMEReport: (orgId: string, monthData: any) =>
      this.post('/trackers/msme/report', { orgId, monthData }),
    
    getCarbonLogs: (page = 1, limit = 20) =>
      this.get(`/trackers/carbon?page=${page}&limit=${limit}`),
    
    getMoodLogs: (page = 1, limit = 20) =>
      this.get(`/trackers/mood?page=${page}&limit=${limit}`),
    
    getAnimalLogs: (page = 1, limit = 20) =>
      this.get(`/trackers/animal?page=${page}&limit=${limit}`),
  };

  // Games endpoints
  games = {
    getGames: () => this.get('/games'),
    
    getGame: (id: string) => this.get(`/games/${id}`),
    
    completeGame: (id: string, score: number) =>
      this.post(`/games/${id}/complete`, { score }),
  };

  // Subscriptions endpoints
  subscriptions = {
    getPlans: () => this.get('/subscriptions/plans'),
    
    checkout: (planId: string) =>
      this.post('/subscriptions/checkout', { planId }),
    
    cancel: (subscriptionId: string) =>
      this.post('/subscriptions/cancel', { subscriptionId }),
    
    getStatus: () => this.get('/subscriptions/status'),
  };

  // Rewards endpoints
  rewards = {
    getRewards: () => this.get('/rewards'),
    
    getReward: (id: string) => this.get(`/rewards/${id}`),
    
    getRedemptions: (page = 1, limit = 20) =>
      this.get(`/rewards/redemptions?page=${page}&limit=${limit}`),
  };

  // Dashboard endpoints
  dashboards = {
    getCitizen: () => this.get('/dashboard/citizen'),
    
    getEntity: (entityType: 'school' | 'msme', entityId: string) =>
      this.get(`/dashboard/entity?type=${entityType}&id=${entityId}`),
    
    getGovernment: () => this.get('/dashboard/govt'),
    
    getGovernmentWard: (wardId: string) =>
      this.get(`/dashboard/govt/ward/${wardId}`),
    
    getAdmin: () => this.get('/dashboard/admin'),
  };

  // Monitoring endpoints
  monitoring = {
    logActivity: (action: string, details: any) =>
      this.post('/monitoring/log-activity', { action, details }),
    
    logError: (module: string, errorType: string, message: string, stackTrace?: string) =>
      this.post('/monitoring/log-error', { module, errorType, message, stackTrace }),
    
    recordMetric: (metricType: string, value: number, context?: any) =>
      this.post('/monitoring/metric', { metricType, value, context }),
    
    getAnalytics: (timeRange: '24h' | '7d' | '30d' = '7d') =>
      this.get(`/monitoring/analytics?timeRange=${timeRange}`),
  };

  // Integrations endpoints
  integrations = {
    sendNotification: (payload: any) => {
      if (!isFeatureEnabled('notifications_email') && !isFeatureEnabled('notifications_sms') && !isFeatureEnabled('notifications_push')) {
        throw new Error('Notifications are not enabled');
      }
      return this.post('/integrations/notify', payload);
    },
    
    dispatchRedemption: (redemptionId: string) => {
      if (!isFeatureEnabled('csr_partners')) {
        throw new Error('CSR partner integrations are not enabled');
      }
      return this.post('/integrations/dispatch-redemption', { redemptionId });
    },
    
    reverseGeocode: (lat: number, lng: number, actionId: string) => {
      if (!isFeatureEnabled('geo_services')) {
        throw new Error('Geographic services are not enabled');
      }
      return this.post('/integrations/reverse-geocode', { lat, lng, actionId });
    },
  };

  // Admin endpoints
  admin = {
    getAuditLogs: (page = 1, limit = 20, filters?: any) =>
      this.get(`/admin/audit-logs?page=${page}&limit=${limit}`, {
        body: filters ? JSON.stringify(filters) : undefined,
      }),
    
    getErrorLogs: (page = 1, limit = 20) =>
      this.get(`/admin/error-logs?page=${page}&limit=${limit}`),
    
    getActivityLogs: (page = 1, limit = 20) =>
      this.get(`/admin/activity-logs?page=${page}&limit=${limit}`),
    
    reverseTransaction: (logId: string) =>
      this.post('/admin/reverse-txn', { logId }),
    
    getDeployLogs: (page = 1, limit = 20) =>
      this.get(`/admin/deploy-logs?page=${page}&limit=${limit}`),
    
    getAnalytics: (timeRange: '24h' | '7d' | '30d' = '7d') =>
      this.get(`/admin/analytics?timeRange=${timeRange}`),
    
    exportAnalytics: (timeRange: '24h' | '7d' | '30d' = '7d', format: 'csv' | 'pdf' = 'csv') =>
      this.get(`/admin/analytics/export?timeRange=${timeRange}&format=${format}`),
  };

  // Account management endpoints
  account = {
    deleteAccount: (data: { confirmationText: string; reason: string }) =>
      this.post<{ success: boolean; message: string }>('/account/delete', data),
    
    exportData: (data: { format: 'json' | 'csv' | 'pdf' }) =>
      this.post<{ success: boolean; downloadUrl: string }>('/account/export', data),
  };
}

// Create API client instance
const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
});

export default apiClient;
export { apiClient as api };