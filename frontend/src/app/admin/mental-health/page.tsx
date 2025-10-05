'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { ZPTable } from '@/components/ZPTable';
import api from '@/lib/apiClient';
import { useAuth } from '@/modules/auth';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type GroupStats = {
  count: number;
  avgMood: number;
  avgEcoMind: number;
  distribution: Record<string, number>;
};

type SectionResponse = {
  success: boolean;
  data: {
    groups: Record<string, GroupStats>;
    groupCount: number;
    totalCount: number;
  };
};

export default function MentalHealthAdminPage() {
  const { user } = useAuth();
  const [schoolId, setSchoolId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SectionResponse['data'] | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!functions || !schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await api.post('/admin/mental-health/school-weekly-mood', { schoolId });
      if (resp?.data?.success) {
        setData(resp.data.data);
        const firstKey = Object.keys(resp.data.data.groups || {})[0] || null;
        setSelectedGroup(firstKey);
      } else {
        setError('Failed to load aggregate');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load aggregate');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    // If the user has schoolId on profile, prefill
    // @ts-ignore next-line: profile may be attached by auth module
    const sid = user?.profile?.schoolId || '';
    if (sid && !schoolId) setSchoolId(sid);
  }, [user, schoolId]);

  const groupOptions = useMemo(() => Object.keys(data?.groups || {}), [data]);

  const chartData = useMemo(() => {
    if (!data || !selectedGroup) return [] as { day: string; count: number }[];
    const dist = data.groups[selectedGroup]?.distribution || {};
    return Object.entries(dist)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count }));
  }, [data, selectedGroup]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">School Mental Health Insights</h1>
        <ZPBadge variant="info">Weekly</ZPBadge>
      </div>

      <ZPCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-700 mb-1">School ID</label>
            <input
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              placeholder="Enter schoolId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section</label>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {groupOptions.length === 0 && <option value="">No sections</option>}
              {groupOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <ZPButton onClick={fetchData} disabled={!schoolId || loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </ZPButton>
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </ZPCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZPCard className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Section Summary</h2>
          <ZPTable
            columns={[
              { header: 'Class-Section', accessorKey: 'group' },
              { header: 'Entries', accessorKey: 'count' },
              { header: 'Avg Mood', accessorKey: 'avgMood' },
              { header: 'Avg Eco-Mind', accessorKey: 'avgEcoMind' },
            ]}
            data={Object.entries(data?.groups || {}).map(([group, stats]) => ({
              group,
              count: stats.count,
              avgMood: stats.avgMood,
              avgEcoMind: stats.avgEcoMind,
            }))}
          />
        </ZPCard>

        <ZPCard className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Daily Check-ins ({selectedGroup || '—'})</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ZPCard>
      </div>

      {data && (
        <ZPCard className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Sections" value={data.groupCount} />
            <Stat label="Total Entries" value={data.totalCount} />
            <Stat label="Selected Avg Mood" value={selectedGroup ? data.groups[selectedGroup]?.avgMood ?? 0 : 0} />
            <Stat label="Selected Avg Eco" value={selectedGroup ? data.groups[selectedGroup]?.avgEcoMind ?? 0 : 0} />
          </div>
        </ZPCard>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}


