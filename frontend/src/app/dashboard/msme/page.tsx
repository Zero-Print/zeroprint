'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function MSMEDashboardPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'msme') {
    redirect('/dashboard');
  }

  // Redirect to entity dashboard which handles MSME users
  redirect('/dashboard/entity');
}