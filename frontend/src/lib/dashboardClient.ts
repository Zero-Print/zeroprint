/**
 * Dashboard Client
 * Typed fetchers with pagination and indexes for all dashboard types
 */

import api from './apiClient';
import { 
  CitizenDashboard, 
  EntityDashboard, 
  GovernmentDashboard, 
  AdminDashboard,
  DashboardFilters,
  TimeRange,
  ExportFormat,
  PaginationParams
} from '@/types';

export class DashboardClient {
  // Citizen Dashboard
  async getCitizenDashboard(filters?: DashboardFilters): Promise<CitizenDashboard> {
    const response = await api.dashboards.getCitizenDashboard(filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch citizen dashboard');
    }
    return response.data;
  }

  async getCitizenWallet(): Promise<{
    healCoins: number;
    inrBalance: number;
    recentTransactions: any[];
  }> {
    const response = await api.wallet.getBalance();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch wallet');
    }
    return response.data;
  }

  async getCitizenEcoScore(): Promise<{
    current: number;
    trend: Array<{ date: string; score: number }>;
    breakdown: {
      carbon: number;
      mood: number;
      kindness: number;
      digitalTwin: number;
    };
  }> {
    const response = await api.dashboards.getCitizenEcoScore();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch eco score');
    }
    return response.data;
  }

  async getCitizenTrends(timeRange: TimeRange = '7d'): Promise<{
    carbon: Array<{ date: string; value: number }>;
    mood: Array<{ date: string; value: number }>;
    kindness: Array<{ date: string; value: number }>;
  }> {
    const response = await api.dashboards.getCitizenTrends(timeRange);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch trends');
    }
    return response.data;
  }

  async getCitizenDigitalTwin(): Promise<{
    current: any;
    simulations: Array<{ id: string; name: string; result: any }>;
    recommendations: string[];
  }> {
    const response = await api.dashboards.getCitizenDigitalTwin();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch digital twin');
    }
    return response.data;
  }

  async getCitizenActivity(pagination?: PaginationParams): Promise<{
    activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      coinsEarned: number;
    }>;
    pagination: any;
  }> {
    const response = await api.dashboards.getCitizenActivity(pagination);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch activity');
    }
    return response.data;
  }

  async getCitizenLeaderboards(): Promise<{
    global: Array<{ rank: number; userId: string; score: number; name: string }>;
    friends: Array<{ rank: number; userId: string; score: number; name: string }>;
    local: Array<{ rank: number; userId: string; score: number; name: string }>;
  }> {
    const response = await api.dashboards.getCitizenLeaderboards();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch leaderboards');
    }
    return response.data;
  }

  // Entity Dashboard
  async getEntityDashboard(entityType: 'school' | 'msme', entityId: string, filters?: DashboardFilters): Promise<EntityDashboard> {
    const response = await api.dashboards.getEntityDashboard(entityType, entityId, filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch entity dashboard');
    }
    return response.data;
  }

  async getEntityKPIs(entityType: 'school' | 'msme', entityId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCo2Saved: number;
    ecoScore: number;
    engagement: number;
    trends: Array<{ date: string; value: number }>;
  }> {
    const response = await api.dashboards.getEntityKPIs(entityType, entityId);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch entity KPIs');
    }
    return response.data;
  }

  async getEntityLeaderboard(entityType: 'school' | 'msme', entityId: string, type: 'class' | 'unit' | 'department'): Promise<{
    leaderboard: Array<{ rank: number; name: string; score: number; category: string }>;
    categories: string[];
  }> {
    const response = await api.dashboards.getEntityLeaderboard(entityType, entityId, type);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch entity leaderboard');
    }
    return response.data;
  }

  async getEntityGameHeatmap(entityType: 'school' | 'msme', entityId: string): Promise<{
    heatmap: Array<{ gameId: string; gameName: string; plays: number; avgScore: number }>;
    timeRange: string;
  }> {
    const response = await api.dashboards.getEntityGameHeatmap(entityType, entityId);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch game heatmap');
    }
    return response.data;
  }

  async getEntityESGReport(entityType: 'school' | 'msme', entityId: string, format: 'pdf' | 'csv' = 'pdf'): Promise<{
    reportUrl: string;
    generatedAt: string;
    format: string;
  }> {
    const response = await api.dashboards.getEntityESGReport(entityType, entityId, format);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate ESG report');
    }
    return response.data;
  }

  // Government Dashboard
  async getGovernmentDashboard(filters?: DashboardFilters): Promise<GovernmentDashboard> {
    const response = await api.dashboards.getGovernmentDashboard(filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch government dashboard');
    }
    return response.data;
  }

  async getWardSelector(): Promise<{
    wards: Array<{ id: string; name: string; population: number; area: number }>;
    selectedWard?: string;
  }> {
    const response = await api.dashboards.getWardSelector();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch ward selector');
    }
    return response.data;
  }

  async getGeoJSONHeatmap(wardId?: string): Promise<{
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: any;
      properties: {
        wardId: string;
        wardName: string;
        co2Saved: number;
        ecoScore: number;
        adoptionRate: number;
        population: number;
      };
    }>;
  }> {
    const response = await api.dashboards.getGeoJSONHeatmap(wardId);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch GeoJSON heatmap');
    }
    return response.data;
  }

  async getGovernmentKPIs(wardId?: string): Promise<{
    totalCo2Saved: number;
    adoptionRate: number;
    ecoMindScore: number;
    kindnessIndex: number;
    activeUsers: number;
    totalWards: number;
    trends: Array<{ date: string; co2: number; adoption: number; ecoMind: number; kindness: number }>;
  }> {
    const response = await api.dashboards.getGovernmentKPIs(wardId);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch government KPIs');
    }
    return response.data;
  }

  async getScenarioSimulations(): Promise<{
    scenarios: Array<{
      id: string;
      name: string;
      description: string;
      parameters: any;
      results: any;
      createdAt: string;
    }>;
  }> {
    const response = await api.dashboards.getScenarioSimulations();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch scenario simulations');
    }
    return response.data;
  }

  async runScenarioSimulation(scenarioId: string, parameters: any): Promise<{
    simulationId: string;
    results: any;
    status: 'completed' | 'running' | 'failed';
  }> {
    const response = await api.dashboards.runScenarioSimulation(scenarioId, parameters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to run scenario simulation');
    }
    return response.data;
  }

  // Admin Dashboard
  async getAdminDashboard(filters?: DashboardFilters): Promise<AdminDashboard> {
    const response = await api.dashboards.getAdminDashboard(filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch admin dashboard');
    }
    return response.data;
  }

  async getAdminUsers(pagination?: PaginationParams, filters?: any): Promise<{
    users: Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      createdAt: string;
      lastActive: string;
      status: 'active' | 'inactive' | 'suspended';
    }>;
    pagination: any;
  }> {
    const response = await api.dashboards.getAdminUsers(pagination, filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch admin users');
    }
    return response.data;
  }

  async getAdminConfigs(): Promise<{
    featureFlags: Array<{ key: string; value: boolean; description: string }>;
    systemSettings: any;
    limits: any;
  }> {
    const response = await api.dashboards.getAdminConfigs();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch admin configs');
    }
    return response.data;
  }

  async getAdminRewards(pagination?: PaginationParams): Promise<{
    rewards: Array<{
      id: string;
      name: string;
      description: string;
      coinCost: number;
      stock: number;
      redemptions: number;
      status: 'active' | 'inactive';
    }>;
    pagination: any;
  }> {
    const response = await api.dashboards.getAdminRewards(pagination);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch admin rewards');
    }
    return response.data;
  }

  async getAdminTransactions(pagination?: PaginationParams, filters?: any): Promise<{
    transactions: Array<{
      id: string;
      userId: string;
      type: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
    pagination: any;
  }> {
    const response = await api.dashboards.getAdminTransactions(pagination, filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch admin transactions');
    }
    return response.data;
  }

  async reverseTransaction(transactionId: string, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.dashboards.reverseTransaction(transactionId, reason);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to reverse transaction');
    }
    return response.data;
  }

  async getAdminErrorStats(): Promise<{
    totalErrors: number;
    errorsByModule: Array<{ module: string; count: number }>;
    errorsBySeverity: Array<{ severity: string; count: number }>;
    recentErrors: Array<{
      id: string;
      module: string;
      message: string;
      severity: string;
      timestamp: string;
    }>;
  }> {
    const response = await api.dashboards.getAdminErrorStats();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch error stats');
    }
    return response.data;
  }

  async getAdminDeployLogs(pagination?: PaginationParams): Promise<{
    logs: Array<{
      id: string;
      version: string;
      environment: string;
      status: 'success' | 'failed' | 'running';
      deployedAt: string;
      deployedBy: string;
      changes: string[];
    }>;
    pagination: any;
  }> {
    const response = await api.dashboards.getAdminDeployLogs(pagination);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch deploy logs');
    }
    return response.data;
  }

  // Export Functions
  async exportDashboardData(
    dashboardType: 'citizen' | 'entity' | 'government' | 'admin',
    format: ExportFormat,
    filters?: DashboardFilters
  ): Promise<{
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  }> {
    const response = await api.dashboards.exportDashboardData(dashboardType, format, filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to export dashboard data');
    }
    return response.data;
  }

  async exportCSV(
    endpoint: string,
    filters?: any,
    pagination?: PaginationParams
  ): Promise<{
    csvData: string;
    filename: string;
  }> {
    const response = await api.dashboards.exportCSV(endpoint, filters, pagination);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to export CSV');
    }
    return response.data;
  }

  async exportPDF(
    template: string,
    data: any,
    options?: any
  ): Promise<{
    pdfUrl: string;
    filename: string;
  }> {
    const response = await api.dashboards.exportPDF(template, data, options);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to export PDF');
    }
    return response.data;
  }
}

// Create and export singleton instance
export const dashboardClient = new DashboardClient();
export default dashboardClient;
