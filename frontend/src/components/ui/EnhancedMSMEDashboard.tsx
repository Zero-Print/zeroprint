'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { BarChart3, Users, TrendingUp, Factory, Eye, Download, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MiniLineChart } from '@/components/ui/MiniLineChart';

interface EnhancedMSMEDashboardProps {
  user: {
    id: string;
    role: string;
    displayName?: string;
  };
}

export const EnhancedMSMEDashboard: React.FC<EnhancedMSMEDashboardProps> = ({ user }) => {
  const mock = {
    overview: {
      total: 142,
      active: 128,
      avgESG: 78,
      compliance: 88,
    },
    top: [
      { id: 'm1', name: 'EcoTech Manufacturing', score: 95 },
      { id: 'm2', name: 'Green Solutions Ltd.', score: 92 },
      { id: 'm3', name: 'Sustainable Industries', score: 89 },
    ],
    activities: [
      { id: 'a1', action: 'Implemented Solar Panels', org: 'EcoTech Manufacturing', impact: '+150 kg CO₂', at: new Date('2024-03-14') },
      { id: 'a2', action: 'Reduced Waste by 20%', org: 'Green Solutions Ltd.', impact: '+100 kg CO₂', at: new Date('2024-03-13') },
      { id: 'a3', action: 'Employee Wellness Program', org: 'Sustainable Industries', impact: '+75 kg CO₂', at: new Date('2024-03-12') },
    ],
    systemAlerts: [
      { id: 's1', type: 'compliance', message: '3 MSMEs nearing audit deadline', severity: 'medium', at: new Date('2024-03-15') },
      { id: 's2', type: 'performance', message: 'Two MSMEs show declining ESG trend', severity: 'high', at: new Date('2024-03-14') },
    ],
    metricsDist: {
      certified: 35,
      active: 68,
      inProgress: 28,
      suspended: 11,
    },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MSME Oversight Dashboard</h1>
          <p className="text-gray-600">Manage and monitor MSME sustainability initiatives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ZPCard className="border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total MSMEs</p>
                <p className="text-2xl font-bold text-gray-900">{mock.overview.total}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Factory className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[120, 125, 130, 133, 136, 140, mock.overview.total]} width={260} height={56} stroke="#10B981" />
            </div>
          </ZPCard>

          <ZPCard className="border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active MSMEs</p>
                <p className="text-2xl font-bold text-gray-900">{mock.overview.active}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[90, 97, 101, 109, 115, 122, mock.overview.active]} width={260} height={56} stroke="#3B82F6" />
            </div>
          </ZPCard>

          <ZPCard className="border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. ESG Score</p>
                <p className="text-2xl font-bold text-gray-900">{mock.overview.avgESG}/100</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[72, 74, 75, 76, 77, 78, mock.overview.avgESG]} width={260} height={56} stroke="#10B981" />
            </div>
          </ZPCard>

          <ZPCard className="border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mock.overview.compliance}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[80, 82, 84, 85, 86, 87, mock.overview.compliance]} width={260} height={56} stroke="#8B5CF6" />
            </div>
          </ZPCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZPCard title="MSME Performance" description="Top performing MSMEs by ESG score" className="border-gray-100">
            <div className="space-y-4">
              {mock.top.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{m.name}</span>
                    <ZPBadge variant="success">leader</ZPBadge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Score</span>
                    <ZPBadge variant="success" className="px-3 py-1 text-lg font-bold">{m.score}</ZPBadge>
                    <ZPButton variant="ghost" size="sm"><Eye className="h-4 w-4" /></ZPButton>
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>

          <ZPCard title="MSME Metrics" description="Distribution of status" className="border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{mock.metricsDist.certified}</p>
                <p className="text-sm text-gray-600">Certified</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{mock.metricsDist.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-indigo-700">{mock.metricsDist.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-700">{mock.metricsDist.suspended}</p>
                <p className="text-sm text-gray-600">Suspended</p>
              </div>
            </div>
            <div className="mt-6">
              <ZPCard title="Performance Trends" className="border-0">
                <div className="p-0">
                  <MiniLineChart data={[70, 72, 74, 76, 77, 78]} width={520} height={64} stroke="#10B981" />
                </div>
              </ZPCard>
            </div>
          </ZPCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZPCard title="Recent Activities" description="Latest MSME actions" className="border-gray-100">
            <div className="space-y-4">
              {mock.activities.map((a) => (
                <div key={a.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{a.action}</h4>
                      <ZPBadge variant="info" size="sm">update</ZPBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{a.org}</span>
                      <span className="text-xs text-emerald-700 font-semibold">{a.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>

          <ZPCard title="System Alerts" description="Important notifications requiring attention" className="border-gray-100">
            <div className="space-y-4">
              {mock.systemAlerts.map((al) => (
                <div key={al.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="mr-3 mt-0.5">{sevIcon(al.severity)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{al.message}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize">{al.type} alert</span>
                      <span className="text-xs text-gray-500">{al.at.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>
        </div>

        <ZPCard title="Administrative Actions" description="Tools for managing MSMEs and ESG reporting" className="border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ZPButton variant="outline" className="h-24 flex-col bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Manage MSMEs</span>
            </ZPButton>
            <ZPButton variant="outline" className="h-24 flex-col bg-blue-50 hover:bg-blue-100 border-blue-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">ESG Analytics</span>
            </ZPButton>
            <ZPButton variant="outline" className="h-24 flex-col bg-purple-50 hover:bg-purple-100 border-purple-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mb-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Compliance Reports</span>
            </ZPButton>
            <ZPButton variant="outline" className="h-24 flex-col bg-yellow-50 hover:bg-yellow-100 border-yellow-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                <Download className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Export Data</span>
            </ZPButton>
          </div>
        </ZPCard>
      </div>
    </div>
  );
};


