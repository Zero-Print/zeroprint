'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export type RewardType = 'voucher' | 'product' | 'credit';

export interface Reward {
  rewardId: string;
  title: string;
  description?: string;
  coinCost: number;
  stock: number;
  type: RewardType;
  imageUrl?: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  metadata?: any;
}

export interface Redemption {
  redemptionId: string;
  userId: string;
  rewardId: string;
  coinsSpent: number;
  status: 'success' | 'failed' | 'pending';
  voucherCode?: string;
  createdAt: string;
  processedBy: string;
  processedAt?: string;
  metadata?: any;
}

export async function fetchRewards(): Promise<Reward[]> {
  if (!functions) throw new Error('Firebase functions not available');
  const callable = httpsCallable(functions, 'rewards_getRewards');
  const res = await callable(undefined);
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to load rewards');
  return payload.data?.rewards || [];
}

export async function fetchRewardById(rewardId: string): Promise<Reward> {
  const callable = httpsCallable(functions!, 'rewards_getRewardById');
  const res = await callable({ rewardId });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to load reward');
  return payload.data?.reward as Reward;
}

export async function redeemReward(rewardId: string): Promise<{ redemptionId: string; voucherCode?: string; rewardTitle?: string }>
{
  const callable = httpsCallable(functions!, 'rewards_redeemCoins');
  const res = await callable({ rewardId });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Redemption failed');
  return payload.data as any;
}

export async function fetchUserRedemptions(): Promise<Redemption[]> {
  const callable = httpsCallable(functions!, 'rewards_getUserRedemptions');
  const res = await callable(undefined);
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to load redemptions');
  return payload.data?.redemptions || [];
}

export async function fetchAllRedemptions(filters?: { userId?: string; status?: string; startDate?: string; endDate?: string }, limit?: number, offset?: number)
{
  const callable = httpsCallable(functions!, 'rewards_getAllRedemptions');
  const res = await callable({ filters, limit, offset });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to load redemptions');
  return payload.data?.redemptions || [];
}

export async function addRewardFn(data: { title: string; description?: string; coinCost: number; stock: number; type: RewardType; imageUrl?: string; metadata?: any })
{
  const callable = httpsCallable(functions!, 'rewards_addReward');
  const res = await callable(data);
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to add reward');
  return payload.data?.rewardId as string;
}

export async function updateRewardFn(rewardId: string, updates: Partial<Reward>) {
  const callable = httpsCallable(functions!, 'rewards_updateReward');
  const res = await callable({ rewardId, updates });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to update reward');
}

export async function deleteRewardFn(rewardId: string) {
  const callable = httpsCallable(functions!, 'rewards_deleteReward');
  const res = await callable({ rewardId });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to delete reward');
}

export async function updateRewardStockFn(rewardId: string, delta: number) {
  const callable = httpsCallable(functions!, 'rewards_updateRewardStock');
  const res = await callable({ rewardId, delta });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to update stock');
  return payload.data?.newStock as number;
}

export async function uploadVouchersFn(rewardId: string, codes: string[]) {
  const callable = httpsCallable(functions!, 'rewards_uploadVouchers');
  const res = await callable({ rewardId, voucherCodes: codes });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to upload vouchers');
  return payload.data?.count as number;
}

export async function verifyPartnerRedemptionFn(voucherCode: string) {
  const callable = httpsCallable(functions!, 'rewards_verifyPartnerRedemption');
  const res = await callable({ voucherCode });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to verify voucher');
  return payload.data as { isValid: boolean; rewardId?: string; rewardTitle?: string };
}

export async function getVouchersForRewardFn(rewardId: string) {
  const callable = httpsCallable(functions!, 'rewards_getVouchersForReward');
  const res = await callable({ rewardId });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to fetch vouchers');
  return payload.data?.vouchers as Array<{ voucherId: string; code: string; isRedeemed: boolean; redeemedBy?: string; redeemedAt?: string }>;
}

export async function getRewardsAnalyticsDataFn() {
  const callable = httpsCallable(functions!, 'rewards_getAnalyticsData');
  const res = await callable(undefined);
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to load analytics');
  return payload.data?.analyticsData as any;
}

export async function getTotalCoinsRedeemedFn() {
  const callable = httpsCallable(functions!, 'rewards_getTotalCoinsRedeemed');
  const res = await callable(undefined);
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to load total coins redeemed');
  return payload.data?.totalCoins as number;
}

export async function getRedemptionTrendsFn(startDate: string, endDate: string) {
  const callable = httpsCallable(functions!, 'rewards_getRedemptionTrends');
  const res = await callable({ startDate, endDate });
  const payload = (res.data as any) || {};
  if (payload.status !== 'success') throw new Error(payload.message || 'Failed to load redemption trends');
  return payload.data?.trends as Array<{ date: string; redemptions: number; coins: number }>;
}


