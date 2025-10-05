'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { LeaderboardList } from '@/components/ui/LeaderboardList';
import { TrackerCard } from '@/components/ui/TrackerCard';
import { BigQueryDashboard } from '@/components/ui/BigQueryDashboard';
import { InstitutionalUserManagement } from '@/components/ui/InstitutionalUserManagement';
import { AdminConsole } from '@/components/ui/AdminConsole';
import { EnhancedGovernmentDashboard } from '@/components/ui/EnhancedGovernmentDashboard';
import { EnhancedMSMEDashboard } from '@/components/ui/EnhancedMSMEDashboard';
import { EnhancedCitizenDashboard } from '@/components/ui/EnhancedCitizenDashboard';
import { EnhancedSchoolDashboard } from '@/components/ui/EnhancedSchoolDashboard';
import { ExportManager } from '@/components/ui/ExportManager';
import { DashboardTester } from '@/components/ui/DashboardTester';
import { WalletAuditViewer } from '@/components/ui/WalletAuditViewer';
import { Button } from '@/components/ui/button';
import { 
  Factory, 
  Users, 
  School, 
  User, 
  BarChart3, 
  Settings, 
  Wallet, 
  Building, 
  Database, 
  Activity,
  TrendingUp,
  Leaf,
  Brain,
  PawPrint,
  Download,
  Loader2,
  RefreshCw,
  Shield,
  Zap,
  Recycle,
  Heart
} from 'lucide-react';

interface AdminDashboardProps {
  user: {
    id: string;
    displayName?: string;
    email?: string;
    role: string;
    healCoins?: number;
  };
  data: {
    systemMetrics: {
      serverUptime: number;
      apiResponseTime: number;
      databasePerformance: number;
      errorRate: number;
      activeConnections: number;
      storageUsage: number;
      systemHealth?: number;
      totalUsers?: number;
    };
    userStats: {
      newUsersToday: number;
      activeUsersToday: number;
      retentionRate: number;
      avgSessionDuration: number;
    };
    financialMetrics: {
      totalHealCoinsCirculating: number;
      dailyTransactionVolume: number;
      revenueToday: number;
      monthlyGrowth: number;
    };
    topOrganizations: Array<{
      id: string;
      name: string;
      score: number;
      rank: number;
      category: 'school' | 'government' | 'enterprise' | 'ngo';
      change: number;
    }>;
    recentAlerts: Array<{
      id: string;
      type: 'security' | 'performance' | 'user' | 'system';
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp: Date;
      resolved: boolean;
    }>;
    userActivity: Array<{
      action: string;
      user: string;
      impact: string;
      timestamp: Date;
      userType: 'citizen' | 'school' | 'government' | 'admin';
    }>;
  };
}

