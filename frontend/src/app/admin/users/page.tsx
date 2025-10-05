'use client';

import React from 'react';
import { UserManagementDashboard } from '@/components/ui/UserManagementDashboard';

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserManagementDashboard />
    </div>
  );
}