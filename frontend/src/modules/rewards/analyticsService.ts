// Analytics Service - Handles monitoring and analytics for the rewards system

import { Redemption, Reward } from './rewardsService';
import {
  getRewardsAnalyticsDataFn,
  getTotalCoinsRedeemedFn,
  getRedemptionTrendsFn
} from '@/lib/services/rewardsClient';

// Analytics data interfaces
export interface RedemptionStats {
  totalRedemptions: number;
  successfulRedemptions: number;
  failedRedemptions: number;
  pendingRedemptions: number;
  successRate: number;
  failureRate: number;
}

export interface RewardPerformance {
  rewardId: string;
  rewardTitle: string;
  totalRedemptions: number;
  totalCoinsSpent: number;
  avgCoinsPerRedemption: number;
  stockOutCount: number;
}

export interface DailyRedemptionTrend {
  date: string;
  redemptions: number;
  coinsSpent: number;
}

export interface AnalyticsData {
  redemptionStats: RedemptionStats;
  topRewards: RewardPerformance[];
  dailyTrends: DailyRedemptionTrend[];
  stockOutAlerts: { rewardId: string; rewardTitle: string; stock: number }[];
  failureAlerts: { hour: string; failureRate: number }[];
}

// Mock analytics data for demo
let mockRedemptions: Redemption[] = [
  {
    id: 'r1',
    userId: 'user1',
    rewardId: '1',
    coinsSpent: 1000,
    status: 'success',
    voucherCode: 'AMZ-123-XYZ',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    processedBy: 'system'
  },
  {
    id: 'r2',
    userId: 'user2',
    rewardId: '2',
    coinsSpent: 500,
    status: 'pending',
    createdAt: new Date('2024-01-15T11:45:00Z'),
    processedBy: 'admin1'
  },
  {
    id: 'r3',
    userId: 'user3',
    rewardId: '1',
    coinsSpent: 1000,
    status: 'success',
    voucherCode: 'AMZ-456-ABC',
    createdAt: new Date('2024-01-14T09:15:00Z'),
    processedBy: 'system'
  },
  {
    id: 'r4',
    userId: 'user4',
    rewardId: '3',
    coinsSpent: 1500,
    status: 'failed',
    createdAt: new Date('2024-01-14T14:20:00Z'),
    processedBy: 'system'
  }
];

let mockRewards: Reward[] = [
  {
    id: '1',
    title: 'Amazon Voucher ₹100',
    description: 'Redeem for a ₹100 Amazon voucher',
    coinCost: 1000,
    stock: 0, // Stock out
    type: 'voucher',
    imageUrl: '',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: 'admin1'
  },
  {
    id: '2',
    title: 'Reusable Water Bottle',
    description: 'Eco-friendly reusable water bottle',
    coinCost: 500,
    stock: 25,
    type: 'product',
    imageUrl: '',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: 'admin1'
  },
  {
    id: '3',
    title: 'Electricity Bill Credit',
    description: '₹50 credit towards your electricity bill',
    coinCost: 1500,
    stock: 10,
    type: 'credit',
    imageUrl: '',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: 'admin1'
  }
];

// Calculate redemption statistics
function calculateRedemptionStats(redemptions: Redemption[]): RedemptionStats {
  const totalRedemptions = redemptions.length;
  const successfulRedemptions = redemptions.filter(r => r.status === 'success').length;
  const failedRedemptions = redemptions.filter(r => r.status === 'failed').length;
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending').length;
  
  const successRate = totalRedemptions > 0 ? (successfulRedemptions / totalRedemptions) * 100 : 0;
  const failureRate = totalRedemptions > 0 ? (failedRedemptions / totalRedemptions) * 100 : 0;
  
  return {
    totalRedemptions,
    successfulRedemptions,
    failedRedemptions,
    pendingRedemptions,
    successRate,
    failureRate
  };
}

