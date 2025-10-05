'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { AdminAnalyticsDashboard } from '@/components/ui/AdminAnalyticsDashboard';
import { DeploymentLogs } from '@/components/ui/DeploymentLogs';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'earn' | 'redeem' | 'transfer' | 'admin_adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  adminId?: string;
  adminName?: string;
}

interface SystemAlert {
  id: string;
  type: 'security' | 'performance' | 'user' | 'system' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface SystemMetrics {
  serverUptime: number;
  apiResponseTime: number;
  databaseConnections: number;
  activeUsers: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export const AdminConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'wallets' | 'audit' | 'alerts' | 'system'>('overview');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date('2024-01-15T10:30:00'),
        userId: 'admin1',
        userName: 'Admin User',
        action: 'user_suspend',
        resource: 'user',
        details: 'Suspended user john.doe@example.com for policy violation',
        ipAddress: '192.168.1.100',
        severity: 'high'
      },
      {
        id: '2',
        timestamp: new Date('2024-01-15T09:15:00'),
        userId: 'admin1',
        userName: 'Admin User',
        action: 'wallet_adjustment',
        resource: 'wallet',
        details: 'Added 500 HealCoins to user wallet for compensation',
        ipAddress: '192.168.1.100',
        severity: 'medium'
      },
      {
        id: '3',
        timestamp: new Date('2024-01-15T08:45:00'),
        userId: 'system',
        userName: 'System',
        action: 'backup_completed',
        resource: 'system',
        details: 'Daily database backup completed successfully',
        ipAddress: 'localhost',
        severity: 'low'
      }
    ];

    const mockWalletTransactions: WalletTransaction[] = [
      {
        id: 'tx1',
        userId: 'user1',
        userName: 'John Doe',
        type: 'admin_adjustment',
        amount: 500,
        balanceBefore: 1000,
        balanceAfter: 1500,
        description: 'Compensation for system downtime',
        timestamp: new Date('2024-01-15T10:00:00'),
        status: 'completed',
        adminId: 'admin1',
        adminName: 'Admin User'
      },
      {
        id: 'tx2',
        userId: 'user2',
        userName: 'Sarah Wilson',
        type: 'earn',
        amount: 50,
        balanceBefore: 200,
        balanceAfter: 250,
        description: 'Carbon tracking activity reward',
        timestamp: new Date('2024-01-15T09:30:00'),
        status: 'completed'
      },
      {
        id: 'tx3',
        userId: 'user3',
        userName: 'Mike Johnson',
        type: 'redeem',
        amount: -100,
        balanceBefore: 300,
        balanceAfter: 200,
        description: 'Redeemed for eco-friendly product',
        timestamp: new Date('2024-01-15T08:15:00'),
        status: 'completed'
      }
    ];

    const mockSystemAlerts: SystemAlert[] = [
      {
        id: 'alert1',
        type: 'performance',
        severity: 'medium',
        title: 'High API Response Time',
        message: 'API response time has exceeded 500ms threshold for the past 10 minutes',
        timestamp: new Date('2024-01-15T11:00:00'),
        resolved: false
      },
      {
        id: 'alert2',
        type: 'security',
        severity: 'high',
        title: 'Multiple Failed Login Attempts',
        message: 'User admin@example.com has 5 failed login attempts in the last hour',
        timestamp: new Date('2024-01-15T10:45:00'),
        resolved: true,
        resolvedBy: 'Admin User',
        resolvedAt: new Date('2024-01-15T11:15:00')
      },
      {
        id: 'alert3',
        type: 'financial',
        severity: 'critical',
        title: 'Unusual Transaction Pattern',
        message: 'Large volume of HealCoin transfers detected from single user account',
        timestamp: new Date('2024-01-15T09:30:00'),
        resolved: false
      }
    ];

    const mockSystemMetrics: SystemMetrics = {
      serverUptime: 99.8,
      apiResponseTime: 245,
      databaseConnections: 45,
      activeUsers: 1250,
      errorRate: 0.02,
      memoryUsage: 68,
      cpuUsage: 35,
      diskUsage: 72
    };

    setAuditLogs(mockAuditLogs);
    setWalletTransactions(mockWalletTransactions);
    setSystemAlerts(mockSystemAlerts);
    setSystemMetrics(mockSystemMetrics);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricColor = (value: number, type: 'uptime' | 'usage' | 'rate') => {
    if (type === 'uptime') {
      return value >= 99 ? 'text-green-600' : value >= 95 ? 'text-yellow-600' : 'text-red-600';
    }
    if (type === 'usage') {
      return value <= 70 ? 'text-green-600' : value <= 85 ? 'text-yellow-600' : 'text-red-600';
    }
    if (type === 'rate') {
      return value <= 0.05 ? 'text-green-600' : value <= 0.1 ? 'text-yellow-600' : 'text-red-600';
    }
    return 'text-gray-600';
  };

  const filteredAuditLogs = auditLogs.filter(log =>
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = walletTransactions.filter(tx =>
    tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unresolvedAlerts = systemAlerts.filter(alert => !alert.resolved);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm p-2 mb-6">
        <nav className="-mb-px flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'User Management', icon: '👥' },
            { id: 'wallets', label: 'Wallet Audit', icon: '💰' },
            { id: 'audit', label: 'Audit Logs', icon: '📋' },
            { id: 'alerts', label: 'System Alerts', icon: '🚨' },
            { id: 'system', label: 'System Health', icon: '⚡' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ZPCard title="System Uptime" className="text-center">
              <div className={`text-3xl font-bold ${getMetricColor(systemMetrics?.serverUptime || 0, 'uptime')}`}>
                {systemMetrics?.serverUptime}%
              </div>
              <div className="text-sm text-gray-500">Last 30 days</div>
            </ZPCard>
            <ZPCard title="Active Users" className="text-center">
              <div className="text-3xl font-bold text-blue-600">{systemMetrics?.activeUsers}</div>
              <div className="text-sm text-gray-500">Currently online</div>
            </ZPCard>
            <ZPCard title="Unresolved Alerts" className="text-center">
              <div className="text-3xl font-bold text-red-600">{unresolvedAlerts.length}</div>
              <div className="text-sm text-gray-500">Require attention</div>
            </ZPCard>
            <ZPCard title="Error Rate" className="text-center">
              <div className={`text-3xl font-bold ${getMetricColor(systemMetrics?.errorRate || 0, 'rate')}`}>
                {systemMetrics?.errorRate}%
              </div>
              <div className="text-sm text-gray-500">Last 24 hours</div>
            </ZPCard>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ZPCard title="Recent Audit Logs" description="Latest administrative actions">
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{log.action.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm text-gray-600">{log.details}</div>
                      <div className="text-xs text-gray-400">
                        {log.userName} • {log.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <ZPBadge className={getSeverityColor(log.severity)}>
                      {log.severity.toUpperCase()}
                    </ZPBadge>
                  </div>
                ))}
              </div>
            </ZPCard>

            <ZPCard title="Critical Alerts" description="Alerts requiring immediate attention">
              <div className="space-y-3">
                {unresolvedAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-sm text-gray-600">{alert.message}</div>
                      <div className="text-xs text-gray-400">
                        {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <ZPBadge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </ZPBadge>
                  </div>
                ))}
              </div>
            </ZPCard>
          </div>
          <AdminAnalyticsDashboard />
        </div>
      )}

      {/* Wallet Audit Tab */}
      {activeTab === 'wallets' && (
        <ZPCard title="Wallet Audit Trail" description="Monitor all wallet transactions and adjustments">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Balance Change</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">Admin</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{tx.userName}</div>
                        <div className="text-sm text-gray-500">{tx.userId}</div>
                      </td>
                      <td className="p-3">
                        <ZPBadge className={
                          tx.type === 'admin_adjustment' ? 'bg-purple-100 text-purple-800' :
                          tx.type === 'earn' ? 'bg-green-100 text-green-800' :
                          tx.type === 'redeem' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {tx.type.replace('_', ' ').toUpperCase()}
                        </ZPBadge>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{tx.balanceBefore} → {tx.balanceAfter}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{tx.description}</span>
                      </td>
                      <td className="p-3">
                        {tx.adminName ? (
                          <div className="text-sm">
                            <div className="font-medium">{tx.adminName}</div>
                            <div className="text-gray-500">{tx.adminId}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <ZPBadge className={getStatusColor(tx.status)}>
                          {tx.status.toUpperCase()}
                        </ZPBadge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{tx.timestamp.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ZPCard>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <ZPCard title="Audit Logs" description="Immutable sensitive actions tracked across the platform">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Filter by userId or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium">Timestamp</th>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Action</th>
                    <th className="text-left p-3 font-medium">Resource</th>
                    <th className="text-left p-3 font-medium">Details</th>
                    <th className="text-left p-3 font-medium">IP</th>
                    <th className="text-left p-3 font-medium">Severity</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-600">{log.timestamp.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userId}</div>
                      </td>
                      <td className="p-3"><ZPBadge>{log.action}</ZPBadge></td>
                      <td className="p-3 text-sm text-gray-600">{log.resource}</td>
                      <td className="p-3 text-sm text-gray-700 max-w-md truncate" title={log.details}>{log.details}</td>
                      <td className="p-3 text-sm text-gray-600">{log.ipAddress}</td>
                      <td className="p-3"><ZPBadge className={getSeverityColor(log.severity)}>{log.severity.toUpperCase()}</ZPBadge></td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <ZPButton
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Reverse related wallet transaction?')) return;
                              try {
                                const { httpsCallable } = await import('firebase/functions');
                                const { functions } = await import('@/lib/firebase');
                                const fn: any = httpsCallable(functions as any, 'reverseTransaction');
                                // Use log.id as placeholder for audit id
                                await fn({ logId: log.id, adminId: 'admin_demo' });
                                alert('Reversal requested.');
                              } catch (e) {
                                console.error('Reverse failed', e);
                                alert('Failed to reverse.');
                              }
                            }}
                          >
                            Reverse
                          </ZPButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ZPCard>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && systemMetrics && (
        <div className="space-y-6">
          <ZPCard title="System Performance Metrics" description="Real-time system health monitoring">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Server Uptime</div>
                <div className={`text-2xl font-bold ${getMetricColor(systemMetrics.serverUptime, 'uptime')}`}>
                  {systemMetrics.serverUptime}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">API Response Time</div>
                <div className="text-2xl font-bold text-blue-600">{systemMetrics.apiResponseTime}ms</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Memory Usage</div>
                <div className={`text-2xl font-bold ${getMetricColor(systemMetrics.memoryUsage, 'usage')}`}>
                  {systemMetrics.memoryUsage}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">CPU Usage</div>
                <div className={`text-2xl font-bold ${getMetricColor(systemMetrics.cpuUsage, 'usage')}`}>
                  {systemMetrics.cpuUsage}%
                </div>
              </div>
            </div>
          </ZPCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ZPCard title="Database Health" description="Database performance and connections">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Active Connections</span>
                  <span className="font-bold">{systemMetrics.databaseConnections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Disk Usage</span>
                  <span className={`font-bold ${getMetricColor(systemMetrics.diskUsage, 'usage')}`}>
                    {systemMetrics.diskUsage}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Error Rate</span>
                  <span className={`font-bold ${getMetricColor(systemMetrics.errorRate, 'rate')}`}>
                    {systemMetrics.errorRate}%
                  </span>
                </div>
              </div>
            </ZPCard>

            <ZPCard title="Quick Actions" description="Common administrative tasks">
              <div className="grid grid-cols-2 gap-3">
                <ZPButton variant="outline" className="h-16 flex-col">
                  <span className="text-xl mb-1">🔄</span>
                  <span className="text-sm">Restart Services</span>
                </ZPButton>
                <ZPButton variant="outline" className="h-16 flex-col">
                  <span className="text-xl mb-1">💾</span>
                  <span className="text-sm">Backup Database</span>
                </ZPButton>
                <ZPButton variant="outline" className="h-16 flex-col">
                  <span className="text-xl mb-1">🧹</span>
                  <span className="text-sm">Clear Cache</span>
                </ZPButton>
                <ZPButton variant="outline" className="h-16 flex-col">
                  <span className="text-xl mb-1">📊</span>
                  <span className="text-sm">Generate Report</span>
                </ZPButton>
              </div>
            </ZPCard>
          </div>

          <DeploymentLogs />
        </div>
      )}
    </div>
  );
};