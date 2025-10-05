'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { Users, Trophy, Activity, Download, AlertCircle, Clock } from 'lucide-react';
import { MiniLineChart } from '@/components/ui/MiniLineChart';

export const EnhancedCitizenDashboard: React.FC = () => {
  const mock = {
    totals: { citizens: 12450, activeWeek: 8230, avgScore: 72 },
    top: [
      { id: 'c1', name: 'Alex Johnson', score: 98 },
      { id: 'c2', name: 'Maria Garcia', score: 95 },
      { id: 'c3', name: 'David Kim', score: 92 },
    ],
    activities: [
      { id: 'a1', action: 'Completed Carbon Challenge', user: 'Alex Johnson', points: '+50 pts' },
      { id: 'a2', action: 'Recycled 10kg Waste', user: 'Maria Garcia', points: '+30 pts' },
      { id: 'a3', action: 'Used Public Transport', user: 'David Kim', points: '+25 pts' },
    ],
    alerts: [
      { id: 's1', type: 'engagement', message: 'Engagement down in Ward 7 this week', severity: 'medium' },
    ],
  };

  const sevIcon = (sev: string) => sev === 'medium' ? <AlertCircle className="h-4 w-4 text-yellow-500" /> : <Clock className="h-4 w-4 text-blue-500" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      <div className="container mx-auto p-6 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Citizen Oversight Dashboard</h1>
          <p className="text-gray-600">Manage and monitor citizen engagement and activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ZPCard className="border-indigo-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Citizens</p>
                <p className="text-2xl font-bold text-gray-900">{mock.totals.citizens}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full"><Users className="h-6 w-6 text-indigo-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[10000, 11000, 11500, 11800, 12200, 12450]} width={260} height={56} stroke="#6366F1" /></div>
          </ZPCard>
          <ZPCard className="border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active This Week</p>
                <p className="text-2xl font-bold text-gray-900">{mock.totals.activeWeek}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full"><Activity className="h-6 w-6 text-blue-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[7000, 7600, 7900, 8100, 8200, 8230]} width={260} height={56} stroke="#3B82F6" /></div>
          </ZPCard>
          <ZPCard className="border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Eco Score</p>
                <p className="text-2xl font-bold text-gray-900">{mock.totals.avgScore}/100</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full"><Trophy className="h-6 w-6 text-green-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[68, 69, 70, 71, 72, 72]} width={260} height={56} stroke="#10B981" /></div>
          </ZPCard>
          <ZPCard className="border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Exported</p>
                <p className="text-2xl font-bold text-gray-900">54</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full"><Download className="h-6 w-6 text-purple-600" /></div>
            </div>
            <div className="mt-3"><MiniLineChart data={[20, 28, 35, 41, 49, 54]} width={260} height={56} stroke="#8B5CF6" /></div>
          </ZPCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZPCard title="Top Performing Citizens" description="Leading sustainability champions" className="border-gray-100">
            <div className="space-y-4">
              {mock.top.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <ZPBadge variant="success" className="px-3 py-1 text-lg font-bold">{c.score}</ZPBadge>
                </div>
              ))}
            </div>
          </ZPCard>

          <ZPCard title="Recent Citizen Activities" description="Latest user actions" className="border-gray-100">
            <div className="space-y-4">
              {mock.activities.map(a => (
                <div key={a.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">{a.action}</span>
                    <span className="text-indigo-700 font-semibold">{a.points}</span>
                  </div>
                  <div className="text-xs text-gray-500">{a.user}</div>
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


