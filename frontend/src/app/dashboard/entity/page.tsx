'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import { EntityDashboard, MSMEDashboard } from '@/components/layouts';
import { redirect } from 'next/navigation';

export default function EntityDashboardPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'school' && userRole !== 'msme') {
    redirect('/dashboard');
  }

  // Mock entity data - in real app this would come from API/Firestore
  const entityData = {
    entityId: 'demo-entity-1',
    entityName: userRole === 'school' ? 'Green Valley High School' : 'EcoTech Manufacturing',
    entityType: userRole,
    totalMembers: userRole === 'school' ? 450 : 120,
    activeMembers: userRole === 'school' ? 380 : 95,
    totalCO2Saved: userRole === 'school' ? 1250.5 : 2450.8,
    totalHealCoins: userRole === 'school' ? 12500 : 8900,
    esgScore: userRole === 'msme' ? 78 : 0, // Ensure it's always a number
    monthlyGrowth: userRole === 'school' ? 12 : 8,
    departments: userRole === 'school' ? ['Science', 'Math', 'English', 'Arts'] : ['Production', 'R&D', 'Quality', 'Logistics'],
    
    recentActivities: [
      {
        id: '1',
        userId: 'user-1',
        userName: userRole === 'school' ? 'Alice Johnson' : 'John Smith',
        action: userRole === 'school' ? 'Completed Carbon Tracker Challenge' : 'Implemented Solar Panels',
        timestamp: new Date().toISOString(),
        impact: userRole === 'school' ? 25 : 150,
      },
      {
        id: '2',
        userId: 'user-2',
        userName: userRole === 'school' ? 'Bob Wilson' : 'Sarah Davis',
        action: userRole === 'school' ? 'Planted 5 Trees' : 'Reduced Waste by 20%',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        impact: userRole === 'school' ? 50 : 100,
      },
      {
        id: '3',
        userId: 'user-3',
        userName: userRole === 'school' ? 'Carol Davis' : 'Mike Johnson',
        action: userRole === 'school' ? 'Mental Health Advocate Badge' : 'Employee Wellness Program',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        impact: userRole === 'school' ? 30 : 75,
      },
    ],
    
    topPerformers: [
      { id: '1', name: userRole === 'school' ? 'Alice Johnson' : 'John Smith', score: 95, rank: 1, change: 5, department: userRole === 'school' ? 'Science' : 'Production' },
      { id: '2', name: userRole === 'school' ? 'Bob Wilson' : 'Sarah Davis', score: 92, rank: 2, change: 2, department: userRole === 'school' ? 'Math' : 'R&D' },
      { id: '3', name: userRole === 'school' ? 'Carol Davis' : 'Mike Johnson', score: 89, rank: 3, change: -1, department: userRole === 'school' ? 'English' : 'Quality' },
      { id: '4', name: userRole === 'school' ? 'David Lee' : 'Emma Wilson', score: 87, rank: 4, change: 3, department: userRole === 'school' ? 'Arts' : 'Logistics' },
      { id: '5', name: userRole === 'school' ? 'Emma Garcia' : 'Robert Brown', score: 85, rank: 5, change: 0, department: userRole === 'school' ? 'Science' : 'Production' },
    ],
    
    challenges: [
      {
        id: '1',
        title: userRole === 'school' ? 'Plastic-Free Week Challenge' : 'Zero Waste Initiative',
        description: userRole === 'school' ? 'Eliminate single-use plastics for one week' : 'Achieve zero waste to landfill',
        participants: userRole === 'school' ? 8 : 4,
        endDate: new Date(Date.now() + 604800000).toISOString(),
        reward: userRole === 'school' ? 500 : 1000,
        status: 'active' as const,
      },
      {
        id: '2',
        title: userRole === 'school' ? 'Tree Planting Initiative' : 'Carbon Neutral Goal',
        description: userRole === 'school' ? 'Plant 100 trees around the school campus' : 'Achieve carbon neutrality by 2025',
        participants: userRole === 'school' ? 12 : 6,
        endDate: new Date(Date.now() + 1209600000).toISOString(),
        reward: userRole === 'school' ? 1000 : 2000,
        status: 'active' as const,
      },
      {
        id: '3',
        title: userRole === 'school' ? 'Energy Conservation Week' : 'Renewable Energy Target',
        description: userRole === 'school' ? 'Reduce school energy consumption by 20%' : '50% renewable energy adoption',
        participants: userRole === 'school' ? 15 : 8,
        endDate: new Date(Date.now() + 2592000000).toISOString(),
        reward: userRole === 'school' ? 750 : 1500,
        status: 'active' as const,
      },
    ],
    
    // Entity-specific data
    sustainabilityMetrics: {
      energyConsumption: userRole === 'msme' ? 12500 : 0,
      wasteReduction: userRole === 'msme' ? 3500 : 0,
      waterUsage: userRole === 'msme' ? 85000 : 0,
      renewableEnergy: userRole === 'msme' ? 42 : 0,
    },
    financialMetrics: {
      revenue: userRole === 'msme' ? 25000000 : 0,
      costSavings: userRole === 'msme' ? 1250000 : 0,
      esgInvestment: userRole === 'msme' ? 750000 : 0,
      greenCertifications: userRole === 'msme' ? 8 : 0,
    },
    supplyChainMetrics: {
      sustainableSuppliers: userRole === 'msme' ? 72 : 0,
      localSourcing: userRole === 'msme' ? 65 : 0,
      carbonFootprint: userRole === 'msme' ? 12500 : 0,
      ethicalCompliance: userRole === 'msme' ? 92 : 0,
    },
    employeeMetrics: {
      trainingHours: userRole === 'msme' ? 1250 : 0,
      wellnessPrograms: userRole === 'msme' ? 6 : 0,
      diversityScore: userRole === 'msme' ? 85 : 0,
      retentionRate: userRole === 'msme' ? 88 : 0,
    },
    
    // Advanced MSME metrics
    kpiMetrics: {
      healCoins30Days: userRole === 'msme' ? 12500 : 0,
      totalCO2SavedTons: userRole === 'msme' ? 5.2 : 0,
      wasteDivertedPercent: userRole === 'msme' ? 85 : 0,
      activeEmployees: userRole === 'msme' ? 95 : 0,
      esgScoreAggregate: userRole === 'msme' ? 78 : 0,
    },
    
    ecoActionTracker: {
      energyConsumption: userRole === 'msme' ? [
        { date: '2025-09-01', grid: 1200, solar: 300 },
        { date: '2025-09-02', grid: 1100, solar: 350 },
        { date: '2025-09-03', grid: 1050, solar: 400 },
        { date: '2025-09-04', grid: 1150, solar: 380 },
        { date: '2025-09-05', grid: 1000, solar: 420 },
      ] : [],
      wasteSegregation: userRole === 'msme' ? [
        { date: '2025-09-01', segregated: 85, total: 100 },
        { date: '2025-09-02', segregated: 88, total: 100 },
        { date: '2025-09-03', segregated: 90, total: 100 },
        { date: '2025-09-04', segregated: 87, total: 100 },
        { date: '2025-09-05', segregated: 92, total: 100 },
      ] : [],
      transportFootprint: userRole === 'msme' ? [
        { date: '2025-09-01', evAdoption: 42, carpooling: 15 },
        { date: '2025-09-02', evAdoption: 44, carpooling: 16 },
        { date: '2025-09-03', evAdoption: 45, carpooling: 17 },
        { date: '2025-09-04', evAdoption: 43, carpooling: 16 },
        { date: '2025-09-05', evAdoption: 46, carpooling: 18 },
      ] : [],
    },
    
    gamesEngagement: userRole === 'msme' ? [
      { gameName: 'Carbon Footprint Challenge', averageScore: 85, correlation: 'Employees who played showed 25% better waste segregation rates' },
      { gameName: 'Waste Warrior', averageScore: 78, correlation: 'Players reduced waste by 20% on average' },
      { gameName: 'Energy Efficiency Master', averageScore: 92, correlation: 'Energy consumption reduced by 12%' },
      { gameName: 'Water Conservation Quest', averageScore: 76, correlation: 'Water usage decreased by 8%' },
      { gameName: 'Green Transport Guru', averageScore: 88, correlation: '18% more employees using sustainable transport' },
    ] : [],
    
    marketplace: {
      availableCoins: userRole === 'msme' ? 8900 : 0,
      recentRedemptions: userRole === 'msme' ? [
        { id: '1', item: 'Steel Water Bottles (Pack of 50)', coins: 2500, date: '2025-09-15' },
        { id: '2', item: 'Tree Planting Credits (1000 saplings)', coins: 10000, date: '2025-09-10' },
        { id: '3', item: 'EV Charging Vouchers (50 x $10)', coins: 5000, date: '2025-09-05' },
      ] : [],
    },
  };

  const mockUser = {
    id: 'demo-user-1',
    displayName: (user as any).displayName || (userRole === 'school' ? 'Green Valley High School' : 'EcoTech Manufacturing'),
    email: (user as any).email || 'demo@entity.com',
    role: userRole as 'school' | 'msme',
    entityId: 'demo-entity-1',
    entityName: userRole === 'school' ? 'Green Valley High School' : 'EcoTech Manufacturing',
    department: userRole === 'school' ? 'Administration' : 'Management',
    joinedAt: new Date().toISOString(),
    isActive: true,
    ecoScore: userRole === 'school' ? 78.5 : 82.3,
    healCoins: userRole === 'school' ? 12500 : 8900,
    lastActivity: new Date().toISOString(),
  };

  // Render the appropriate dashboard based on user role
  if (userRole === 'msme') {
    // Create MSME-specific user object
    const msmeUser = {
      ...mockUser,
      role: 'msme' as const
    };
    return <MSMEDashboard user={msmeUser} data={entityData} />;
  }

  return <EntityDashboard user={mockUser} data={entityData} />;
}