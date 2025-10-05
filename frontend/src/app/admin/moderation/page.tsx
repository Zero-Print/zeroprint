'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPTable } from '@/components/ZPTable';
import { ZPBadge } from '@/components/ZPBadge';
import { listModerationQueue, approveAnimalModeration } from '@/lib/services/moderation';

export default function ModerationAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listModerationQueue(status);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await approveAnimalModeration(id);
      await fetchItems();
    } catch (e: any) {
      setError(e?.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 border rounded">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
          <ZPButton onClick={fetchItems} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</ZPButton>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <ZPCard className="p-4">
        <ZPTable
          columns={[
            { header: 'ID', accessorKey: 'moderationId' },
            { header: 'User', accessorKey: 'userId' },
            { header: 'Log', accessorKey: 'logId' },
            { header: 'Coins', accessorKey: 'coinsToAward' },
            { header: 'Status', accessorKey: 'status' },
            { header: 'Actions', accessorKey: 'actions' },
          ]}
          data={items.map((it: any) => ({
            ...it,
            status: <ZPBadge variant={it.status === 'pending' ? 'warning' : it.status === 'approved' ? 'success' : 'danger'}>{it.status}</ZPBadge>,
            actions: it.status === 'pending' ? (
              <ZPButton size="sm" onClick={() => handleApprove(it.moderationId)}>Approve</ZPButton>
            ) : null,
          }))}
        />
      </ZPCard>
    </div>
  );
}


