'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function IndividualDashboardPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'citizen') {
    redirect('/dashboard');
  }

  // Redirect to citizen dashboard which handles individual users
  redirect('/dashboard/citizen');
}