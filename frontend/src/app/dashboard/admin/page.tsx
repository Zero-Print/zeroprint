'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'admin') {
    redirect('/dashboard');
  }

  // Redirect to admin dashboard
  redirect('/admin');
}