'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth';
import { AdminDashboard } from '@/components/layouts/AdminDashboard';
import { CitizenDashboard } from '@/components/layouts/CitizenDashboard';
import { GovernmentDashboard } from '@/components/layouts/GovernmentDashboard';
import { EntityDashboard } from '@/components/layouts/EntityDashboard';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { Loader2 } from 'lucide-react';

// Empty data structures for dashboards - replace with API calls in production
const emptyAdminData = {
  systemMetrics: {
    serverUptime: 0,
    apiResponseTime: 0,
    databasePerformance: 0,
    errorRate: 0,
    activeConnections: 0,
    storageUsage: 0,
    systemHealth: 0,
    totalUsers: 0,
  },
  userStats: {
    newUsersToday: 0,
    activeUsersToday: 0,
    retentionRate: 0,
    avgSessionDuration: 0,
  },
  financialMetrics: {
    totalHealCoinsCirculating: 0,
    dailyTransactionVolume: 0,
    revenueToday: 0,
    monthlyGrowth: 0,
  },
  topOrganizations: [],
  recentAlerts: [],
  userActivity: [],
};

const emptyGovernmentData = {
  cityMetrics: {
    totalCarbonReduction: 0,
    airQualityIndex: 0,
    greenSpacePercentage: 0,
    renewableEnergyPercentage: 0,
    wasteRecyclingRate: 0,
    publicTransportUsage: 0,
  },
  districts: [],
  policies: [],
  topDistricts: [],
  recentActivities: [],
};

const emptyCitizenData = {
  carbonFootprint: 0,
  mentalHealthScore: 0,
  animalWelfareScore: 0,
  treesPlanted: 0,
  wasteRecycled: 0,
  carbonSaved: 0,
  monthlyEarnings: 0,
  friends: 0,
  localRank: 0,
  challengesWon: 0,
  recentActivities: [],
  leaderboard: [],
  challenges: [],
};

export function DashboardRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Loading state
  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Production mode - authenticated users only

  // Not authenticated - show login page
  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center'>
        <div className='max-w-md w-full mx-auto'>
          <ZPCard className='p-8 text-center'>
            <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-white font-bold text-2xl'>Z</span>
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Welcome to ZeroPrint</h1>
            <p className='text-gray-600 mb-6'>Sign in to access your sustainability dashboard</p>
            <div className='space-y-3'>
              <ZPButton
                variant='primary'
                className='w-full'
                onClick={() => router.push('/auth/login')}
              >
                Sign In
              </ZPButton>
              <ZPButton
                variant='outline'
                className='w-full'
                onClick={() => router.push('/auth/signup')}
              >
                Create Account
              </ZPButton>
            </div>
          </ZPCard>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return (
        <AdminDashboard
          user={{
            id: user.userId,
            displayName: user.displayName,
            email: user.email,
            role: 'admin',
          }}
          data={emptyAdminData}
        />
      );

    case 'govt':
      return (
        <GovernmentDashboard
          user={{ id: user.userId, displayName: user.displayName, email: user.email, role: 'govt' }}
          data={emptyGovernmentData}
        />
      );

    case 'citizen':
      return (
        <CitizenDashboard
          user={{
            displayName: user.displayName || 'Citizen',
            walletAddress: undefined,
            ecoScore: 0,
            healCoins: 0,
            rank: 0,
          }}
          data={emptyCitizenData}
        />
      );

    case 'school':
      return <EntityDashboard entityType="school" />;
    case 'msme':
      return <EntityDashboard entityType="msme" />;

    default:
      return (
        <CitizenDashboard
          user={{
            displayName: user.displayName || 'Citizen',
            walletAddress: undefined,
            ecoScore: 0,
            healCoins: 0,
            rank: 0,
          }}
          data={emptyCitizenData}
        />
      );
  }
}
