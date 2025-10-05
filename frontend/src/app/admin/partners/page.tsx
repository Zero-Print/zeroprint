'use client';

import React, { useEffect, useState } from 'react';
import { listPartners, createPartner } from '@/lib/services/partners';
import { ZPButton } from '@/components/ZPButton';
import { ZPCard } from '@/components/ZPCard';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await listPartners();
      setPartners(data);
    } catch (e) {
      setError('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const handleCreateDemo = async () => {
    await createPartner({ name: 'Demo NGO', type: 'NGO', websiteUrl: 'https://example.org' });
    fetchPartners();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partners</h1>
        <ZPButton onClick={handleCreateDemo}>Add Demo Partner</ZPButton>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <ZPCard key={p.partnerId} className="p-4">
              <div className="flex items-center gap-3">
                {p.logoUrl && <img src={p.logoUrl} className="h-10 w-10 rounded" />}
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.type}</div>
                </div>
              </div>
            </ZPCard>
          ))}
        </div>
      )}
    </div>
  );
}