export function AdminDashboard({ user, data }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'institutional' | 'admin-console' | 'government' | 'msme' | 'citizen' | 'school' | 'bigquery' | 'test' | 'wallet-audit'>('overview');
  const [showExportManager, setShowExportManager] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure data properties are properly initialized
  const safeData = {
    systemMetrics: data.systemMetrics || {},
    userStats: data.userStats || {},
    financialMetrics: data.financialMetrics || {},
    topOrganizations: Array.isArray(data.topOrganizations) ? data.topOrganizations : [],
    recentAlerts: Array.isArray(data.recentAlerts) ? data.recentAlerts : [],
    userActivity: Array.isArray(data.userActivity) ? data.userActivity : [],
  };

  const handleExportComplete = (type: 'csv' | 'pdf', filename: string) => {
    console.log(`Export completed: ${filename} (${type})`);
    // You can add toast notifications or other feedback here
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg shadow-gray-100/30">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent mb-4">
              Welcome back, {user.displayName || 'Administrator'}! ⚙️
            </h1>
            <p className="text-gray-600 text-lg font-medium">Platform management and system oversight</p>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold inline-block mt-4 shadow-md">
              System Administrator 🔧
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200/30">
            <div className="flex justify-between items-center mb-4">
              <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'users', label: 'User Management', icon: Users },
                  { id: 'institutional', label: 'Institutional Users', icon: Building },
                  { id: 'admin-console', label: 'Admin Console', icon: Settings },
                  { id: 'wallet-audit', label: 'Wallet Audit', icon: Wallet },
                  { id: 'government', label: 'Government Dashboard', icon: Building },
                  { id: 'msme', label: 'MSME Dashboard', icon: Factory },
                  { id: 'citizen', label: 'Citizen Dashboard', icon: User },
                  { id: 'school', label: 'School Dashboard', icon: School },
                  { id: 'bigquery', label: 'BigQuery Analytics', icon: Database },
                  { id: 'test', label: 'Integration Tests', icon: Activity },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 font-semibold text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap relative group ${
                      activeTab === tab.id
                        ? 'text-indigo-700'
                        : 'text-gray-500 hover:text-indigo-600'
                    }`}
                  >
                    {React.createElement(tab.icon, { className: "h-5 w-5" })}
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                    )}
                    {activeTab !== tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200/50 group-hover:bg-gray-300/70 rounded-full"></div>
                    )}
                  </button>
                ))}
              </nav>
              <Button
                onClick={() => setShowExportManager(!showExportManager)}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-indigo-50 border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Download className="h-4 w-4 text-indigo-600" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Export Manager Modal */}
        {showExportManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Export Dashboard Data</h2>
                <Button
                  onClick={() => setShowExportManager(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <ExportManager
                dashboardType="admin"
                onExportComplete={handleExportComplete}
                data={{
                  users: safeData.userStats ? [safeData.userStats] : [],
                  organizations: safeData.topOrganizations || [],
                  systemMetrics: safeData.systemMetrics ? [safeData.systemMetrics] : [],
                  auditLogs: safeData.recentAlerts || [],
                  transactions: safeData.userActivity || []
                }}
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'wallet-audit' && (
          <div className="space-y-6">
            <WalletAuditViewer
              onExport={(format) => {
                console.log(`Exporting wallet audit data in ${format} format`);
                // In a real app, this would trigger an API call
              }}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            {/* Top Row - Platform Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {safeData.systemMetrics && safeData.systemMetrics.totalUsers ? ((safeData.systemMetrics.totalUsers ?? 0) / 1000).toFixed(1) : '0.0'}K
                  </div>
                  <div className="text-sm opacity-90 mb-3">Total Users</div>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium">
                    +{safeData.userStats ? safeData.userStats.newUsersToday : 0} today 👥
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {safeData.userStats ? safeData.userStats.activeUsersToday : 0}
                  </div>
                  <div className="text-sm opacity-90 mb-3">Active Users</div>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium">
                    30-day average 📊
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {safeData.financialMetrics ? safeData.financialMetrics.dailyTransactionVolume : 0}
                  </div>
                  <div className="text-sm opacity-90 mb-3">Transactions</div>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium">
                    HealCoin transfers 🪙
                  </div>
                </div>
              </div>

              <div className={`bg-gradient-to-br ${(safeData.systemMetrics && safeData.systemMetrics.systemHealth !== undefined) ? 
                  (safeData.systemMetrics.systemHealth >= 95
                    ? 'from-emerald-500 to-emerald-600'
                    : safeData.systemMetrics.systemHealth >= 85
                      ? 'from-yellow-500 to-orange-500'
                      : 'from-red-500 to-red-600')
                  : 'from-gray-500 to-gray-600'
                } rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {safeData.systemMetrics ? (safeData.systemMetrics.systemHealth ?? 100) : 100}%
                  </div>
                  <div className="text-sm opacity-90 mb-3">System Health</div>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium">
                    {safeData.systemMetrics && safeData.systemMetrics.systemHealth !== undefined ? 
                      (safeData.systemMetrics.systemHealth >= 95
                        ? 'Excellent 🟢'
                        : safeData.systemMetrics.systemHealth >= 85
                          ? 'Good 🟡'
                          : 'Needs Attention 🔴')
                      : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TrackerCard
                type="carbon"
                title="System Performance"
                metrics={safeData.systemMetrics ? [
                  { label: 'Uptime', value: safeData.systemMetrics.serverUptime || 0, unit: '%' },
                  { label: 'Response Time', value: safeData.systemMetrics.apiResponseTime || 0, unit: 'ms' },
                  { label: 'Error Rate', value: safeData.systemMetrics.errorRate || 0, unit: '%' },
                ] : []}
                trend={safeData.systemMetrics && safeData.systemMetrics.errorRate < 1 ? 'improving' : 'declining'}
                lastUpdated={new Date()}
                onViewDetails={() => console.log('View system performance details')}
                className="shadow-xl hover:shadow-2xl transition-shadow duration-300"
              />

              <TrackerCard
                type="mental-health"
                title="User Engagement"
                metrics={safeData.userStats ? [
                  { label: 'Daily Active', value: safeData.userStats.activeUsersToday || 0, unit: 'users' },
                  {
                    label: 'Session Duration',
                    value: safeData.userStats.avgSessionDuration || 0,
                    unit: 'minutes',
                  },
                  { label: 'Retention Rate', value: safeData.userStats.retentionRate || 0, unit: '%' },
                ] : []}
                trend="improving"
                lastUpdated={new Date()}
                onViewDetails={() => console.log('View user engagement details')}
                className="shadow-xl hover:shadow-2xl transition-shadow duration-300"
              />

              <TrackerCard
                type="animal-welfare"
                title="Financial Overview"
                metrics={safeData.financialMetrics ? [
                  {
                    label: 'HealCoins Circulating',
                    value: safeData.financialMetrics.totalHealCoinsCirculating || 0,
                    unit: 'HC',
                  },
                  {
                    label: 'Daily Volume',
                    value: safeData.financialMetrics.dailyTransactionVolume || 0,
                    unit: 'txns',
                  },
                  { label: 'Monthly Growth', value: safeData.financialMetrics.monthlyGrowth || 0, unit: '%' },
                ] : []}
                trend="improving"
                lastUpdated={new Date()}
                onViewDetails={() => console.log('View financial details')}
                className="shadow-xl hover:shadow-2xl transition-shadow duration-300"
              />
            </div>

            {/* Third Row - Alerts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ZPCard title="Recent System Alerts" description="Monitor critical system events" className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="space-y-4">
                  {safeData.recentAlerts ? safeData.recentAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-md ${
                        alert.severity === 'critical'
                          ? 'border-red-500 bg-red-50/50'
                          : alert.severity === 'high'
                            ? 'border-orange-500 bg-orange-50/50'
                            : alert.severity === 'medium'
                              ? 'border-yellow-500 bg-yellow-50/50'
                              : 'border-blue-500 bg-blue-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <ZPBadge
                          variant={
                            alert.severity === 'critical' || alert.severity === 'high'
                              ? 'danger'
                              : alert.severity === 'medium'
                                ? 'warning'
                                : 'info'
                          }
                          className="px-3 py-1"
                        >
                          {alert.severity}
                        </ZPBadge>
                      </div>
                    </div>
                  )) : []}
                </div>
              </ZPCard>

              <ZPCard title="Recent User Activity" description="Track platform engagement" className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="space-y-4">
                  {safeData.userActivity ? safeData.userActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 hover:bg-indigo-50/50 rounded-xl transition-colors duration-300">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="text-lg">
                          {activity.userType === 'citizen'
                            ? '👤'
                            : activity.userType === 'school'
                              ? '🏫'
                              : activity.userType === 'government'
                                ? '🏛️'
                                : '⚙️'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user} • {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-indigo-600">{activity.impact}</div>
                    </div>
                  )) : []}
                </div>
              </ZPCard>
            </div>

            {/* Fourth Row - Top Organizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ZPCard title="Top Performing Organizations" description="Leaderboard by eco-score" className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <LeaderboardList
                  entries={safeData.topOrganizations ? safeData.topOrganizations.map((org) => ({
                    id: org.id,
                    name: org.name,
                    score: org.score,
                    rank: org.rank,
                    change: org.change,
                    category: 'overall' as const, // Map organization types to overall category for eco-score leaderboard
                  })) : []}
                />
              </ZPCard>

              <div className="space-y-6">
                <ZPCard title="System Status" description="Real-time monitoring" className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="text-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {safeData.systemMetrics ? safeData.systemMetrics.serverUptime : 0}%
                      </div>
                      <div className="text-sm text-green-700 font-medium">Server Uptime</div>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {safeData.systemMetrics ? safeData.systemMetrics.apiResponseTime : 0}ms
                      </div>
                      <div className="text-sm text-blue-700 font-medium">API Response</div>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {safeData.systemMetrics ? safeData.systemMetrics.activeConnections : 0}
                      </div>
                      <div className="text-sm text-purple-700 font-medium">Active Connections</div>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                      <div className="text-3xl font-bold text-amber-600 mb-2">
                        {safeData.systemMetrics ? safeData.systemMetrics.storageUsage : 0}%
                      </div>
                      <div className="text-sm text-amber-700 font-medium">Storage Usage</div>
                    </div>
                  </div>
                </ZPCard>
              </div>
            </div>

            {/* Bottom Row - Administrative Tools */}
            <ZPCard
              title="Administrative Tools"
              description="Platform management and maintenance utilities"
              className="shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <ZPButton variant="outline" className="h-24 flex-col bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-700">User Management</span>
                </ZPButton>
                <ZPButton variant="outline" className="h-24 flex-col bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300">
                  <Settings className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-700">System Settings</span>
                </ZPButton>
                <ZPButton variant="outline" className="h-24 flex-col bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-all duration-300">
                  <BarChart3 className="h-8 w-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-amber-700">Analytics</span>
                </ZPButton>
                <ZPButton variant="outline" className="h-24 flex-col bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200 hover:from-purple-100 hover:to-fuchsia-100 transition-all duration-300">
                  <Shield className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-purple-700">Security Center</span>
                </ZPButton>
              </div>
            </ZPCard>
          </>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <ZPCard title="User Management" description="Manage platform users and permissions" className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-2xl font-bold text-gray-700 mb-2">User Management Coming Soon</p>
              <p className="text-gray-600">Comprehensive user administration tools</p>
            </div>
          </ZPCard>
        )}

        {/* Institutional User Management Tab */}
        {activeTab === 'institutional' && <InstitutionalUserManagement />}

        {/* Admin Console Tab */}
        {activeTab === 'admin-console' && <AdminConsole />}

        {/* Government Dashboard Tab */}
        {activeTab === 'government' && (
          <EnhancedGovernmentDashboard
            user={user}
          />
        )}

        {/* MSME Dashboard Tab */}
        {activeTab === 'msme' && (<EnhancedMSMEDashboard user={user} />)}

        {/* Citizen Dashboard Tab */}
        {activeTab === 'citizen' && (<EnhancedCitizenDashboard />)}

        {/* School Dashboard Tab */}
        {activeTab === 'school' && (<EnhancedSchoolDashboard />)}

        {/* BigQuery Analytics Tab */}
        {activeTab === 'bigquery' && (
          <BigQueryDashboard
            onExportComplete={(exportId) => {
              console.log('Export completed:', exportId);
              // Handle export completion
            }}
          />
        )}

        {/* Integration Tests Tab */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <DashboardTester />
          </div>
        )}
      </div>
    </div>
  );
}