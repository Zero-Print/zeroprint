'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';

export default function AdminSpotlightPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/spotlight/stories', { params: { status: 'pending' } });
      setStories(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      setStories([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStories(); }, []);

  const handleReview = async (storyId: string, action: 'approve' | 'reject') => {
    try {
      await api.post('/admin/spotlight/review', { storyId, action });
      fetchStories();
    } catch (error) {
      console.error('Failed to review story:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Spotlight Stories (Pending)</h1>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((s) => (
            <ZPCard key={s.storyId} className="p-4 space-y-3">
              {s.mediaUrl && <img src={s.mediaUrl} className="w-full h-40 object-cover rounded" />}
              <div className="font-semibold">{s.title}</div>
              {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
              <div className="flex gap-2">
                <ZPButton size="sm" onClick={() => handleReview(s.storyId, 'approve')}>Approve</ZPButton>
                <ZPButton size="sm" variant="danger" onClick={() => handleReview(s.storyId, 'reject')}>Reject</ZPButton>
              </div>
            </ZPCard>
          ))}
        </div>
      )}
    </div>
  );
}


