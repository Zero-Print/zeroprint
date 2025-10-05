/**
 * Admin Dashboard Page
 * Displays system monitoring, users, configs, rewards, transactions, and logs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Settings, 
  Gift, 
  CreditCard,
  AlertTriangle,
  Download,
  RefreshCw,
  Loader2,
  Shield,
  BarChart3,
  Activity,
  Server
} from 'lucide-react';
import { dashboardClient } from '@/lib/dashboardClient';
import { useAuth } from '@/hooks/useAuth';
import { ZPChart } from '@/components/ZPChart';
import { ZPTable } from '@/components/ZPTable';

export default function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await dashboardClient.getAdminDashboard({ userId: user.uid });
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Reverse transaction
  const handleReverseTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to reverse this transaction?')) return;

    try {
      const result = await dashboardClient.reverseTransaction(transactionId, 'Admin reversal');
      if (result.success) {
        alert('Transaction reversed successfully');
        loadDashboardData(); // Refresh data
      } else {
        alert('Failed to reverse transaction');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reverse transaction');
    }
  };

  // Export dashboard data
  const handleExportDashboard = async (format: 'csv' | 'pdf') => {
    try {
      const result = await dashboardClient.exportDashboardData('admin', format, { 
        userId: user?.uid 
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message || 'Failed to export dashboard data');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view admin dashboard</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error loading dashboard</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System monitoring and administration
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExportDashboard('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExportDashboard('pdf')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.users?.users?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.rewards?.rewards?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Active Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.errorStats?.totalErrors || 0}</div>
                <div className="text-sm text-muted-foreground">Total Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.deployLogs?.logs?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Deployments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="configs">Configs</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
                <CardDescription>Current system status and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">Healthy</div>
                      <div className="text-sm text-muted-foreground">System Status</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">99.9%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="text-sm font-medium">{dashboardData?.users?.users?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Errors</span>
                      <span className="text-sm font-medium">{dashboardData?.errorStats?.totalErrors || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Error Statistics</CardTitle>
                <CardDescription>System errors by module and severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">By Module</h4>
                      <div className="space-y-1">
                        {(dashboardData?.errorStats?.errorsByModule || []).slice(0, 3).map((error: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{error.module}</span>
                            <span>{error.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">By Severity</h4>
                      <div className="space-y-1">
                        {(dashboardData?.errorStats?.errorsBySeverity || []).slice(0, 3).map((error: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{error.severity}</span>
                            <span>{error.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>Manage system users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <ZPTable
                  data={(dashboardData?.users?.users || []).filter((user: any) => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  columns={[
                    { accessorKey: 'name', header: 'Name' },
                    { accessorKey: 'email', header: 'Email' },
                    { accessorKey: 'role', header: 'Role' },
                    { accessorKey: 'status', header: 'Status' },
                    { accessorKey: 'createdAt', header: 'Created' },
                    { accessorKey: 'lastActive', header: 'Last Active' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configs Tab */}
        <TabsContent value="configs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Configuration</span>
              </CardTitle>
              <CardDescription>Manage feature flags and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Feature Flags</h4>
                  <div className="space-y-2">
                    {(dashboardData?.configs?.featureFlags || []).map((flag: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{flag.key}</div>
                          <div className="text-sm text-muted-foreground">{flag.description}</div>
                        </div>
                        <Badge variant={flag.value ? 'default' : 'secondary'}>
                          {flag.value ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">System Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">Daily Limits</div>
                      <div className="text-sm text-muted-foreground">
                        Max coins per day: 1000
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">Rate Limits</div>
                      <div className="text-sm text-muted-foreground">
                        API calls per minute: 100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5" />
                <span>Rewards Management</span>
              </CardTitle>
              <CardDescription>Manage rewards and redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ZPTable
                data={dashboardData?.rewards?.rewards || []}
                columns={[
                  { accessorKey: 'name', header: 'Name' },
                  { accessorKey: 'description', header: 'Description' },
                  { accessorKey: 'coinCost', header: 'Coin Cost' },
                  { accessorKey: 'stock', header: 'Stock' },
                  { accessorKey: 'redemptions', header: 'Redemptions' },
                  { accessorKey: 'status', header: 'Status' },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Transaction Management</span>
              </CardTitle>
              <CardDescription>Monitor and manage user transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ZPTable
                data={dashboardData?.transactions?.transactions || []}
                columns={[
                  { accessorKey: 'id', header: 'ID' },
                  { accessorKey: 'userId', header: 'User ID' },
                  { accessorKey: 'type', header: 'Type' },
                  { accessorKey: 'amount', header: 'Amount' },
                  { accessorKey: 'status', header: 'Status' },
                  { accessorKey: 'createdAt', header: 'Created' },
                  {
                    accessorKey: 'actions',
                    header: 'Actions',
                    cell: ({ row }: any) => (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReverseTransaction(row.original.id)}
                      >
                        Reverse
                      </Button>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Latest system errors and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(dashboardData?.errorStats?.recentErrors || []).map((error: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{error.module}</div>
                          <div className="text-sm text-muted-foreground">{error.message}</div>
                        </div>
                        <Badge variant={error.severity === 'high' ? 'destructive' : 'secondary'}>
                          {error.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(error.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Logs</CardTitle>
                <CardDescription>Recent system deployments and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(dashboardData?.deployLogs?.logs || []).slice(0, 5).map((log: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">v{log.version}</div>
                          <div className="text-sm text-muted-foreground">{log.environment}</div>
                        </div>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(log.deployedAt).toLocaleString()} by {log.deployedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
