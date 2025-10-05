'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/modules/auth';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      redirect('/auth/login');
      return;
    }

    const userRole = (user as any)?.role;
    
    // Role-based redirects as specified in requirements
    switch (userRole) {
      case 'citizen':
        redirect('/dashboard/citizen');
        break;
      case 'school':
        redirect('/dashboard/school');
        break;
      case 'msme':
        redirect('/dashboard/msme');
        break;
      case 'government':
      case 'govt':
        redirect('/dashboard/govt');
        break;
      case 'admin':
        redirect('/admin');
        break;
      default:
        redirect('/dashboard/citizen');
    }
  }, [user]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
