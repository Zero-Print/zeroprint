'use client';

import React, { useEffect, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import api from '@/lib/api';

export default function AdminGeoPage() {
  const [geojson, setGeojson] = useState('');
  const [wardId, setWardId] = useState('ward_demo');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res: any = await api.request('/admin/integrations/geo/wards');
      setWards(res?.data || []);
    })();
  }, []);

  const validate = () => {
    try {
      const obj = JSON.parse(geojson);
      if (!obj.type || !obj.features) {
        setError('Invalid GeoJSON');
        return false;
      }
      setError(null);
      return true;
    } catch (e: any) {
      setError('Invalid JSON');
      return false;
    }
  };

  const upload = async () => {
    if (!validate()) return;
    const parsed = JSON.parse(geojson);
    await api.request('/admin/integrations/geo/wards', { method: 'POST', body: JSON.stringify({ wardId, name, geojson: parsed }) });
    const res: any = await api.request('/admin/integrations/geo/wards');
    setWards(res?.data || []);
    alert(`Uploaded GeoJSON for ${wardId}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ward GeoJSON Uploader</h1>
      <ZPCard className="p-4 space-y-3">
        <div className="flex gap-2">
          <input value={wardId} onChange={e => setWardId(e.target.value)} className="px-3 py-2 border rounded" placeholder="wardId" />
          <input value={name} onChange={e => setName(e.target.value)} className="px-3 py-2 border rounded" placeholder="Ward name (optional)" />
          <ZPButton variant="outline" onClick={validate}>Validate</ZPButton>
          <ZPButton onClick={upload}>Upload</ZPButton>
        </div>
        <textarea value={geojson} onChange={e => setGeojson(e.target.value)} className="w-full h-72 border rounded p-2 font-mono text-sm" placeholder="Paste GeoJSON here" />
        {error && <div className="text-sm text-red-600">{error}</div>}
      </ZPCard>
      <ZPCard className="p-4 space-y-2">
        <div className="font-semibold">Existing Wards</div>
        <div className="text-sm text-gray-600">{wards.length} wards</div>
        <div className="max-h-64 overflow-auto border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Ward ID</th>
                <th className="text-left p-2">Name</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((w) => (
                <tr key={w.wardId} className="border-b">
                  <td className="p-2">{w.wardId}</td>
                  <td className="p-2">{w.name || '-'}</td>
                </tr>
              ))}
              {wards.length === 0 && <tr><td colSpan={2} className="p-3 text-center text-gray-500">No wards uploaded</td></tr>}
            </tbody>
          </table>
        </div>
      </ZPCard>
    </div>
  );
}


