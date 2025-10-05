// Mock analytics for demo purposes
// This provides demo analytics data instead of connecting to Firestore

import { walletsCollection, carbonLogsCollection, mentalHealthLogsCollection, animalWelfareLogsCollection } from './mockCollections';

export interface EcoStats {
  totalCO2Saved: number;
  weeklyTrend: number;
  monthlyTrend: number;
  currentStreak: number;
  ecoScore: number;
  topActivity: string;
}

export interface WalletStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  transactionCount: number;
}

export interface MentalHealthStats {
  currentMoodScore: number;
  averageMoodScore: number;
  ecoMindScore: number;
  weeklyTrend: number;
  monthlyTrend: number;
  streakDays: number;
}

export interface AnimalWelfareStats {
  kindnessScore: number;
  totalActions: number;
  weeklyActions: number;
  monthlyActions: number;
  streakDays: number;
  favoriteAction?: string;
}

export const citizenAnalytics = {
  async getEcoStats(userId: string): Promise<EcoStats> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!userId) {
      return {
        totalCO2Saved: 0,
        weeklyTrend: 0,
        monthlyTrend: 0,
        currentStreak: 0,
        ecoScore: 0,
        topActivity: 'none',
      };
    }

    // Return demo data
    return {
      totalCO2Saved: 28.7,
      weeklyTrend: 15.2,
      monthlyTrend: 8.5,
      currentStreak: 7,
      ecoScore: 85,
      topActivity: 'transport',
    };
  },

  async getWalletStats(userId: string): Promise<WalletStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!userId) {
      return {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        transactionCount: 0,
      };
    }

    const wallet = await walletsCollection.getByUserId(userId);
    const transactions = await walletsCollection.getTransactions(userId);

    const totalEarned = transactions.data
      .filter((t: any) => t.type === 'earn')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalSpent = transactions.data
      .filter((t: any) => t.type === 'redeem')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return {
      balance: wallet?.balance || 0,
      totalEarned,
      totalSpent,
      weeklyEarnings: 50,
      monthlyEarnings: 150,
      transactionCount: transactions.data.length,
    };
  },

  async getMentalHealthStats(userId: string): Promise<MentalHealthStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!userId) {
      return {
        currentMoodScore: 0,
        averageMoodScore: 0,
        ecoMindScore: 0,
        weeklyTrend: 0,
        monthlyTrend: 0,
        streakDays: 0,
      };
    }

    return {
      currentMoodScore: 4,
      averageMoodScore: 3.5,
      ecoMindScore: 85,
      weeklyTrend: 4.2,
      monthlyTrend: 3.8,
      streakDays: 5,
    };
  },

  async getAnimalWelfareStats(userId: string): Promise<AnimalWelfareStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!userId) {
      return {
        kindnessScore: 0,
        totalActions: 0,
        weeklyActions: 0,
        monthlyActions: 0,
        streakDays: 0,
      };
    }

    return {
      kindnessScore: 90,
      totalActions: 12,
      weeklyActions: 3,
      monthlyActions: 12,
      streakDays: 3,
      favoriteAction: 'fedStray',
    };
  },

  async getGameStats(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!userId) {
      return {
        friendsCount: 0,
        localRank: 0,
        challengesCompleted: 0,
        level: 1,
        experience: 0,
      };
    }

    return {
      friendsCount: 28,
      localRank: 15,
      challengesCompleted: 8,
      level: 5,
      experience: 2350,
    };
  },

  async getUserActivities(userId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!userId) {
      return [];
    }

    return [
      {
        id: 'activity-1',
        type: 'carbon_log',
        description: 'Logged carbon savings',
        timestamp: new Date().toISOString(),
        action: 'Logged bike commute',
        metadata: { pointsEarned: 10 },
      },
      {
        id: 'activity-2',
        type: 'game_completed',
        description: 'Completed sustainability quiz',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        action: 'Completed eco quiz',
        metadata: { pointsEarned: 15 },
      },
      {
        id: 'activity-3',
        type: 'environmental_action',
        description: 'Planted a tree',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        action: 'Planted a tree',
        metadata: { pointsEarned: 25 },
      },
    ];
  }
};

export const entityAnalytics = {
  async getEntityStats(entityId: string, entityType: 'school' | 'msme'): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      totalCO2Saved: 150.5,
      totalHealCoins: 1250,
      activeUsers: 25,
      totalUsers: 30,
      avgEcoScore: 75,
      monthlyProgress: 12.5,
    };
  }
};