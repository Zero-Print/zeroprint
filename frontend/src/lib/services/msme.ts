'use client';

import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { api } from '@/lib/api';

export type MSMETrends = {
  months: string[];
  series: Record<string, number[]>;
  pctChanges: Record<string, number | null>;
  count: number;
};

export async function getMSMETrends(orgId: string, start?: string, end?: string): Promise<MSMETrends> {
  const callable = httpsCallable(functions, 'getMSMETrends');
  const resp = (await callable({ orgId, start, end })) as any;
  if (!resp?.data?.status || resp.data.status !== 'success') throw new Error('Failed to fetch trends');
  return resp.data.data as MSMETrends;
}

export async function getMSMEReports(orgId: string): Promise<any[]> {
  const callable = httpsCallable(functions, 'getMSMEReports');
  const resp = (await callable({ orgId })) as any;
  if (!resp?.data?.status || resp.data.status !== 'success') throw new Error('Failed to fetch reports');
  return resp.data.data?.reports || [];
}

export function getReportDownloadUrl(reportId: string): string {
  // Use functions API base route for download logging + redirect
  // @ts-ignore private request method exists
  const baseUrl: string = (api as any).config?.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return `${baseUrl}/msmeReports/${encodeURIComponent(reportId)}/download`;
}


