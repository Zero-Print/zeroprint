import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export async function listContent(params?: { language?: string; category?: string; visibility?: string }) {
  const fn = httpsCallable(functions as any, 'listContent');
  const res: any = await fn(params || {});
  return res.data?.data || [];
}

export async function createContent(input: { title: string; type: 'article' | 'video' | 'infographic'; language: string; category: string; body?: string; url?: string; tags?: string[]; visibility?: string; }) {
  const fn = httpsCallable(functions as any, 'createContent');
  const res: any = await fn(input);
  return res.data?.data;
}

export async function generateRecommendations(input?: { userId?: string; language?: string }) {
  const fn = httpsCallable(functions as any, 'generateRecommendations');
  const res: any = await fn(input || {});
  return res.data?.data;
}


