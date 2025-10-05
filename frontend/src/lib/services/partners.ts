import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export async function listPartners() {
  const fn = httpsCallable(functions as any, 'listPartners');
  const res: any = await fn({});
  return res.data?.data || [];
}

export async function createPartner(input: { name: string; type: 'NGO' | 'Brand'; contactEmail?: string; contactPhone?: string; logoUrl?: string; websiteUrl?: string; }) {
  const fn = httpsCallable(functions as any, 'createPartner');
  const res: any = await fn(input);
  return res.data?.data;
}

export async function updatePartner(partnerId: string, updates: any) {
  const fn = httpsCallable(functions as any, 'updatePartner');
  const res: any = await fn({ partnerId, updates });
  return res.data;
}


