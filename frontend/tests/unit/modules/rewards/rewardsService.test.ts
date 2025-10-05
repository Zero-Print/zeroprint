import { getRewards, redeemCoins, getUserRedemptions, addReward, updateReward, deleteReward } from '@/modules/rewards/rewardsService';

jest.mock('@/lib/services/rewardsClient', () => ({
  fetchRewards: jest.fn().mockResolvedValue([
    { rewardId: 'rew_1', title: 'Voucher 100', coinCost: 1000, stock: 5, type: 'voucher', createdAt: new Date().toISOString(), createdBy: 'admin', isActive: true },
  ]),
  fetchRewardById: jest.fn(),
  redeemReward: jest.fn().mockResolvedValue({ redemptionId: 'red_1', voucherCode: 'AMZ-123', rewardTitle: 'Voucher 100' }),
  fetchUserRedemptions: jest.fn().mockResolvedValue([
    { redemptionId: 'red_1', userId: 'user_1', rewardId: 'rew_1', coinsSpent: 1000, status: 'success', createdAt: new Date().toISOString(), processedBy: 'system' },
  ]),
  fetchAllRedemptions: jest.fn().mockResolvedValue([]),
  addRewardFn: jest.fn().mockResolvedValue('rew_new'),
  updateRewardFn: jest.fn().mockResolvedValue(undefined),
  deleteRewardFn: jest.fn().mockResolvedValue(undefined),
}));

describe('rewardsService', () => {
  it('getRewards maps backend rewards to UI model', async () => {
    const rewards = await getRewards();
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({ id: 'rew_1', title: 'Voucher 100', coinCost: 1000, stock: 5, type: 'voucher' });
  });

  it('redeemCoins returns success and redemptionId', async () => {
    const res = await redeemCoins('user_1', 'rew_1');
    expect(res.success).toBe(true);
    expect(res.redemptionId).toBe('red_1');
  });

  it('getUserRedemptions maps backend redemptions', async () => {
    const list = await getUserRedemptions('user_1');
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'red_1', userId: 'user_1', rewardId: 'rew_1', status: 'success' });
  });

  it('add/update/delete reward proxies to backend functions', async () => {
    const id = await addReward({ title: 'New', coinCost: 500, stock: 10, type: 'product', createdBy: 'admin', createdAt: new Date(), description: '', imageUrl: '' } as any);
    expect(id).toBe('rew_new');
    await expect(updateReward('rew_new', { stock: 20 })).resolves.toBeUndefined();
    await expect(deleteReward('rew_new')).resolves.toBeUndefined();
  });
});


