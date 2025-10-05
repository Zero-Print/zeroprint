'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { ZPCard } from '@/components/ZPCard';
import { t } from '@/lib/i18n';

export default function CitizenSpotlightPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/citizen/spotlight/stories', { params: { status: 'approved' } });
      setStories(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      setStories([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStories(); }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('spotlight.title')}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((s) => (
            <ZPCard key={s.storyId} className="p-4 space-y-3">
              {s.mediaUrl && <img src={s.mediaUrl} className="w-full h-40 object-cover rounded" />}
              <div className="font-semibold">{s.title}</div>
              {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
            </ZPCard>
          ))}
        </div>
      )}
    </div>
  );
}


