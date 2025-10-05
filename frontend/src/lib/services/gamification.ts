'use client';

import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

export type Mission = {
  missionId: string;
  title: string;
  type: 'streak' | 'count' | 'challenge';
  goal: number;
  rewardCoins: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'archived';
  createdBy?: string;
};

export type UserStreak = {
  userId: string;
  missionId?: string;
  streakCount: number;
  lastCompletedDate?: string;
  badges: string[];
  xp: number;
  updatedAt: string;
};

export async function listMissions(): Promise<Mission[]> {
  const fn = httpsCallable(functions, 'listMissions');
  const resp = (await fn({})) as any;
  if (!resp?.data?.success) throw new Error('Failed to load missions');
  return resp.data.missions || resp.data.data || [];
}

export async function createMission(payload: Omit<Mission, 'missionId' | 'createdBy'>): Promise<Mission> {
  const fn = httpsCallable(functions, 'createMission');
  const resp = (await fn(payload)) as any;
  if (!resp?.data?.success) throw new Error('Failed to create mission');
  return resp.data.mission as Mission;
}

export async function updateMission(missionId: string, updates: Partial<Mission>): Promise<Mission> {
  const fn = httpsCallable(functions, 'updateMission');
  const resp = (await fn({ missionId, updates })) as any;
  if (!resp?.data?.success) throw new Error('Failed to update mission');
  return resp.data.mission as Mission;
}

export async function completeMission(missionId: string): Promise<boolean> {
  const fn = httpsCallable(functions, 'completeMission');
  const resp = (await fn({ missionId })) as any;
  return Boolean(resp?.data?.success);
}

export async function getUserStreak(): Promise<UserStreak | null> {
  const fn = httpsCallable(functions, 'getUserStreak');
  const resp = (await fn({})) as any;
  if (!resp?.data?.success) return null;
  return resp.data.streak as UserStreak;
}


