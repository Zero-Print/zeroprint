/**
 * Monitoring Dashboard Component
 * Displays system health, analytics, and performance metrics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Download, 
  RefreshCw, 
  Server, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/apiClient';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  performance: Record<string, {
    avg: number;
    p95: number;
    p99: number;
    count: number;
  }>;
}

interface Analytics {
  dau: number;
  totalCoins: number;
  totalCo2Saved: number;
  ecoMindScore: number;
  kindnessIndex: number;
  errorCount: number;
  subscriptionCount: number;
  fraudAlerts: number;
  performance: {
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
  };
}

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function MonitoringDashboard() {
  const { isAdmin } = useAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load monitoring data
  const loadMonitoringData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [healthRes, analyticsRes, alertsRes] = await Promise.all([
        api.monitoring.getHealth(),
        api.monitoring.getAnalytics('7d'),
        api.monitoring.getAlerts({ limit: 10, resolved: false })
      ]);

      if (healthRes.success) setHealth(healthRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMonitoringData();
    setRefreshing(false);
  };

  // Run health checks
  const runHealthChecks = async () => {
    try {
      await api.monitoring.runHealthChecks();
      await loadMonitoringData();
    } catch (err: any) {
      setError(err.message || 'Failed to run health checks');
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      await api.monitoring.resolveAlert(alertId);
      await loadMonitoringData();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve alert');
    }
  };

  // Export data
  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await api.monitoring.exportData('7d', format);
      if (response.success) {
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitoring-data.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  };

  useEffect(() => {
    loadMonitoringData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need admin privileges to access the monitoring dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={runHealthChecks} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Health Checks
          </Button>
          <Button onClick={() => exportData('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportData('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant={health?.status === 'healthy' ? 'default' : 'destructive'}>
                    {health?.status || 'Unknown'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Uptime: {health?.uptime ? Math.floor(health.uptime / 3600) : 0}h
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Heap Used</span>
                    <span>{health?.memory.heapUsed || 0} MB</span>
                  </div>
                  <Progress 
                    value={health?.memory.heapUsed ? (health.memory.heapUsed / health.memory.heapTotal) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* CPU Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User</span>
                    <span>{health?.cpu.user || 0} ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>System</span>
                    <span>{health?.cpu.system || 0} ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts.filter(alert => !alert.resolved).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {alerts.filter(alert => !alert.resolved && alert.severity === 'critical').length} critical
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Overview */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.dau}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalCoins.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CO₂ Saved (kg)</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalCo2Saved.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">EcoMind Score</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.ecoMindScore}</div>
                  <Progress value={analytics.ecoMindScore} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {health?.performance && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(health.performance).map(([key, metric]) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">{key}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average</span>
                          <span>{metric.avg.toFixed(2)}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>P95</span>
                          <span>{metric.p95.toFixed(2)}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>P99</span>
                          <span>{metric.p99.toFixed(2)}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Count</span>
                          <span>{metric.count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Alerts</h3>
            {alerts.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>No Active Alerts</AlertTitle>
                <AlertDescription>
                  All systems are running normally.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={alert.resolved ? 'opacity-50' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'default' : 'secondary'
                            }>
                              {alert.severity}
                            </Badge>
                            <span className="font-medium">{alert.type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Analytics Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Daily Active Users</span>
                      <span className="font-bold">{analytics.dau}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Subscriptions</span>
                      <span className="font-bold">{analytics.subscriptionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EcoMind Score</span>
                      <span className="font-bold">{analytics.ecoMindScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kindness Index</span>
                      <span className="font-bold">{analytics.kindnessIndex}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Coins Earned</span>
                      <span className="font-bold">{analytics.totalCoins.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CO₂ Saved (kg)</span>
                      <span className="font-bold">{analytics.totalCo2Saved.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Count</span>
                      <span className="font-bold text-red-600">{analytics.errorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fraud Alerts</span>
                      <span className="font-bold text-orange-600">{analytics.fraudAlerts}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Avg Latency</span>
                      <span className="font-bold">{analytics.performance.avgLatency.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P95 Latency</span>
                      <span className="font-bold">{analytics.performance.p95Latency.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P99 Latency</span>
                      <span className="font-bold">{analytics.performance.p99Latency.toFixed(2)}ms</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
