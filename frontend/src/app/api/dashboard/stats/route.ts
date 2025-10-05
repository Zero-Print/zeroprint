import { NextResponse } from 'next/server';

export async function GET() {
  // Mock dashboard stats data
  const mockDashboardStats = {
    totalUsers: 5280,
    activeUsers: 1842,
    totalQueries: 28450,
    averageQueryTime: 0.85,
    storageUsed: {
      value: 1250,
      unit: 'GB',
      percentage: 62.5
    },
    costSavings: {
      value: 12580,
      currency: 'USD',
      period: 'month'
    },
    performance: {
      current: 92,
      previous: 87,
      change: 5.7
    },
    lastUpdated: new Date().toISOString()
  };

  return NextResponse.json(mockDashboardStats);
}