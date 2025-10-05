// Rewards Service - Handles operations for rewards and redemptions

import {
  fetchRewards as cfFetchRewards,
  fetchRewardById as cfFetchRewardById,
  redeemReward as cfRedeemReward,
  fetchUserRedemptions as cfFetchUserRedemptions,
  fetchAllRedemptions as cfFetchAllRedemptions,
  addRewardFn as cfAddReward,
  updateRewardFn as cfUpdateReward,
  deleteRewardFn as cfDeleteReward
} from '@/lib/services/rewardsClient';

// Mock Timestamp for demo purposes
const Timestamp = {
  now: () => new Date()
};

// Reward interface
export interface Reward {
  id: string;
  title: string;
  description?: string;
  coinCost: number;
  stock: number;
  type: 'voucher' | 'product' | 'credit';
  imageUrl?: string;
  partnerId?: string;
  createdAt: Date;
  createdBy: string;
}

// Redemption interface
export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  coinsSpent: number;
  status: 'success' | 'failed' | 'pending';
  voucherCode?: string;
  createdAt: Date;
  processedBy: string;
}

// Audit Log interface
export interface AuditLog {
  id: string;
  userId: string;
  actionType: string;
  details: any;
  timestamp: Date;
}

// Activity Log interface
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
}

// Error Log interface
export interface ErrorLog {
  id: string;
  userId?: string;
  errorCode: string;
  errorMessage: string;
  details: any;
  timestamp: Date;
}

// Mock data
let mockRewards: Reward[] = [
  {
    id: '1',
    title: 'Amazon Voucher ₹100',
    description: 'Redeem for a ₹100 Amazon voucher',
    coinCost: 1000,
    stock: 50,
    type: 'voucher',
    imageUrl: '',
    createdAt: new Date(),
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
    createdAt: new Date(),
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
    createdAt: new Date(),
    createdBy: 'admin1'
  }
];

let mockRedemptions: Redemption[] = [
  {
    id: 'r1',
    userId: 'user1',
    rewardId: '1',
    coinsSpent: 1000,
    status: 'success',
    voucherCode: 'AMZ-123-XYZ',
    createdAt: new Date(),
    processedBy: 'system'
  },
  {
    id: 'r2',
    userId: 'user2',
    rewardId: '2',
    coinsSpent: 500,
    status: 'pending',
    createdAt: new Date(),
    processedBy: 'admin1'
  }
];

// Get all rewards
export async function getRewards(): Promise<Reward[]> {
  try {
    const list = await cfFetchRewards();
    // map backend Reward -> frontend Reward shape
    return list.map((r: any) => ({
      id: r.rewardId,
      title: r.title,
      description: r.description,
      coinCost: r.coinCost,
      stock: r.stock,
      type: r.type,
      imageUrl: r.imageUrl,
      partnerId: r.partnerId,
      createdAt: new Date(r.createdAt),
      createdBy: r.createdBy,
    }));
  } catch (error) {
    console.warn('Falling back to mock rewards:', error);
    return [...mockRewards];
  }
}

// Get reward by ID
export async function getRewardById(rewardId: string): Promise<Reward | null> {
  try {
    const r: any = await cfFetchRewardById(rewardId);
    return {
      id: r.rewardId,
      title: r.title,
      description: r.description,
      coinCost: r.coinCost,
      stock: r.stock,
      type: r.type,
      imageUrl: r.imageUrl,
      partnerId: r.partnerId,
      createdAt: new Date(r.createdAt),
      createdBy: r.createdBy,
    };
  } catch (error) {
    console.warn('Falling back to mock reward:', error);
    const reward = mockRewards.find(r => r.id === rewardId) || null;
    return reward;
  }
}

// Add new reward
export async function addReward(rewardData: Omit<Reward, 'id' | 'createdAt'>): Promise<string> {
  const id = await cfAddReward({
    title: rewardData.title,
    description: rewardData.description,
    coinCost: rewardData.coinCost,
    stock: rewardData.stock,
    type: rewardData.type as any,
    imageUrl: rewardData.imageUrl,
    partnerId: rewardData.partnerId,
  });
  return id;
}

// Update reward
export async function updateReward(rewardId: string, rewardData: Partial<Reward>): Promise<void> {
  await cfUpdateReward(rewardId, rewardData as any);
}

// Delete reward
export async function deleteReward(rewardId: string): Promise<void> {
  await cfDeleteReward(rewardId);
}

// Get user redemptions
export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  try {
    const list = await cfFetchUserRedemptions(userId);
    return list.map((r: any) => ({
      id: r.redemptionId,
      userId: r.userId,
      rewardId: r.rewardId,
      coinsSpent: r.coinsSpent,
      status: r.status,
      voucherCode: r.voucherCode,
      createdAt: new Date(r.createdAt),
      processedBy: r.processedBy,
    }));
  } catch (error) {
    console.warn('Falling back to mock redemptions:', error);
    return [...mockRedemptions];
  }
}

// Get all redemptions (admin)
export async function getAllRedemptions(): Promise<Redemption[]> {
  const list = await cfFetchAllRedemptions();
  return list.map((r: any) => ({
    id: r.redemptionId,
    userId: r.userId,
    rewardId: r.rewardId,
    coinsSpent: r.coinsSpent,
    status: r.status,
    voucherCode: r.voucherCode,
    createdAt: new Date(r.createdAt),
    processedBy: r.processedBy,
  }));
}

// Redeem reward
export async function redeemCoins(userId: string, rewardId: string): Promise<{ success: boolean; message: string }>{
  await cfRedeemReward(userId, rewardId);
  return { success: true, message: 'Redemption processed successfully' };
}

// Add audit log entry
export async function addAuditLog(logData: Omit<AuditLog, 'id'>): Promise<void> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Audit log added:', logData);
    // In a real implementation, this would add to the auditLogs collection
  } catch (error) {
    console.error('Error adding audit log:', error);
    // We don't throw an error here as audit logs are secondary
  }
}

// Add activity log entry
export async function addActivityLog(logData: Omit<ActivityLog, 'id'>): Promise<void> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Activity log added:', logData);
    // In a real implementation, this would add to the activityLogs collection
  } catch (error) {
    console.error('Error adding activity log:', error);
    // We don't throw an error here as activity logs are secondary
  }
}

// Add error log entry
export async function addErrorLog(logData: Omit<ErrorLog, 'id'>): Promise<void> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Error log added:', logData);
    // In a real implementation, this would add to the errorLogs collection
  } catch (error) {
    console.error('Error adding error log:', error);
    // We don't throw an error here as error logs are secondary
  }
}