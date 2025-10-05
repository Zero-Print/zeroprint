'use client';

import React, { useState } from 'react';
import { createCompetition, listCompetitionScores } from '@/lib/services/competitions';
import { ZPButton } from '@/components/ZPButton';
import { ZPCard } from '@/components/ZPCard';

export default function AdminCompetitionsPage() {
  const [competitionId, setCompetitionId] = useState<string | null>(null);
  const [scores, setScores] = useState<any[]>([]);

  const handleCreateDemo = async () => {
    const now = new Date();
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const comp = await createCompetition({
      name: 'Green Week Challenge',
      type: 'school',
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      rewardPool: 1000,
    });
    setCompetitionId(comp.competitionId);
  };

  const handleLoadScores = async () => {
    if (!competitionId) return;
    const list = await listCompetitionScores(competitionId);
    setScores(list);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Competitions</h1>
        <div className="flex gap-2">
          <ZPButton onClick={handleCreateDemo}>Create Demo Competition</ZPButton>
          <ZPButton variant="outline" onClick={handleLoadScores} disabled={!competitionId}>Load Scores</ZPButton>
        </div>
      </div>

      {competitionId && (
        <ZPCard className="p-4">
          <div className="font-semibold">Competition ID: {competitionId}</div>
          <div className="text-sm text-gray-600">Top groups</div>
          <div className="mt-3 space-y-2">
            {scores.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b pb-2">
                <div>{s.groupName || s.groupId}</div>
                <div className="font-mono">{s.totalPoints} pts</div>
              </div>
            ))}
          </div>
        </ZPCard>
      )}
    </div>
  );
}


