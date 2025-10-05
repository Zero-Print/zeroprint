'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GovernmentDashboard } from '@/components/layouts';
import { redirect } from 'next/navigation';

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

  // Role-specific styling
  const roleStyles = {
    gradient: 'from-blue-600 to-cyan-600',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    card: 'bg-white border border-blue-100 shadow-sm',
    button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
  };

  // Mock government data - in real app this would come from API/Firestore
  const governmentData = {
    cityMetrics: {
      totalCarbonReduction: 15750.8,
      airQualityIndex: 78,
      greenSpacePercentage: 32,
      renewableEnergyPercentage: 45,
      wasteRecyclingRate: 68,
      publicTransportUsage: 52,
    },
    districts: [
      { id: 'ward-1', name: 'Central Ward', population: 15000, ecoScore: 78, carbonReduction: 2100, participationRate: 72 },
      { id: 'ward-2', name: 'North Ward', population: 12000, ecoScore: 75, carbonReduction: 1850, participationRate: 68 },
      { id: 'ward-3', name: 'South Ward', population: 18000, ecoScore: 69, carbonReduction: 2400, participationRate: 65 },
    ],
    policies: [
      { id: '1', title: 'Solar Panel Incentive Program', description: 'Incentives for residential and commercial solar panel installations', status: 'active' as const, impact: 85, citizenSupport: 78, implementationDate: new Date('2024-01-15') },
      { id: '2', title: 'Waste Segregation Mandate', description: 'Mandatory waste segregation for all households and businesses', status: 'active' as const, impact: 72, citizenSupport: 65, implementationDate: new Date('2024-02-01') },
      { id: '3', title: 'EV Charging Infrastructure', description: 'Development of public EV charging stations', status: 'draft' as const, impact: 90, citizenSupport: 82, implementationDate: new Date('2024-03-01') },
    ],
    topDistricts: [
      { id: 'ward-1', name: 'Central Ward', score: 85, rank: 1, category: 'overall' as const, change: 5 },
      { id: 'ward-3', name: 'South Ward', score: 78, rank: 2, category: 'carbon' as const, change: 3 },
      { id: 'ward-2', name: 'North Ward', score: 72, rank: 3, category: 'mental' as const, change: -1 },
    ],
    recentActivities: [
      { action: 'Policy implementation started', user: 'Gov Admin', impact: 'High', timestamp: new Date(), userType: 'government' as const },
      { action: 'New citizen registrations', user: 'System', impact: 'Medium', timestamp: new Date(), userType: 'government' as const },
      { action: 'Ward performance update', user: 'Analytics', impact: 'Low', timestamp: new Date(), userType: 'government' as const },
    ],
  };

  const mockUser = {
    id: (user as any).userId || 'demo-gov-1',
    displayName: (user as any).displayName || 'Demo Government',
    email: (user as any).email || 'gov@example.com',
    role: 'govt',
    department: 'Environmental Affairs',
    level: 'municipal' as const,
    healCoins: (user as any).healCoins ?? 0, // Government users don't earn coins
  };
  return <GovernmentDashboard user={mockUser} data={governmentData} />;
}