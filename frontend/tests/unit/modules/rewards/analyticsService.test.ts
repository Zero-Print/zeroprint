import { getAnalyticsData, getTotalCoinsRedeemed, getRedemptionTrends } from '@/modules/rewards/analyticsService';

jest.mock('@/lib/services/rewardsClient', () => ({
  getRewardsAnalyticsDataFn: jest.fn().mockResolvedValue({
    redemptionStats: { totalRedemptions: 3, successfulRedemptions: 2, failedRedemptions: 1, pendingRedemptions: 0, successRate: 66.7, failureRate: 33.3 },
    topRewards: [],
    dailyTrends: [],
    stockOutAlerts: [],
    failureAlerts: [],
  }),
  getTotalCoinsRedeemedFn: jest.fn().mockResolvedValue(2500),
  getRedemptionTrendsFn: jest.fn().mockResolvedValue([{ date: '2025-09-01', redemptions: 2, coins: 2000 }]),
}));

describe('analyticsService', () => {
  it('returns analytics data from backend', async () => {
    const d = await getAnalyticsData();
    expect(d.redemptionStats.totalRedemptions).toBe(3);
  });

  it('returns total coins redeemed', async () => {
    const total = await getTotalCoinsRedeemed();
    expect(total).toBe(2500);
  });

  it('returns redemption trends', async () => {
    const trends = await getRedemptionTrends(new Date('2025-09-01'), new Date('2025-09-02'));
    expect(trends[0].date).toBe('2025-09-01');
  });
});


