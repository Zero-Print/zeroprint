'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { useAuth } from '@/modules/auth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { loading } = useAuth();

  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && !loading && <Navbar />}
      {loading ? (
        <div className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        </div>
      ) : (
        <main className="py-8">
          {children}
        </main>
      )}
    </div>
  );
}