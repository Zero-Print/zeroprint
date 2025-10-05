/**
 * Citizen Dashboard Page
 * Displays wallet, eco score, trends, digital twin, activity, and leaderboards
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  Leaf, 
  Brain, 
  Activity, 
  Trophy,
  Coins,
  Download,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { dashboardClient } from '@/lib/dashboardClient';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { ZPChart } from '@/components/ZPChart';
import { ZPTable } from '@/components/ZPTable';

export default function CitizenDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await dashboardClient.getCitizenDashboard({ userId: user.uid });
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Export dashboard data
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const result = await dashboardClient.exportDashboardData('citizen', format, { userId: user?.uid });
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
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
          <p>Loading your dashboard...</p>
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
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.displayName || user?.email}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('pdf')} variant="outline" size="sm">
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
              <Wallet className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{wallet?.healCoins || 0}</div>
                <div className="text-sm text-muted-foreground">HealCoins</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData?.ecoScore?.current || 0}</div>
                <div className="text-sm text-muted-foreground">Eco Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {dashboardData?.trends?.carbon?.reduce((sum: number, item: any) => sum + item.value, 0).toFixed(1) || 0}kg
                </div>
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
                <div className="text-2xl font-bold">
                  {dashboardData?.leaderboards?.global?.find((item: any) => item.userId === user?.uid)?.rank || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Global Rank</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="digital-twin">Digital Twin</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>Wallet</span>
                </CardTitle>
                <CardDescription>Your current balance and recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">HealCoins</span>
                    <span className="text-2xl font-bold">{wallet?.healCoins || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">INR Balance</span>
                    <span className="text-2xl font-bold">₹{wallet?.inrBalance || 0}</span>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-semibold mb-2">Recent Transactions</h4>
                    <div className="space-y-2">
                      {(dashboardData?.wallet?.recentTransactions || []).slice(0, 5).map((tx: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{tx.type}</span>
                          <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eco Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5" />
                  <span>Eco Score</span>
                </CardTitle>
                <CardDescription>Your environmental impact score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {dashboardData?.ecoScore?.current || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">out of 100</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Carbon Impact</span>
                      <span>{dashboardData?.ecoScore?.breakdown?.carbon || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mood Score</span>
                      <span>{dashboardData?.ecoScore?.breakdown?.mood || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kindness Index</span>
                      <span>{dashboardData?.ecoScore?.breakdown?.kindness || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Digital Twin</span>
                      <span>{dashboardData?.ecoScore?.breakdown?.digitalTwin || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CO₂ Savings Trend</CardTitle>
                <CardDescription>Your carbon footprint reduction over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ZPChart
                  type="line"
                  data={{
                    labels: dashboardData?.trends?.carbon?.map((item: any) => item.date) || [],
                    datasets: [{
                      label: 'CO₂ Saved (kg)',
                      data: dashboardData?.trends?.carbon?.map((item: any) => item.value) || [],
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
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

            <Card>
              <CardHeader>
                <CardTitle>Mood & Kindness Trends</CardTitle>
                <CardDescription>Your well-being and kindness scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ZPChart
                  type="line"
                  data={{
                    labels: dashboardData?.trends?.mood?.map((item: any) => item.date) || [],
                    datasets: [
                      {
                        label: 'Mood Score',
                        data: dashboardData?.trends?.mood?.map((item: any) => item.value) || [],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      },
                      {
                        label: 'Kindness Index',
                        data: dashboardData?.trends?.kindness?.map((item: any) => item.value) || [],
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Digital Twin Tab */}
        <TabsContent value="digital-twin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Digital Twin</span>
              </CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData?.digitalTwin?.current && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Current Simulation</h4>
                    <p className="text-sm text-muted-foreground">
                      {dashboardData.digitalTwin.current.name}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-4">Recommendations</h4>
                  <div className="space-y-2">
                    {(dashboardData?.digitalTwin?.recommendations || []).map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Recent Simulations</h4>
                  <div className="space-y-2">
                    {(dashboardData?.digitalTwin?.simulations || []).map((sim: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium">{sim.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sim.result ? 'Completed' : 'In Progress'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your recent actions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <ZPTable
                data={dashboardData?.activities?.activities || []}
                columns={[
                  { accessorKey: 'type', header: 'Type' },
                  { accessorKey: 'description', header: 'Description' },
                  { accessorKey: 'coinsEarned', header: 'Coins Earned' },
                  { accessorKey: 'timestamp', header: 'Date' },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Leaderboard</CardTitle>
                <CardDescription>Top performers worldwide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(dashboardData?.leaderboards?.global || []).map((player: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Badge variant={index < 3 ? 'default' : 'secondary'}>
                          {player.rank}
                        </Badge>
                        <span className="text-sm">{player.name}</span>
                      </div>
                      <span className="text-sm font-medium">{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Friends Leaderboard</CardTitle>
                <CardDescription>Your friends and connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No friends yet</p>
                  <p className="text-sm">Connect with others to see their progress</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Local Leaderboard</CardTitle>
                <CardDescription>Top performers in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No local data</p>
                  <p className="text-sm">Location data not available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
