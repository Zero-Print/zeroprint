/**
 * Entity Dashboard Page
 * Displays KPIs, leaderboards, game heatmap, and ESG reports for schools/MSMEs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  Leaf, 
  Trophy,
  BarChart3,
  Download,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Building2,
  GraduationCap
} from 'lucide-react';
import { dashboardClient } from '@/lib/dashboardClient';
import { useAuth } from '@/hooks/useAuth';
import { ZPChart } from '@/components/ZPChart';
import { ZPTable } from '@/components/ZPTable';

export default function EntityDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [entityType, setEntityType] = useState<'school' | 'msme'>('school');
  const [entityId, setEntityId] = useState<string>('');

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!isAuthenticated || !user || !entityId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await dashboardClient.getEntityDashboard(entityType, entityId, { userId: user.uid });
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Export ESG report
  const handleExportESG = async (format: 'pdf' | 'csv') => {
    try {
      const result = await dashboardClient.getEntityESGReport(entityType, entityId, format);
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.reportUrl;
      link.download = `esg-report-${entityType}-${entityId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message || 'Failed to export ESG report');
    }
  };

  // Export dashboard data
  const handleExportDashboard = async (format: 'csv' | 'pdf') => {
    try {
      const result = await dashboardClient.exportDashboardData('entity', format, { 
        entityType, 
        entityId, 
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
    if (entityId) {
      loadDashboardData();
    }
  }, [entityType, entityId, isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view entity dashboard</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (!entityId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Select Entity</h1>
          <p className="text-muted-foreground">Choose an entity to view its dashboard</p>
          
          <div className="space-y-4">
            <Select value={entityType} onValueChange={(value: 'school' | 'msme') => setEntityType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>School</span>
                  </div>
                </SelectItem>
                <SelectItem value="msme">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>MSME</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setEntityId('demo-entity-id')}>
              Load Demo Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading entity dashboard...</p>
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

  const entityIcon = entityType === 'school' ? GraduationCap : Building2;
  const EntityIcon = entityIcon;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <EntityIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold capitalize">{entityType} Dashboard</h1>
            <p className="text-muted-foreground">
              {entityType === 'school' ? 'Educational institution' : 'Micro, Small & Medium Enterprise'} analytics
            </p>
          </div>
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
                <div className="text-2xl font-bold">{dashboardData?.kpis?.totalUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.kpis?.activeUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.kpis?.totalCo2Saved?.toFixed(1) || 0}kg</div>
                <div className="text-sm text-muted-foreground">CO₂ Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.kpis?.ecoScore || 0}</div>
                <div className="text-sm text-muted-foreground">Eco Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="esg">ESG Report</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KPIs Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Key Performance Indicators</span>
                </CardTitle>
                <CardDescription>Entity performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData?.kpis?.totalUsers || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData?.kpis?.activeUsers || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Engagement Rate</span>
                      <span className="text-sm font-medium">
                        {dashboardData?.kpis?.engagement?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${dashboardData?.kpis?.engagement || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trends Card */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Entity performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ZPChart
                  type="line"
                  data={{
                    labels: dashboardData?.kpis?.trends?.map((item: any) => item.date) || [],
                    datasets: [{
                      label: 'Performance Score',
                      data: dashboardData?.kpis?.trends?.map((item: any) => item.value) || [],
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    }]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Entity Leaderboard</span>
              </CardTitle>
              <CardDescription>Top performers in your {entityType}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Select defaultValue="class">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class/Department</SelectItem>
                      <SelectItem value="unit">Unit/Team</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <ZPTable
                  data={dashboardData?.leaderboard?.leaderboard || []}
                  columns={[
                    { accessorKey: 'rank', header: 'Rank' },
                    { accessorKey: 'name', header: 'Name' },
                    { accessorKey: 'score', header: 'Score' },
                    { accessorKey: 'category', header: 'Category' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Activity Heatmap</CardTitle>
              <CardDescription>Most popular games and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dashboardData?.gameHeatmap?.heatmap || []).map((game: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">{game.gameName}</div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Plays:</span>
                        <span>{game.plays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Score:</span>
                        <span>{game.avgScore}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((game.plays / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ESG Report Tab */}
        <TabsContent value="esg" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ESG Report</CardTitle>
              <CardDescription>Environmental, Social, and Governance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Environmental</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>CO₂ Saved:</span>
                        <span className="font-medium">{dashboardData?.kpis?.totalCo2Saved?.toFixed(1)}kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy Reduced:</span>
                        <span className="font-medium">0 kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Waste Reduced:</span>
                        <span className="font-medium">0 kg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Social</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Users Engaged:</span>
                        <span className="font-medium">{dashboardData?.kpis?.totalUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Community Impact:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Education Hours:</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Governance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Compliance Score:</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transparency:</span>
                        <span className="font-medium">90%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accountability:</span>
                        <span className="font-medium">88%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={() => handleExportESG('pdf')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF Report
                  </Button>
                  <Button onClick={() => handleExportESG('csv')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
