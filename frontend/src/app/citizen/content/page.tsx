'use client';

import React, { useEffect, useState } from 'react';
import { listContent, generateRecommendations } from '@/lib/services/content';
import { t } from '@/lib/i18n';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';

export default function CitizenContentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [rec, setRec] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    const data = await listContent({ visibility: 'citizen' });
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  const handleRecommend = async () => {
    const r = await generateRecommendations();
    setRec(r);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('content.libraryTitle')}</h1>
        <ZPButton size="sm" onClick={handleRecommend}>{t('content.aiTip')}</ZPButton>
      </div>
      {rec && (
        <ZPCard className="p-4 bg-emerald-50 border-emerald-200">
          <div className="text-sm text-emerald-800">{t('content.aiTip')}</div>
          <div className="font-medium text-emerald-900">{rec.message}</div>
        </ZPCard>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <ZPCard key={c.contentId} className="p-4">
              <div className="text-xs text-gray-500">{c.language.toUpperCase()} • {c.category}</div>
              <div className="font-semibold">{c.title}</div>
              {c.body && <p className="text-sm text-gray-600 mt-1 line-clamp-3">{c.body}</p>}
              {c.url && (
                <a href={c.url} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 mt-2 inline-block">{t('content.open')}</a>
              )}
            </ZPCard>
          ))}
        </div>
      )}
    </div>
  );
}


