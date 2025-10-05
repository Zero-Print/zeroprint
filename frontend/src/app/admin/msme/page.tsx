'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPTable } from '@/components/ZPTable';
import { ZPBadge } from '@/components/ZPBadge';
import { getMSMETrends, getMSMEReports, getReportDownloadUrl } from '@/lib/services/msme';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function MSMEAdminPage() {
  const [orgId, setOrgId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const [t, r] = await Promise.all([getMSMETrends(orgId), getMSMEReports(orgId)]);
      setTrends(t);
      setReports(r);
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const chartData = useMemo(() => {
    if (!trends) return [];
    return trends.months.map((m: string, idx: number) => ({
      month: m,
      emissions: trends.series.totalEmissions[idx] || 0,
      emissionsScope3: trends.series.totalEmissionsWithScope3[idx] || 0,
      energy: trends.series.energyConsumption[idx] || 0,
      water: trends.series.waterUsage[idx] || 0,
      waste: trends.series.wasteGenerated[idx] || 0,
      score: trends.series.sustainabilityScore[idx] || 0,
    }));
  }, [trends]);

  useEffect(() => {
    // optionally prefill orgId from user context if available later
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">MSME ESG Analytics</h1>
        {trends?.pctChanges && (
          <div className="flex gap-2">
            <Pct label="Emissions Δ%" value={trends.pctChanges.totalEmissions} />
            <Pct label="Energy Δ%" value={trends.pctChanges.energyConsumption} />
            <Pct label="Water Δ%" value={trends.pctChanges.waterUsage} />
            <Pct label="Waste Δ%" value={trends.pctChanges.wasteGenerated} />
            <Pct label="Score Δ%" value={trends.pctChanges.sustainabilityScore} />
          </div>
        )}
      </div>

      <ZPCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Organization ID</label>
            <input
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              placeholder="Enter orgId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <ZPButton onClick={fetchData} disabled={!orgId || loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </ZPButton>
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </ZPCard>

      <ZPCard className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="emissions" stroke="#ef4444" name="Emissions" />
              <Line type="monotone" dataKey="emissionsScope3" stroke="#f59e0b" name="Emissions (S3)" />
              <Line type="monotone" dataKey="energy" stroke="#10b981" name="Energy" />
              <Line type="monotone" dataKey="water" stroke="#3b82f6" name="Water" />
              <Line type="monotone" dataKey="waste" stroke="#8b5cf6" name="Waste" />
              <Line type="monotone" dataKey="score" stroke="#111827" name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ZPCard>

      <ZPCard className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Reports</h2>
        <ZPTable
          columns={[
            { header: 'Month', accessorKey: 'month' },
            { header: 'Year', accessorKey: 'year' },
            { header: 'Emissions', accessorKey: 'emissions' },
            { header: 'Scope 3', accessorKey: 'scope3' },
            { header: 'Actions', accessorKey: 'actions' },
          ]}
          data={reports.map((r: any) => ({
            month: r.month,
            year: r.year,
            emissions: r.metrics?.totalEmissions ?? 0,
            scope3: r.metrics?.scope3Emissions ?? (r.data?.scope3Emissions ?? 0),
            actions: (
              <a
                href={getReportDownloadUrl(r.reportId || r.reportId || r.id)}
                className="text-green-600 hover:text-green-700 underline"
              >
                Download
              </a>
            ),
          }))}
        />
      </ZPCard>
    </div>
  );
}

function Pct({ label, value }: { label: string; value: number | null }) {
  const color = value == null ? 'bg-gray-100 text-gray-700' : value >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const text = value == null ? '—' : `${value}%`;
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}: {text}</span>
  );
}


