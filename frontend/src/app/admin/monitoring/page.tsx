/**
 * Admin Monitoring Page
 * System health and performance monitoring dashboard
 */

'use client';

import React from 'react';
import { MonitoringDashboard } from '@/components/ui/MonitoringDashboard';

export default function AdminMonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <MonitoringDashboard />
    </div>
  );
}
