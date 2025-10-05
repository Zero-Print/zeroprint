'use client';

import React, { useEffect, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import api from '@/lib/api';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('CSR Simulator');
  const [partnerId, setPartnerId] = useState('simulator');

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await api['request']?.('/admin/integrations/partners');
      setPartners(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const testConnection = async (pid: string) => {
    const res: any = await api['request']?.(`/admin/integrations/partners/${pid}/test`, { method: 'POST' });
    const ok = res?.data?.data?.success ?? res?.success;
    const items = res?.data?.data?.items ?? res?.data?.items;
    alert(ok ? `Connection OK${typeof items !== 'undefined' ? ` (items: ${items})` : ''}` : `Failed`);
  };

  const toggleEnable = async (pid: string, enabled: boolean) => {
    await api['request']?.(`/admin/integrations/partners/${pid}`, { method: 'PATCH', body: JSON.stringify({ enabled: !enabled }) });
    setPartners(p => p.map(x => x.partnerId === pid ? { ...x, enabled: !enabled } : x));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CSR Partners</h1>
        <div className="flex gap-2">
          <input value={partnerId} onChange={e => setPartnerId(e.target.value)} placeholder="partnerId" className="px-3 py-2 border rounded" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="name" className="px-3 py-2 border rounded" />
          <ZPButton onClick={async () => { await api['request']?.('/admin/integrations/partners', { method: 'POST', body: JSON.stringify({ partnerId, name, enabled: true }) }); load(); }}>Add Partner</ZPButton>
        </div>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(p => (
            <ZPCard key={p.partnerId} className="p-4 space-y-3">
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-gray-500">ID: {p.partnerId}</div>
              <div className="flex gap-2">
                <ZPButton size="sm" onClick={() => testConnection(p.partnerId)}>Test</ZPButton>
                <ZPButton size="sm" variant="outline" onClick={() => toggleEnable(p.partnerId, p.enabled)}>{p.enabled ? 'Disable' : 'Enable'}</ZPButton>
                <ZPButton size="sm" variant="outline" onClick={async () => {
                  const res: any = await api.request('/admin/integrations/redemptions/retry', { method: 'POST', body: JSON.stringify({ partnerId: p.partnerId, max: 10 }) });
                  const okCount = (res?.retried || res?.data?.retried || []).filter((r: any) => r.ok).length;
                  alert(`Retried ${okCount} redemptions`);
                }}>Retry Failed</ZPButton>
              </div>
            </ZPCard>
          ))}
        </div>
      )}
    </div>
  );
}


