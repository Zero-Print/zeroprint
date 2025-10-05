'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { School, Users, TrendingUp, Download, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MiniLineChart } from '@/components/ui/MiniLineChart';

export const EnhancedSchoolDashboard: React.FC = () => {
  const mock = {
    totals: { schools: 320, active: 285, avgScore: 84, reports: 72 },
    top: [
      { id: 's1', name: 'Green Valley High', score: 96 },
      { id: 's2', name: 'Eco Elementary', score: 93 },
      { id: 's3', name: 'Sustainable Academy', score: 91 },
    ],
    activities: [
      { id: 'a1', action: 'Launched Tree Planting Drive', school: 'Green Valley High', impact: '+200 kg CO₂' },
      { id: 'a2', action: 'Implemented Recycling Program', school: 'Eco Elementary', impact: '+150 kg CO₂' },
      { id: 'a3', action: 'Installed Solar Panels', school: 'Sustainable Academy', impact: '+300 kg CO₂' },
    ],
    alerts: [
      { id: 'al1', type: 'compliance', message: '2 schools pending safety compliance', severity: 'medium' },
    ],
  };

  const sevIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      <div className="container mx-auto p-6 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">School Oversight Dashboard</h1>
          <p className="text-gray-600">Manage and monitor school sustainability programs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ZPCard className="border-orange-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Schools</p>
                <p className="text-2xl font-bold text-gray-900">{mock.totals.schools}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full"><School className="h-6 w-6 text-orange-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[280, 290, 300, 305, 312, 320]} width={260} height={56} stroke="#F97316" /></div>
          </ZPCard>
          <ZPCard className="border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Schools</p>
                <p className="text-2xl font-bold text-gray-900">{mock.totals.active}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full"><Users className="h-6 w-6 text-blue-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[250, 258, 266, 270, 280, 285]} width={260} height={56} stroke="#3B82F6" /></div>
          </ZPCard>
          <ZPCard className="border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Eco Score</p>
                <p className="text-2xl font-bold text-gray-900">{mock.totals.avgScore}/100</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full"><TrendingUp className="h-6 w-6 text-green-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[78, 80, 81, 82, 83, 84]} width={260} height={56} stroke="#10B981" /></div>
          </ZPCard>
          <ZPCard className="border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Exported</p>
                <p className="text-2xl font-bold text-gray-900">{mock.totals.reports}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full"><Download className="h-6 w-6 text-purple-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[40, 48, 53, 57, 65, 72]} width={260} height={56} stroke="#8B5CF6" /></div>
          </ZPCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZPCard title="Top Performing Schools" description="Leading educational institutions" className="border-gray-100">
            <div className="space-y-4">
              {mock.top.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="font-medium text-gray-900">{s.name}</div>
                  <ZPBadge variant="success" className="px-3 py-1 text-lg font-bold">{s.score}</ZPBadge>
                </div>
              ))}
            </div>
          </ZPCard>

          <ZPCard title="Recent School Activities" description="Latest educational initiatives" className="border-gray-100">
            <div className="space-y-4">
              {mock.activities.map(a => (
                <div key={a.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">{a.action}</span>
                    <span className="text-orange-700 font-semibold">{a.impact}</span>
                  </div>
                  <div className="text-xs text-gray-500">{a.school}</div>
                </div>
              ))}
            </div>
          </ZPCard>
        </div>

        <ZPCard title="System Alerts" description="Important notifications requiring attention" className="border-gray-100">
          <div className="space-y-4">
            {mock.alerts.map(al => (
              <div key={al.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="mr-3 mt-0.5">{sevIcon(al.severity)}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{al.message}</h4>
                  <div className="text-xs text-gray-500 capitalize">{al.type} alert</div>
                </div>
              </div>
            ))}
          </div>
        </ZPCard>
      </div>
    </div>
  );
};


