import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export async function createCompetition(input: { name: string; type: 'school' | 'msme' | 'ward'; startDate: string; endDate: string; rewardPool?: number; participants?: string[] }) {
  const fn = httpsCallable(functions as any, 'createCompetition');
  const res: any = await fn(input);
  return res.data?.data;
}

export async function updateCompetitionScore(input: { competitionId: string; groupId: string; groupName?: string; deltaPoints: number; deltaHealCoins?: number }) {
  const fn = httpsCallable(functions as any, 'updateCompetitionScore');
  const res: any = await fn(input);
  return res.data;
}

export async function listCompetitionScores(competitionId: string, limit = 50) {
  const fn = httpsCallable(functions as any, 'listCompetitionScores');
  const res: any = await fn({ competitionId, limit });
  return res.data?.data || [];
}


