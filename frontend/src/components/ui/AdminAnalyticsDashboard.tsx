'use client';

import React, { useEffect, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { MiniLineChart } from '@/components/ui/MiniLineChart';
import api from '@/lib/api';

export const AdminAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h'|'7d'|'30d'>('7d');
  const [summary, setSummary] = useState<any>(null);
  const [module, setModule] = useState<'all'|'city'|'solar'|'waste'|'core'>('all');

  useEffect(() => {
    (async () => {
      try {
        const qs = new URLSearchParams({ timeRange });
        const res: any = await api.request(`/admin/analytics?${qs.toString()}`);
        setSummary(res?.data || res || null);
      } catch (e) {
        console.error('Failed to load analytics', e);
      }
    })();
  }, [timeRange, module]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <div className="flex gap-2">
          <select value={module} onChange={(e) => setModule(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-md bg-white">
            <option value="all">All Modules</option>
            <option value="core">Core</option>
            <option value="city">City</option>
            <option value="solar">Solar</option>
            <option value="waste">Waste</option>
          </select>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-md bg-white">
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <ZPButton variant="outline" size="sm" onClick={() => window.location.reload()}>Refresh</ZPButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ZPCard title="Daily Active Users" description="Unique users in the selected period">
          <div className="text-3xl font-bold">{summary?.dau ?? '-'}</div>
        </ZPCard>
        <ZPCard title="Actions Logged" description="activityLogs entries">
          <div className="text-3xl font-bold">{summary?.actionsCount ?? '-'}</div>
        </ZPCard>
        <ZPCard title="Errors Logged" description="errorLogs entries">
          <div className="text-3xl font-bold">{summary?.errorsCount ?? '-'}</div>
        </ZPCard>
      </div>

      <ZPCard title="Performance (avg by type)" description="Reported perf metrics average values">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary?.avgPerfByType ? Object.keys(summary.avgPerfByType).map((k) => (
            <div key={k} className="p-3 border rounded-md bg-gray-50 flex items-center justify-between">
              <div className="font-medium text-gray-700">{k}</div>
              <div className="font-bold">{summary.avgPerfByType[k]}</div>
            </div>
          )) : <div className="text-gray-500 text-sm">No perf metrics available</div>}
        </div>
      </ZPCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ZPCard title="HealCoins Trend" description="Earned vs Redeemed (placeholder)">
          <MiniLineChart data={[10,18,22,30,28,35,40]} width={520} height={64} stroke="#10B981" />
        </ZPCard>
        <ZPCard title="CO₂ Saved Trend" description="Estimated CO₂ saved (placeholder)">
          <MiniLineChart data={[5,8,12,11,15,18,22]} width={520} height={64} stroke="#3B82F6" />
        </ZPCard>
      </div>

      <div className="flex gap-2 justify-end">
        <ZPButton
          variant="outline"
          size="sm"
          onClick={async () => {
            const qs = new URLSearchParams({ timeRange, format: 'csv' });
            const res: any = await api.request(`/admin/analytics/export?${qs.toString()}`);
            const csv = res?.data || res?.data?.data || res?.data?.csv || '';
            const blob = new Blob([typeof csv === 'string' ? csv : JSON.stringify(csv)], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'analytics.csv'; a.click(); URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </ZPButton>
        <ZPButton
          variant="outline"
          size="sm"
          onClick={async () => {
            const qs = new URLSearchParams({ timeRange, format: 'pdf' });
            const res: any = await api.request(`/admin/analytics/export?${qs.toString()}`);
            const pdf = res?.data || res?.data?.data || 'Analytics Report';
            const blob = new Blob([typeof pdf === 'string' ? pdf : JSON.stringify(pdf)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'analytics.pdf'; a.click(); URL.revokeObjectURL(url);
          }}
        >
          Export PDF
        </ZPButton>
      </div>
    </div>
  );
};


