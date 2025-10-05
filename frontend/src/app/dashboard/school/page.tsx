'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import { redirect } from 'next/navigation';
import EntityDashboard from '@/components/layouts/EntityDashboard';

export default function SchoolDashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'school') {
    redirect('/dashboard');
  }

  // Lightweight school-specific theming (colors, background)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-red-50">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                School Sustainability Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Track eco-performance across classes, departments, and initiatives
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-3 py-1">School</span>
              <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1">Education</span>
              <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-800 text-xs font-medium px-3 py-1">ESG</span>
            </div>
          </div>
        </header>

        {/* Card grid container with consistent gutters and responsive columns */}
        <section className="space-y-6">
          {/* Mount the shared entity dashboard which already renders school-specific data */}
          <EntityDashboard
            user={{
              id: 'school-demo-user',
              displayName: (user as any).displayName || 'Your School',
              email: (user as any).email || 'school@example.com',
              role: 'school',
              entityId: 'school-entity-demo',
              entityName: 'Your School',
              department: 'Administration',
              joinedAt: new Date().toISOString(),
              isActive: true,
              ecoScore: 78.5,
              healCoins: 12500,
              lastActivity: new Date().toISOString(),
            }}
            data={{
              entityId: 'school-entity-demo',
              entityName: 'Your School',
              entityType: 'school',
              totalMembers: 450,
              activeMembers: 380,
              totalCO2Saved: 1250.5,
              totalHealCoins: 12500,
              monthlyGrowth: 12,
              departments: ['Science', 'Math', 'English', 'Arts'],
              recentActivities: [],
              topPerformers: [],
              challenges: [],
            }}
            hideHeader
          />
        </section>
      </div>
    </div>
  );
}