'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import { AdminDashboard } from '@/components/layouts';
import { redirect } from 'next/navigation';

export default function AdminConsolePage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'admin') {
    redirect('/dashboard');
  }

  // Mock admin data - in real app this would come from API/Firestore
  const adminData = {
    systemMetrics: {
      serverUptime: 99.8,
      apiResponseTime: 120,
      databasePerformance: 95,
      errorRate: 0.02,
      activeConnections: 45,
      storageUsage: 78,
      systemHealth: 98,
      totalUsers: 125000,
    },
    userStats: {
      newUsersToday: 1250,
      activeUsersToday: 89500,
      retentionRate: 85,
      avgSessionDuration: 12,
    },
    financialMetrics: {
      totalHealCoinsCirculating: 15750000,
      dailyTransactionVolume: 2450000,
      revenueToday: 0,
      monthlyGrowth: 12.5,
    },
    topOrganizations: [
      { id: '1', name: 'Green Valley High School', score: 95, rank: 1, category: 'school' as const, change: 5 },
      { id: '2', name: 'EcoTech Manufacturing', score: 92, rank: 2, category: 'enterprise' as const, change: 2 },
      { id: '3', name: 'Mumbai Municipal Corporation', score: 89, rank: 3, category: 'government' as const, change: -1 },
      { id: '4', name: 'Delhi Green Initiative', score: 87, rank: 4, category: 'ngo' as const, change: 3 },
      { id: '5', name: 'Bangalore Sustainability Corp', score: 85, rank: 5, category: 'enterprise' as const, change: 0 },
    ],
    recentAlerts: [
      { id: '1', type: 'performance' as const, message: 'High API response time detected', severity: 'medium' as const, timestamp: new Date(), resolved: false },
      { id: '2', type: 'system' as const, message: 'Scheduled backup completed successfully', severity: 'low' as const, timestamp: new Date(), resolved: true },
      { id: '3', type: 'user' as const, message: 'Payment webhook failure for transaction #12345', severity: 'high' as const, timestamp: new Date(), resolved: false },
      { id: '4', type: 'security' as const, message: 'Unusual login activity detected', severity: 'high' as const, timestamp: new Date(), resolved: false },
      { id: '5', type: 'performance' as const, message: 'Database query optimization completed', severity: 'low' as const, timestamp: new Date(), resolved: true },
    ],
    userActivity: [
      { action: 'Completed Carbon Tracker', user: 'Alice Johnson', impact: 'High', timestamp: new Date(), userType: 'citizen' as const },
      { action: 'Joined School Challenge', user: 'Green Valley High', impact: 'Medium', timestamp: new Date(), userType: 'school' as const },
      { action: 'Policy Implementation', user: 'Mumbai Corp', impact: 'High', timestamp: new Date(), userType: 'government' as const },
      { action: 'New User Registration', user: 'System', impact: 'Low', timestamp: new Date(), userType: 'admin' as const },
      { action: 'Wallet Transaction', user: 'Bob Wilson', impact: 'Medium', timestamp: new Date(), userType: 'citizen' as const },
    ],
  };

  const mockUser = {
    id: (user as any).userId || 'admin-1',
    displayName: (user as any).displayName || 'System Administrator',
    email: (user as any).email || 'admin@zeroprint.com',
    role: 'admin' as const,
    healCoins: 0, // Admin users don't earn coins
  };

  // Add extra safety checks for the data
  const safeAdminData = {
    ...adminData,
    systemMetrics: adminData.systemMetrics || {},
    userStats: adminData.userStats || {},
    financialMetrics: adminData.financialMetrics || {},
    topOrganizations: Array.isArray(adminData.topOrganizations) ? adminData.topOrganizations : [],
    recentAlerts: Array.isArray(adminData.recentAlerts) ? adminData.recentAlerts : [],
    userActivity: Array.isArray(adminData.userActivity) ? adminData.userActivity : [],
  };

  return <AdminDashboard user={mockUser} data={safeAdminData} />;
}