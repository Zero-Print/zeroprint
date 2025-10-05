/**
 * Enhanced API Client
 * Centralized HTTP client with retry logic, error handling, and type safety
 */

import { auth } from './firebase';
import { getApiBaseUrl } from './env';
import { validateApiResponse, safeParse, ApiResponseSchema, UserProfileSchema, GameSchema, WalletSchema } from './safeValidation';
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

// API Error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base configuration
const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  return getApiBaseUrl();
};

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: { 
    baseUrl?: string; 
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
  } = {}) {
    this.baseUrl = config.baseUrl || getBaseUrl();
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      if (!auth) {
        console.warn('Auth is not initialized');
        return null;
      }
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
    options: RequestInit = {},
    retries: number = this.retryAttempts
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}${endpoint}`;

      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      let response;
      try {
        response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });
      } catch (networkError) {
        clearTimeout(timeoutId);
        console.error('Network error when fetching:', url, networkError);
        throw new ApiError('Network error: Unable to reach API', 0);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Retry on server errors (5xx) or rate limiting (429)
        if ((response.status >= 500 || response.status === 429) && retries > 0) {
          console.warn(`Request failed with ${response.status}, retrying... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (this.retryAttempts - retries + 1)));
          return this.request<T>(endpoint, options, retries - 1);
        }

        console.error('API error response:', url, response.status, errorData);
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.error,
          errorData
        );
      }

      const data = await response.json();

      // Use safe validation for API responses
      const validationResult = validateApiResponse(data);

      if (!validationResult.success) {
        console.error('API response validation failed:', url, validationResult.error, data);
        throw new ApiError(validationResult.error || 'API request failed', response.status, validationResult.error, data);
      }

      return {
        success: true,
        data: validationResult.data as T,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('API request aborted (timeout):', endpoint);
          throw new ApiError('Request timeout', 408);
        }
        console.error('API request error:', endpoint, error.message);
        throw new ApiError(error.message, 0);
      }

      console.error('Unknown API error:', endpoint, error);
      throw new ApiError('Unknown error occurred', 0);
    }
  }

  // Generic HTTP methods
  async get<T>(path: string, options?: { params?: Record<string, any> }): Promise<ApiResponse<T>> {
    let url = path;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(path: string, body: unknown, auth?: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: unknown, auth?: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string, auth?: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  // Auth endpoints
  auth = {
    signup: (data: { email: string; password: string; userData: any }) =>
      this.post<{ userId: string; token: string }>('/auth/signup', data),
    
    login: (data: { email: string; password: string }) =>
      this.post<{ userId: string; token: string }>('/auth/login', data),
    
    getProfile: () =>
      this.get<User>('/auth/profile'),
    
    updateProfile: (data: Partial<User>) =>
      this.put<User>('/auth/profile', data),
  };


  // Tracker endpoints
  trackers = {
    logCarbon: (data: { actionType: string; value: number; details?: any }) =>
      this.post<CarbonLog>('/trackers/carbon', data),
    
    logMood: (data: { mood: string; note?: string }) =>
      this.post<MentalHealthLog>('/trackers/mood', data),
    
    logAnimal: (data: { actions: any[] }) =>
      this.post<AnimalWelfareLog>('/trackers/animal', data),
    
    runDigitalTwin: (data: { inputConfig: any }) =>
      this.post<DigitalTwinSimulation>('/trackers/digital-twin', data),
    
    generateMSMEReport: (data: { orgId: string; monthData: any }) =>
      this.post<MSMEReport>('/trackers/msme/report', data),
  };

  // Game endpoints
  games = {
    getGames: () =>
      this.get<Game[]>('/games'),
    
    getGame: (id: string) =>
      this.get<Game & { config: any }>(`/games/${id}`),
    
    completeGame: (gameId: string, data: { score: number; clientData: any; playTime: number }) =>
      this.post<GameScore>(`/games/${gameId}/complete`, data),
    
    getGameHistory: (page: number = 1, limit: number = 20) =>
      this.get<{ scores: GameScore[]; pagination: any }>(`/games/history?page=${page}&limit=${limit}`),
    
    getLeaderboard: (gameId: string, limit: number = 10) =>
      this.get<GameScore[]>(`/games/${gameId}/leaderboard?limit=${limit}`),
  };


  // Rewards endpoints
  rewards = {
    getRewards: () =>
      this.get<Reward[]>('/rewards'),
    
    getReward: (id: string) =>
      this.get<Reward>(`/rewards/${id}`),
    
    redeemReward: (data: { rewardId: string }) =>
      this.post<Redemption>('/rewards/redeem', data),
    
    getRedemptions: (page: number = 1, limit: number = 20) =>
      this.get<PaginatedApiResponse<Redemption>>(`/rewards/redemptions?page=${page}&limit=${limit}`),
  };

  // Wallet endpoints
  wallet = {
    getBalance: () =>
      this.get<Wallet>('/wallet/balance'),
    
    getTransactions: (page: number = 1, limit: number = 20) =>
      this.get<PaginatedApiResponse<WalletTransaction>>(`/wallet/transactions?page=${page}&limit=${limit}`),
    
    addCredits: (amount: number) =>
      this.post<Wallet>('/wallet/add-credits', { amount }),
    
    earnCoins: (data: { gameId: string; coins: number; source?: string }) =>
      this.post<Wallet>('/wallet/earn', data),
    
    redeemCoins: (data: { rewardId: string; quantity?: number }) =>
      this.post<Redemption>('/wallet/redeem', data),
    
    getRedemptions: (page: number = 1, limit: number = 20) =>
      this.get<PaginatedApiResponse<Redemption>>(`/wallet/redemptions?page=${page}&limit=${limit}`),
    
    transferCoins: (data: { recipientId: string; amount: number; message?: string }) =>
      this.post<{ success: boolean; transactionId: string }>('/wallet/transfer', data),
    
    getLimits: () =>
      this.get<{ dailyLimit: number; monthlyLimit: number; dailyUsed: number; monthlyUsed: number }>('/wallet/limits'),
  };

  // Subscriptions endpoints
  subscriptions = {
    getPlans: () =>
      this.get<SubscriptionPlan[]>('/subscriptions/plans'),
    
    checkout: (data: { planId: string; userEmail: string; userName: string }) =>
      this.post<{ orderId: string; amount: number; currency: string; keyId: string; order: any }>('/subscriptions/checkout', data),
    
    getStatus: () =>
      this.get<Subscription | null>('/subscriptions/status'),
    
    cancel: (data: { subscriptionId: string; reason?: string }) =>
      this.post<Subscription>('/subscriptions/cancel', data),
  };

  // Dashboard endpoints
  dashboards = {
    getCitizenDashboard: (filters?: any) =>
      this.get<CitizenDashboard>('/dashboard/citizen', filters),
    
    getEntityDashboard: (type: 'school' | 'msme', id: string, filters?: any) =>
      this.get<EntityDashboard>(`/dashboard/entity?type=${type}&id=${id}`, filters),
    
    getGovernmentDashboard: () =>
      this.get<GovernmentDashboard>('/dashboard/govt'),
    
    getGovernmentWardDashboard: (wardId: string) =>
      this.get<GovernmentDashboard>(`/dashboard/govt/ward/${wardId}`),
    
    getAdminDashboard: () =>
      this.get<AdminDashboard>('/dashboard/admin'),
    
    // Additional methods needed by dashboardClient
    getCitizenEcoScore: () =>
      this.get<any>('/dashboard/citizen/ecoscore'),
    
    getCitizenTrends: (timeRange?: string) =>
      this.get<any>(`/dashboard/citizen/trends?timeRange=${timeRange || '7d'}`),
    
    getCitizenDigitalTwin: () =>
      this.get<any>('/dashboard/citizen/digital-twin'),
    
    getCitizenActivity: (pagination?: any) =>
      this.get<any>('/dashboard/citizen/activity', pagination),
    
    getCitizenLeaderboards: () =>
      this.get<any>('/dashboard/citizen/leaderboards'),
    
    getEntityKPIs: (entityType: string, entityId: string) =>
      this.get<any>(`/dashboard/entity/kpis?type=${entityType}&id=${entityId}`),
    
    getEntityLeaderboard: (entityType: string, entityId: string) =>
      this.get<any>(`/dashboard/entity/leaderboard?type=${entityType}&id=${entityId}`),
    
    getEntityGameHeatmap: (entityType: string, entityId: string) =>
      this.get<any>(`/dashboard/entity/game-heatmap?type=${entityType}&id=${entityId}`),
    
    getEntityESGReport: (entityType: string, entityId: string) =>
      this.get<any>(`/dashboard/entity/esg-report?type=${entityType}&id=${entityId}`),
    
    getWardSelector: () =>
      this.get<any>('/dashboard/govt/ward-selector'),
    
    getGeoJSONHeatmap: () =>
      this.get<any>('/dashboard/govt/geojson-heatmap'),
    
    getGovernmentKPIs: () =>
      this.get<any>('/dashboard/govt/kpis'),
    
    getScenarioSimulations: () =>
      this.get<any>('/dashboard/govt/scenario-simulations'),
    
    runScenarioSimulation: (data: any) =>
      this.post<any>('/dashboard/govt/run-simulation', data),
    
    getAdminUsers: () =>
      this.get<any>('/dashboard/admin/users'),
    
    getAdminConfigs: () =>
      this.get<any>('/dashboard/admin/configs'),
    
    getAdminRewards: () =>
      this.get<any>('/dashboard/admin/rewards'),
    
    getAdminTransactions: () =>
      this.get<any>('/dashboard/admin/transactions'),
    
    reverseTransaction: (data: any) =>
      this.post<any>('/dashboard/admin/reverse-transaction', data),
    
    getAdminErrorStats: () =>
      this.get<any>('/dashboard/admin/error-stats'),
    
    getAdminDeployLogs: () =>
      this.get<any>('/dashboard/admin/deploy-logs'),
    
    exportDashboardData: (format: string, filters?: any) =>
      this.get<any>(`/dashboard/export?format=${format}`, filters),
    
    exportCSV: (filters?: any) =>
      this.get<any>('/dashboard/export/csv', filters),
    
    exportPDF: (filters?: any) =>
      this.get<any>('/dashboard/export/pdf', filters),
  };

  // Monitoring endpoints
  monitoring = {
    getHealth: () =>
      this.get<{ status: string; timestamp: string }>('/monitoring/health'),

    getAnalytics: (timeRange: TimeRange = '7d') =>
      this.get<any>('/monitoring/analytics', { params: { timeRange } }),

    getPerformance: () =>
      this.get<PerformanceMetric[]>('/monitoring/performance'),

    getErrors: (params?: { page?: number; limit?: number; severity?: string; module?: string }) =>
      this.get<ErrorLog[]>('/monitoring/errors', { params }),

    getAlerts: (params?: { page?: number; limit?: number; type?: string; severity?: string; resolved?: boolean }) =>
      this.get<any[]>('/monitoring/alerts', { params }),

    resolveAlert: (alertId: string) =>
      this.post<{ resolved: boolean }>(`/monitoring/alert/${alertId}/resolve`, {}),

    runHealthChecks: () =>
      this.post<{ message: string; timestamp: string }>('/monitoring/health-checks', {}),

    exportData: (timeRange: TimeRange, format: ExportFormat) =>
      this.get<string>(`/monitoring/export?timeRange=${timeRange}&format=${format}`),

    logActivity: (data: { action: string; details?: any; userId?: string }) =>
      this.post<ActivityLog>('/monitoring/log-activity', data),

    logError: (data: { module: string; errorType: string; message: string; stackTrace?: string; userId?: string }) =>
      this.post<ErrorLog>('/monitoring/log-error', data),

    recordMetric: (data: { metricType: string; value: number; context?: any }) =>
      this.post<PerformanceMetric>('/monitoring/metric', data),
  };

  // Integration endpoints
  integrations = {
    sendNotification: (data: { userId: string; channel: NotificationChannel; templateId: string; variables?: any }) =>
      this.post<NotificationLog>('/integrations/notify', data),
    
    dispatchRedemption: (data: { redemptionId: string }) =>
      this.post<Redemption>('/integrations/dispatch-redemption', data),
    
    reverseGeocode: (data: { lat: number; lng: number; actionId: string }) =>
      this.post<{ wardId: string; address: string }>('/integrations/reverse-geocode', data),
  };

  // Admin endpoints
  admin = {
    getAuditLogs: (filters?: { userId?: string; actionType?: string; dateFrom?: string; dateTo?: string }, page: number = 1, limit: number = 20) => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.actionType) params.append('actionType', filters.actionType);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      return this.get<PaginatedApiResponse<AuditLog>>(`/admin/audit-logs?${params.toString()}`);
    },
    
    getErrorLogs: (filters?: { module?: string; severity?: string; resolved?: boolean }, page: number = 1, limit: number = 20) => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (filters?.module) params.append('module', filters.module);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.resolved !== undefined) params.append('resolved', filters.resolved.toString());
      return this.get<PaginatedApiResponse<ErrorLog>>(`/admin/error-logs?${params.toString()}`);
    },
    
    getActivityLogs: (page: number = 1, limit: number = 20) =>
      this.get<PaginatedApiResponse<ActivityLog>>(`/admin/activity-logs?page=${page}&limit=${limit}`),
    
    reverseTransaction: (data: { logId: string }) =>
      this.post<{ success: boolean; message: string }>('/admin/reverse-txn', data),
    
    getDeployLogs: (page: number = 1, limit: number = 20) =>
      this.get<PaginatedApiResponse<DeploymentLog>>(`/admin/deploy-logs?page=${page}&limit=${limit}`),
    
    getAnalytics: (timeRange: TimeRange = '7d') =>
      this.get<AdminDashboard>(`/admin/analytics?timeRange=${timeRange}`),
    
    exportAnalytics: (timeRange: TimeRange = '7d', format: ExportFormat = 'csv') =>
      this.get<Blob>(`/admin/analytics/export?timeRange=${timeRange}&format=${format}`),
    
    // Rewards admin
    rewards: {
      getAllRedemptions: (page: number = 1, limit: number = 50, filters?: any) =>
        this.get<{ redemptions: Redemption[]; pagination: any }>(`/admin/rewards/redemptions?page=${page}&limit=${limit}`, filters),
      
      updateRedemptionStatus: (redemptionId: string, status: string, notes?: string) =>
        this.post<Redemption>(`/admin/rewards/redemptions/${redemptionId}/status`, { status, notes }),
      
      exportRedemptions: (format: ExportFormat, filters?: any) =>
        this.get<string>(`/admin/rewards/export?format=${format}`, filters),
      
      getAnalytics: () =>
        this.get<any>('/admin/rewards/analytics'),
    },
    
    // Subscriptions admin
    subscriptions: {
      getAllSubscriptions: (page: number = 1, limit: number = 50, filters?: any) =>
        this.get<{ subscriptions: Subscription[]; pagination: any }>(`/admin/subscriptions/all?page=${page}&limit=${limit}`, filters),
      
      getAnalytics: () =>
        this.get<any>('/admin/subscriptions/analytics'),
      
      exportSubscriptions: (format: ExportFormat, filters?: any) =>
        this.get<string>(`/admin/subscriptions/export?format=${format}`, filters),
    },
  };

  // Account management endpoints
  account = {
    deleteAccount: (data: { confirmationText: string; reason: string }) =>
      this.post<{ success: boolean; message: string }>('/account/delete', data),
    
    exportData: (data: { format: 'json' | 'csv' | 'pdf' }) =>
      this.post<{ success: boolean; downloadUrl: string }>('/account/export', data),
  };
}

// Create and export API client instance
const apiClient = new ApiClient();
export default apiClient;
export { apiClient as api };