// Calculate reward performance
function calculateRewardPerformance(redemptions: Redemption[], rewards: Reward[]): RewardPerformance[] {
  const rewardMap = new Map<string, RewardPerformance>();
  
  // Initialize with all rewards
  rewards.forEach(reward => {
    rewardMap.set(reward.id, {
      rewardId: reward.id,
      rewardTitle: reward.title,
      totalRedemptions: 0,
      totalCoinsSpent: 0,
      avgCoinsPerRedemption: 0,
      stockOutCount: reward.stock <= 0 ? 1 : 0
    });
  });
  
  // Process redemptions
  redemptions.forEach(redemption => {
    const rewardPerf = rewardMap.get(redemption.rewardId);
    if (rewardPerf) {
      rewardPerf.totalRedemptions += 1;
      rewardPerf.totalCoinsSpent += redemption.coinsSpent;
      rewardPerf.avgCoinsPerRedemption = rewardPerf.totalRedemptions > 0 
        ? rewardPerf.totalCoinsSpent / rewardPerf.totalRedemptions 
        : 0;
    }
  });
  
  return Array.from(rewardMap.values());
}

// Calculate daily trends
function calculateDailyTrends(redemptions: Redemption[]): DailyRedemptionTrend[] {
  const trendMap = new Map<string, { redemptions: number; coinsSpent: number }>();
  
  redemptions.forEach(redemption => {
    const date = redemption.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const trend = trendMap.get(date) || { redemptions: 0, coinsSpent: 0 };
    trend.redemptions += 1;
    trend.coinsSpent += redemption.coinsSpent;
    trendMap.set(date, trend);
  });
  
  return Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      redemptions: data.redemptions,
      coinsSpent: data.coinsSpent
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Get stock out alerts
function getStockOutAlerts(rewards: Reward[]): { rewardId: string; rewardTitle: string; stock: number }[] {
  return rewards
    .filter(reward => reward.stock <= 5) // Alert if stock is 5 or less
    .map(reward => ({
      rewardId: reward.id,
      rewardTitle: reward.title,
      stock: reward.stock
    }));
}

// Get failure alerts (10%+ failure rate in last hour)
function getFailureAlerts(redemptions: Redemption[]): { hour: string; failureRate: number }[] {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  // Filter redemptions from last hour
  const recentRedemptions = redemptions.filter(r => 
    r.createdAt >= oneHourAgo && r.createdAt <= now
  );
  
  if (recentRedemptions.length === 0) return [];
  
  const failedCount = recentRedemptions.filter(r => r.status === 'failed').length;
  const failureRate = (failedCount / recentRedemptions.length) * 100;
  
  // Alert if failure rate is 10% or higher
  if (failureRate >= 10) {
    const hour = now.getHours().toString().padStart(2, '0') + ':00';
    return [{ hour, failureRate }];
  }
  
  return [];
}

// Get analytics data
export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const live = await getRewardsAnalyticsDataFn();
    return live as AnalyticsData;
  } catch (error) {
    console.warn('Falling back to mock analytics data:', error);
    const redemptionStats = calculateRedemptionStats(mockRedemptions);
    const topRewards = calculateRewardPerformance(mockRedemptions, mockRewards);
    const dailyTrends = calculateDailyTrends(mockRedemptions);
    const stockOutAlerts = getStockOutAlerts(mockRewards);
    const failureAlerts = getFailureAlerts(mockRedemptions);
    return { redemptionStats, topRewards, dailyTrends, stockOutAlerts, failureAlerts };
  }
}

// Get total coins redeemed
export async function getTotalCoinsRedeemed(): Promise<number> {
  try {
    return await getTotalCoinsRedeemedFn();
  } catch (error) {
    console.warn('Falling back to mock total coins:', error);
    return mockRedemptions
      .filter(r => r.status === 'success')
      .reduce((total, redemption) => total + redemption.coinsSpent, 0);
  }
}

// Get redemption trends for a specific period
export async function getRedemptionTrends(
  startDate: Date,
  endDate: Date
): Promise<{ date: string; redemptions: number; coins: number }[]> {
  try {
    return await getRedemptionTrendsFn(startDate.toISOString(), endDate.toISOString());
  } catch (error) {
    console.warn('Falling back to mock redemption trends:', error);
    const filteredRedemptions = mockRedemptions.filter(r => 
      r.createdAt >= startDate && r.createdAt <= endDate
    );
    const trendMap = new Map<string, { redemptions: number; coins: number }>();
    filteredRedemptions.forEach(redemption => {
      const date = redemption.createdAt.toISOString().split('T')[0];
      const trend = trendMap.get(date) || { redemptions: 0, coins: 0 };
      trend.redemptions += 1;
      trend.coins += redemption.coinsSpent;
      trendMap.set(date, trend);
    });
    return Array.from(trendMap.entries()).map(([date, data]) => ({ date, redemptions: data.redemptions, coins: data.coins }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}