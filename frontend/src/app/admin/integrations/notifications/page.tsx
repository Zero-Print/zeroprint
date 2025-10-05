'use client';

import React, { useEffect, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import api from '@/lib/apiClient';

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    (async () => {
      const qs = new URLSearchParams({ ...(userId ? { userId } : {}), ...(status !== 'all' ? { status } : {}), limit: '50' });
      const res: any = await api['request']?.(`/admin/integrations/notifications/logs?${qs.toString()}`);
      setLogs(res?.data || []);
    })();
  }, [userId, status]);

  const manualDispatch = async () => {
    try {
      await api.post('/admin/integrations/notifications/send', {
        userId: userId || 'demo_user',
        channel: 'email',
        templateId: 'reward_redeemed',
        variables: { name: 'Demo', rewardTitle: 'Water Bottle', voucherCode: 'ABC-123' },
        to: { email: 'demo@example.com' }
      });
      alert('Dispatched (demo)');
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notification Logs</h1>
        <div className="flex gap-2">
          <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="userId" className="px-3 py-2 border rounded" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border rounded bg-white">
            <option value="all">All</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
          <ZPButton onClick={manualDispatch}>Manual Dispatch (Demo)</ZPButton>
        </div>
      </div>
      <ZPCard className="p-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Channel</th>
              <th className="text-left p-2">Template</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{l.userId}</td>
                <td className="p-2">{l.channel}</td>
                <td className="p-2">{l.templateId}</td>
                <td className="p-2">{l.status}</td>
                <td className="p-2">{l.sentAt}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No logs</td></tr>
            )}
          </tbody>
        </table>
      </ZPCard>
    </div>
  );
}


