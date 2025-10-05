'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth';
import { CitizenDashboard } from '@/components/layouts';
import { redirect } from 'next/navigation';
import { fetchDashboardData } from '@/lib/services/dashboardClient';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'citizen') {
    redirect('/dashboard');
  }

  // Role-specific styling
  const roleStyles = {
    gradient: 'from-green-600 to-blue-600',
    bg: 'bg-gradient-to-br from-green-50 to-blue-50',
    text: 'text-green-600',
    border: 'border-green-200',
    card: 'bg-white border border-green-100 shadow-sm',
    button: 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch real citizen dashboard data from backend callable
        const data = await fetchDashboardData<'citizen'>('citizen', 'week');

        // Map backend response shape to CitizenDashboard component shape
        const carbonCurrent = (data as any)?.carbonFootprint?.current ?? 0;
        const carbonPrevious = (data as any)?.carbonFootprint?.previous ?? 0;
        const carbonSaved = Math.max(0, carbonPrevious - carbonCurrent);

        const healCoins = (data as any)?.healCoins ?? {};
        const activities = (data as any)?.activities ?? [];
        const leaderboard = (data as any)?.leaderboard ?? [];

        const citizenData = {
          // Real values from backend
          carbonFootprint: carbonCurrent,
          carbonSaved,
          monthlyEarnings: healCoins.earned ?? 0,
          recentActivities: activities.map((activity: any, idx: number) => ({
            action: activity.description ?? activity.type ?? `Activity ${idx + 1}`,
            points: activity.points ?? 0,
            date: activity.timestamp ? new Date(activity.timestamp) : new Date(),
          })),
          leaderboard: leaderboard.map((entry: any, idx: number) => ({
            id: entry.userId ?? String(idx + 1),
            name: entry.name ?? 'User',
            score: entry.points ?? 0,
            rank: (idx + 1),
            category: 'overall' as const,
            change: 0,
          })),

          // Temporary placeholders until real data sources are implemented
          mentalHealthScore: 0,
          animalWelfareScore: 0,
          treesPlanted: 0,
          wasteRecycled: 0,
          friends: 0,
          localRank: 0,
          challengesWon: 0,

          // Backward compatibility for existing UI sections
          energyConsumption: (data as any)?.energyConsumption?.current ?? 0,
          // Keep a minimal challenges array for UI stability
          challenges: [],
        };

        setDashboardData(citizenData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${roleStyles.bg}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${roleStyles.bg}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-red-100">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className={`px-4 py-2 text-white rounded-lg ${roleStyles.button} transition-all duration-200 transform hover:scale-105`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const citizenUser = {
    displayName: (user as any).displayName || 'Demo Citizen',
    role: 'citizen' as const,
    walletAddress: (user as any).walletAddress || '0x1234...5678',
    ecoScore: dashboardData?.carbonSaved ? Math.floor(dashboardData.carbonSaved * 0.36) : 0,
    healCoins: dashboardData?.monthlyEarnings ?? 0,
    rank: dashboardData?.localRank ?? 0,
  };

  return (
    <>
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ Some data may be outdated. {error}
          </p>
        </div>
      )}
      <CitizenDashboard user={citizenUser} data={dashboardData} />
    </>
  );
}
