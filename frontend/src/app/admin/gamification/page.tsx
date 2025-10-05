'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPTable } from '@/components/ZPTable';
import { ZPBadge } from '@/components/ZPBadge';
import { createMission, listMissions, updateMission, getUserStreak, Mission, UserStreak } from '@/lib/services/gamification';

export default function GamificationAdminPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Mission, 'missionId' | 'createdBy'>>({
    title: '',
    type: 'streak',
    goal: 7,
    rewardCoins: 25,
    status: 'active',
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, s] = await Promise.all([listMissions(), getUserStreak()]);
      setMissions(m);
      setStreak(s);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createMission(form);
      setForm({ title: '', type: 'streak', goal: 7, rewardCoins: 25, status: 'active' });
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (mission: Mission) => {
    setLoading(true);
    try {
      const next = mission.status === 'active' ? 'inactive' : 'active';
      await updateMission(mission.missionId, { status: next });
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gamification Admin</h1>
        {streak && (
          <div className="flex gap-2">
            <ZPBadge variant="success">Streak: {streak.streakCount} days</ZPBadge>
            <ZPBadge variant="info">XP: {streak.xp}</ZPBadge>
            {streak.badges?.map((b) => (
              <ZPBadge key={b} variant="secondary">{b}</ZPBadge>
            ))}
          </div>
        )}
      </div>

      <ZPCard className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Create Mission</h2>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="px-3 py-2 border rounded" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="px-3 py-2 border rounded" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
            <option value="streak">Streak</option>
            <option value="count">Count</option>
            <option value="challenge">Challenge</option>
          </select>
          <input type="number" className="px-3 py-2 border rounded" placeholder="Goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: Number(e.target.value) })} />
          <input type="number" className="px-3 py-2 border rounded" placeholder="Reward Coins" value={form.rewardCoins} onChange={(e) => setForm({ ...form, rewardCoins: Number(e.target.value) })} />
          <div className="flex gap-2">
            <select className="px-3 py-2 border rounded" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            <ZPButton onClick={handleCreate} disabled={loading || !form.title}>{loading ? 'Saving…' : 'Create'}</ZPButton>
          </div>
        </div>
      </ZPCard>

      <ZPCard className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Missions</h2>
        <ZPTable
          columns={[
            { header: 'Title', accessorKey: 'title' },
            { header: 'Type', accessorKey: 'type' },
            { header: 'Goal', accessorKey: 'goal' },
            { header: 'Reward', accessorKey: 'rewardCoins' },
            { header: 'Status', accessorKey: 'status' },
            { header: 'Actions', accessorKey: 'actions' },
          ]}
          data={missions.map((m) => ({
            title: m.title,
            type: m.type,
            goal: m.goal,
            rewardCoins: m.rewardCoins,
            status: <ZPBadge variant={m.status === 'active' ? 'success' : m.status === 'inactive' ? 'warning' : 'danger'}>{m.status}</ZPBadge>,
            actions: (
              <div className="flex gap-2 justify-end">
                <ZPButton size="sm" onClick={() => handleToggleStatus(m)}>{m.status === 'active' ? 'Disable' : 'Enable'}</ZPButton>
              </div>
            ),
          }))}
        />
      </ZPCard>
    </div>
  );
}


