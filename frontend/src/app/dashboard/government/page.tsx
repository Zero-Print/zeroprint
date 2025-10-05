'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { GovernmentDashboard } from '@/components/layouts';
import { redirect } from 'next/navigation';
import { fetchDashboardData } from '@/lib/services/dashboardClient';

export default function GovernmentDashboardPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'govt') {
    redirect('/dashboard');
  }

  // Data state
  const [govData, setGovData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGovernmentDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchDashboardData<'government'>('government', 'week');

        // Map backend response (cityStats, wardData, topPerformers, campaigns)
        // to GovernmentDashboard component expected shape
        const cityStats = (data as any)?.cityStats ?? {};
        const wardData = (data as any)?.wardData ?? [];
        const topPerformers = (data as any)?.topPerformers ?? {};
        const campaigns = (data as any)?.campaigns ?? [];

        const mappedData = {
          cityMetrics: {
            totalCarbonReduction: cityStats.carbonReduction ?? 0,
            airQualityIndex: 0, // Placeholder until backend provides AQI
            greenSpacePercentage: 0, // Placeholder
            renewableEnergyPercentage: 0, // Placeholder
            wasteRecyclingRate: 0, // Placeholder
            publicTransportUsage: 0, // Placeholder
          },
          districts: wardData.map((w: any) => ({
            id: w.wardId ?? w.id ?? 'unknown',
            name: w.name ?? 'Ward',
            population: 0, // Placeholder
            ecoScore: Math.round((w.carbonReduction ?? 0) / 100), // Naive derived score
            carbonReduction: w.carbonReduction ?? 0,
            participationRate: Math.round(((w.activeUsers ?? 0) / (cityStats.activeUsers || 1)) * 100),
          })),
          policies: campaigns.map((c: any) => ({
            id: c.id ?? 'policy',
            title: c.name ?? 'Campaign',
            description: `Participants: ${c.participants ?? 0}`,
            status: (c.status as 'draft' | 'active' | 'completed' | 'suspended') ?? 'active',
            impact: Math.round((c.carbonReduction ?? 0) / 10),
            citizenSupport: Math.min(100, Math.round(((c.participants ?? 0) / (cityStats.totalUsers || 1)) * 100)),
            implementationDate: new Date(),
          })),
          topDistricts: wardData
            .slice()
            .sort((a: any, b: any) => (b.carbonReduction ?? 0) - (a.carbonReduction ?? 0))
            .map((w: any, idx: number) => ({
              id: w.wardId ?? w.id ?? `ward-${idx + 1}`,
              name: w.name ?? `Ward ${idx + 1}`,
              score: Math.round((w.carbonReduction ?? 0) / 100),
              rank: idx + 1,
              category: 'overall' as const,
              change: 0,
            })),
          recentActivities: [
            // Create simple activity feed from top performers and campaigns
            ...((topPerformers.citizens ?? []).slice(0, 2).map((p: any) => ({
              action: 'Top citizen performer',
              user: p.name ?? 'Citizen',
              impact: 'Medium',
              timestamp: new Date(),
              userType: 'government' as const,
            }))),
            ...campaigns.slice(0, 2).map((c: any) => ({
              action: `Campaign update: ${c.name ?? 'Campaign'}`,
              user: 'System',
              impact: 'High',
              timestamp: new Date(),
              userType: 'government' as const,
            })),
          ],
        };

        setGovData(mappedData);
      } catch (err: any) {
        console.error('Failed to load government dashboard:', err);
        setError(err?.message ?? 'Failed to load government dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadGovernmentDashboard();
  }, []);

  // Role-specific styling (kept for future use)
  const roleStyles = {
    gradient: 'from-blue-600 to-cyan-600',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    card: 'bg-white border border-blue-100 shadow-sm',
    button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
  };

  const govUser = {
    id: (user as any).userId || 'demo-gov-1',
    displayName: (user as any).displayName || 'Government Official',
    email: (user as any).email || 'gov@example.com',
    role: 'govt',
    department: 'Environmental Affairs',
    level: 'municipal' as const,
    healCoins: (user as any).healCoins ?? 0,
  };

  if (isLoading && !govData) {
    return <div className="p-6">Loading government dashboard...</div>;
  }

  if (error && !govData) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return <GovernmentDashboard user={govUser} data={govData ?? { cityMetrics: { totalCarbonReduction: 0, airQualityIndex: 0, greenSpacePercentage: 0, renewableEnergyPercentage: 0, wasteRecyclingRate: 0, publicTransportUsage: 0 }, districts: [], policies: [], topDistricts: [], recentActivities: [] }} />;
}