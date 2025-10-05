'use client';

import { useState, useEffect } from 'react';
import { 
  getRewards, 
  getUserRedemptions, 
  getAllRedemptions, 
  redeemCoins,
  addReward,
  updateReward,
  deleteReward
} from './rewardsService';
import { Reward, Redemption } from './rewardsService';

export function useRewards(userId?: string) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rewards
  const fetchRewards = async () => {
    try {
      setLoading(true);
      const rewardsData = await getRewards();
      setRewards(rewardsData);
    } catch (err) {
      setError('Failed to fetch rewards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch redemptions
  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      if (userId) {
        // Fetch user redemptions
        const userRedemptions = await getUserRedemptions(userId);
        setRedemptions(userRedemptions);
      } else {
        // Fetch all redemptions (admin)
        const allRedemptions = await getAllRedemptions();
        setRedemptions(allRedemptions);
      }
    } catch (err) {
      setError('Failed to fetch redemptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Redeem a reward
  const handleRedeem = async (rewardId: string): Promise<void> => {
    if (!userId) {
      throw new Error('User ID is required to redeem rewards');
    }
    
    try {
      const result = await redeemCoins(userId, rewardId);
      if (result.success) {
        // Refresh rewards and redemptions after successful redemption
        await fetchRewards();
        await fetchRedemptions();
      }
    } catch (err) {
      setError('Failed to redeem reward');
      console.error(err);
      throw err;
    }
  };

  // Add a new reward (admin only)
  const handleAddReward = async (): Promise<void> => {
    try {
      // This should be handled by the form component
      await fetchRewards(); // Refresh rewards list
    } catch (err) {
      setError('Failed to add reward');
      console.error(err);
      throw err;
    }
  };

  // Update a reward (admin only)
  const handleUpdateReward = async (rewardId: string): Promise<void> => {
    try {
      // This should be handled by the form component
      await fetchRewards(); // Refresh rewards list
    } catch (err) {
      setError('Failed to update reward');
      console.error(err);
      throw err;
    }
  };

  // Delete a reward (admin only)
  const handleDeleteReward = async (rewardId: string): Promise<void> => {
    try {
      await deleteReward(rewardId);
      await fetchRewards(); // Refresh rewards list
    } catch (err) {
      setError('Failed to delete reward');
      console.error(err);
      throw err;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRewards();
    if (userId) {
      fetchRedemptions();
    }
  }, [userId]);

  return {
    rewards,
    redemptions,
    loading,
    error,
    fetchRewards,
    fetchRedemptions,
    handleRedeem,
    handleAddReward,
    handleUpdateReward,
    handleDeleteReward
  };
}