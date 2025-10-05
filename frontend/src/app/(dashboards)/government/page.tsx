/**
 * Government Dashboard Page
 * Displays ward selector, geo heatmap, KPIs, and scenario simulations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  TrendingUp, 
  Leaf, 
  Users,
  BarChart3,
  Download,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Play,
  Settings
} from 'lucide-react';
import { dashboardClient } from '@/lib/dashboardClient';
import { useAuth } from '@/hooks/useAuth';
import { ZPChart } from '@/components/ZPChart';
import { ZPTable } from '@/components/ZPTable';

export default function GovernmentDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [simulationRunning, setSimulationRunning] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await dashboardClient.getGovernmentDashboard({ 
        userId: user.uid,
        wardId: selectedWard 
      });
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Run scenario simulation
  const handleRunSimulation = async (scenarioId: string) => {
    setSimulationRunning(true);
    try {
      const result = await dashboardClient.runScenarioSimulation(scenarioId, {
        wardId: selectedWard,
        parameters: {
          population: 10000,
          budget: 1000000,
          timeframe: '12 months'
        }
      });
      
      // Refresh dashboard data to show new simulation
      await loadDashboardData();
      
      // Show success message
      alert(`Simulation completed! Results: ${JSON.stringify(result.results)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to run simulation');
    } finally {
      setSimulationRunning(false);
    }
  };

  // Export dashboard data
  const handleExportDashboard = async (format: 'csv' | 'pdf') => {
    try {
      const result = await dashboardClient.exportDashboardData('government', format, { 
        wardId: selectedWard,
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
  }, [selectedWard, isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view government dashboard</h1>
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
          <p>Loading government dashboard...</p>
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
          <h1 className="text-3xl font-bold">Government Dashboard</h1>
          <p className="text-muted-foreground">
            City-wide sustainability and citizen engagement analytics
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

      {/* Ward Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Ward Selection</span>
          </CardTitle>
          <CardDescription>Select a ward to view detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Wards</SelectItem>
                {(dashboardData?.wardSelector?.wards || []).map((ward: any) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.name} ({ward.population} residents)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedWard && (
              <Badge variant="outline">
                {dashboardData?.wardSelector?.wards?.find((w: any) => w.id === selectedWard)?.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.kpis?.adoptionRate?.toFixed(1) || 0}%</div>
                <div className="text-sm text-muted-foreground">Adoption Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.kpis?.ecoMindScore?.toFixed(1) || 0}</div>
                <div className="text-sm text-muted-foreground">EcoMind Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.kpis?.activeUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                <CardDescription>City-wide sustainability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData?.kpis?.totalCo2Saved?.toFixed(1) || 0}kg
                      </div>
                      <div className="text-sm text-muted-foreground">Total CO₂ Saved</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData?.kpis?.adoptionRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Adoption Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Wards</span>
                      <span className="text-sm font-medium">{dashboardData?.kpis?.totalWards || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="text-sm font-medium">{dashboardData?.kpis?.activeUsers || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trends Card */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>City performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ZPChart
                  type="line"
                  data={{
                    labels: dashboardData?.kpis?.trends?.map((item: any) => item.date) || [],
                    datasets: [
                      {
                        label: 'CO₂ Saved (kg)',
                        data: dashboardData?.kpis?.trends?.map((item: any) => item.co2) || [],
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      },
                      {
                        label: 'Adoption Rate (%)',
                        data: dashboardData?.kpis?.trends?.map((item: any) => item.adoption) || [],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      }
                    ]
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

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Heatmap</CardTitle>
              <CardDescription>Ward-wise sustainability performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground">
                    Geographic visualization of ward performance would be displayed here
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Features: {dashboardData?.geoJson?.features?.length || 0} wards loaded
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(dashboardData?.geoJson?.features || []).slice(0, 6).map((feature: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">{feature.properties?.wardName || `Ward ${index + 1}`}</div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>CO₂ Saved:</span>
                          <span>{feature.properties?.co2Saved?.toFixed(1) || 0}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Eco Score:</span>
                          <span>{feature.properties?.ecoScore || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adoption:</span>
                          <span>{feature.properties?.adoptionRate?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Scenario Simulations</span>
              </CardTitle>
              <CardDescription>Test different policy scenarios and their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(dashboardData?.scenarios?.scenarios || []).map((scenario: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">{scenario.name}</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {scenario.description}
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{new Date(scenario.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="outline">Ready</Badge>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => handleRunSimulation(scenario.id)}
                        disabled={simulationRunning}
                      >
                        {simulationRunning ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Simulation
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ward Performance</CardTitle>
                <CardDescription>Comparative analysis across wards</CardDescription>
              </CardHeader>
              <CardContent>
                <ZPTable
                  data={(dashboardData?.geoJson?.features || []).map((feature: any, index: number) => ({
                    ward: feature.properties?.wardName || `Ward ${index + 1}`,
                    co2Saved: feature.properties?.co2Saved?.toFixed(1) || 0,
                    ecoScore: feature.properties?.ecoScore || 0,
                    adoption: `${feature.properties?.adoptionRate?.toFixed(1) || 0}%`,
                    population: feature.properties?.population || 0,
                  }))}
                  columns={[
                    { accessorKey: 'ward', header: 'Ward' },
                    { accessorKey: 'co2Saved', header: 'CO₂ Saved (kg)' },
                    { accessorKey: 'ecoScore', header: 'Eco Score' },
                    { accessorKey: 'adoption', header: 'Adoption Rate' },
                    { accessorKey: 'population', header: 'Population' },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>City-wide Trends</CardTitle>
                <CardDescription>Overall city performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {dashboardData?.kpis?.totalCo2Saved?.toFixed(1) || 0}kg
                    </div>
                    <div className="text-sm text-muted-foreground">Total CO₂ Saved</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {dashboardData?.kpis?.adoptionRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Adoption Rate</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        {dashboardData?.kpis?.ecoMindScore?.toFixed(1) || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">EcoMind Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
