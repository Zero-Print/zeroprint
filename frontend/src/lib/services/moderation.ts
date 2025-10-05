'use client';

import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

export async function listModerationQueue(status: 'pending' | 'approved' | 'rejected' | '' = 'pending') {
  const callable = httpsCallable(functions, 'listModerationQueue');
  const resp = (await callable({ status })) as any;
  if (!resp?.data?.success) throw new Error('Failed to load moderation queue');
  return resp.data.data as any[];
}

export async function approveAnimalModeration(moderationId: string) {
  const callable = httpsCallable(functions, 'approveAnimalModeration');
  const resp = (await callable({ moderationId })) as any;
  if (!resp?.data?.success) throw new Error('Approval failed');
  return true;
}


