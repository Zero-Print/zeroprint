// Mock the rewards client functions
jest.mock('@/lib/services/rewardsClient', () => ({
  fetchRewards: jest.fn(),
  fetchRewardById: jest.fn(),
  redeemReward: jest.fn(),
  fetchUserRedemptions: jest.fn(),
  fetchAllRedemptions: jest.fn(),
  addRewardFn: jest.fn(),
  updateRewardFn: jest.fn(),
  deleteRewardFn: jest.fn(),
}));

import { getRewards, redeemCoins, getUserRedemptions, addReward, updateReward, deleteReward } from '@/modules/rewards/rewardsService';
import { 
  fetchRewards as mockFetchRewards, 
  redeemReward as mockRedeemReward, 
  fetchUserRedemptions as mockFetchUserRedemptions,
  addRewardFn as mockAddRewardFn,
  updateRewardFn as mockUpdateRewardFn,
  deleteRewardFn as mockDeleteRewardFn
} from '@/lib/services/rewardsClient';

describe('rewardsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRewards maps backend rewards to UI model', async () => {
    mockFetchRewards.mockResolvedValue([
      { rewardId: 'rew_1', title: 'Voucher 100', coinCost: 1000, stock: 5, type: 'voucher', createdAt: new Date().toISOString(), createdBy: 'admin', isActive: true },
    ]);
    
    const rewards = await getRewards();
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({ id: 'rew_1', title: 'Voucher 100', coinCost: 1000, stock: 5, type: 'voucher' });
  });

  it('redeemCoins returns success and message', async () => {
    mockRedeemReward.mockResolvedValue({ redemptionId: 'red_1', voucherCode: 'AMZ-123', rewardTitle: 'Voucher 100' });
    
    const res = await redeemCoins('user_1', 'rew_1');
    expect(res.success).toBe(true);
    expect(res.message).toBe('Redemption processed successfully');
  });

  it('getUserRedemptions maps backend redemptions', async () => {
    mockFetchUserRedemptions.mockResolvedValue([
      { redemptionId: 'red_1', userId: 'user_1', rewardId: 'rew_1', coinsSpent: 1000, status: 'success', createdAt: new Date().toISOString(), processedBy: 'system' },
    ]);
    
    const list = await getUserRedemptions('user_1');
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'red_1', userId: 'user_1', rewardId: 'rew_1', status: 'success' });
  });

  it('add/update/delete reward proxies to backend functions', async () => {
    mockAddRewardFn.mockResolvedValue('rew_new');
    mockUpdateRewardFn.mockResolvedValue(undefined);
    mockDeleteRewardFn.mockResolvedValue(undefined);
    
    const id = await addReward({ title: 'New', coinCost: 500, stock: 10, type: 'product', createdBy: 'admin', createdAt: new Date(), description: '', imageUrl: '' } as any);
    expect(id).toBe('rew_new');
    await expect(updateReward('rew_new', { stock: 20 })).resolves.toBeUndefined();
    await expect(deleteReward('rew_new')).resolves.toBeUndefined();
  });
});


