// Mock collections for demo purposes
// This provides demo data instead of connecting to Firestore

import { User, Wallet, Transaction, CarbonLog, MentalHealthLog, AnimalWelfareLog, Leaderboard } from '@/types';

// Mock data
const MOCK_WALLET: Wallet = {
  userId: 'demo-user-1',
  balance: 250,
  transactions: [
    {
      id: 'tx-1',
      transactionId: 'tx-1',
      userId: 'demo-user-1',
      walletId: 'wallet-1',
      type: 'earn',
      amount: 50,
      source: 'carbon-tracking',
      description: 'Carbon tracking reward',
      status: 'completed',
      auditLogId: 'audit-1',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: 'tx-2',
      transactionId: 'tx-2',
      userId: 'demo-user-1',
      walletId: 'wallet-1',
      type: 'earn',
      amount: 100,
      source: 'quiz-completion',
      description: 'Quiz completion reward',
      status: 'completed',
      auditLogId: 'audit-2',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      id: 'tx-3',
      transactionId: 'tx-3',
      userId: 'demo-user-1',
      walletId: 'wallet-1',
      type: 'redeem',
      amount: 30,
      source: 'reward-redemption',
      description: 'Plant tree reward redemption',
      status: 'completed',
      auditLogId: 'audit-3',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  updatedAt: new Date(),
};

const MOCK_CARBON_LOGS: CarbonLog[] = [
  {
    id: 'carbon-1',
    logId: 'carbon-1',
    userId: 'demo-user-1',
    actionType: 'transport',
    action: 'transport',
    categoryId: 'transport',
    category: 'transport',
    value: 2.5,
    quantity: 2.5,
    unit: 'kg CO2',
    transportMode: 'cycling',
    co2Saved: 2.5,
    coinsEarned: 25,
    description: 'Cycled to work instead of driving',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 'carbon-2',
    logId: 'carbon-2',
    userId: 'demo-user-1',
    actionType: 'energy',
    action: 'energy',
    categoryId: 'energy',
    category: 'energy',
    value: 5.0,
    quantity: 5.0,
    unit: 'kg CO2',
    co2Saved: 5.0,
    coinsEarned: 50,
    description: 'Used solar panels for home energy',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
  },
  {
    id: 'carbon-3',
    logId: 'carbon-3',
    userId: 'demo-user-1',
    actionType: 'waste',
    action: 'waste',
    categoryId: 'waste',
    category: 'waste',
    value: 1.2,
    quantity: 1.2,
    unit: 'kg CO2',
    co2Saved: 1.2,
    coinsEarned: 12,
    description: 'Composted organic waste',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
  },
];

const MOCK_MENTAL_HEALTH_LOGS: MentalHealthLog[] = [
  {
    id: 'mental-1',
    logId: 'mental-1',
    userId: 'demo-user-1',
    mood: 'excellent',
    score: 85,
    note: 'Feeling great about my eco actions today!',
    factors: ['eco-actions', 'community'],
    coinsEarned: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: 'mental-2',
    logId: 'mental-2',
    userId: 'demo-user-1',
    mood: 'good',
    score: 75,
    note: 'Good day for sustainability',
    factors: ['sustainability'],
    coinsEarned: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
  },
];

const MOCK_ANIMAL_WELFARE_LOGS: AnimalWelfareLog[] = [
  {
    id: 'animal-1',
    logId: 'animal-1',
    userId: 'demo-user-1',
    actions: ['rescue', 'adoption'],
    kindnessScore: 90,
    coinsEarned: 20,
    details: { location: 'local shelter', impact: 'high' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
  },
];

// Mock collections with promises to simulate async operations
export const walletsCollection = {
  async getByUserId(userId: string): Promise<Wallet | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return userId ? MOCK_WALLET : null;
  },

  async updateBalance(userId: string, newBalance: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    MOCK_WALLET.balance = newBalance;
  },

  async getTransactions(userId: string, options: any = {}): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      data: MOCK_WALLET.transactions,
      hasMore: false,
    };
  }
};

export const carbonLogsCollection = {
  async getByUserId(userId: string, options: any = {}): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      data: userId ? MOCK_CARBON_LOGS : [],
      hasMore: false,
    };
  },

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<CarbonLog[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return userId ? MOCK_CARBON_LOGS : [];
  },

  async create(logData: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'new-log-id';
  }
};

export const mentalHealthLogsCollection = {
  async getByUserId(userId: string, options: any = {}): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      data: userId ? MOCK_MENTAL_HEALTH_LOGS : [],
      hasMore: false,
    };
  },

  async create(logData: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'new-mental-log-id';
  }
};

export const animalWelfareLogsCollection = {
  async getByUserId(userId: string, options: any = {}): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      data: userId ? MOCK_ANIMAL_WELFARE_LOGS : [],
      hasMore: false,
    };
  },

  async create(logData: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'new-animal-log-id';
  }
};

export const usersCollection = {
  async getByRole(role: string, options: any = {}): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      data: [],
      hasMore: false,
    };
  },

  async getUserActivities(userId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      {
        id: 'activity-1',
        type: 'carbon_log',
        description: 'Logged carbon savings',
        timestamp: new Date(),
      },
      {
        id: 'activity-2',
        type: 'game_completed',
        description: 'Completed sustainability quiz',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
    ];
  }
};

export const leaderboardsCollection = {
  async getByScope(scope: string, period: string): Promise<Leaderboard | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      leaderboardId: 'demo-leaderboard',
      type: 'citizen',
      period: 'weekly',
      entries: [
        {
          id: 'leaderboard-1',
          userId: 'demo-user-1',
          name: 'Vikash Kumar',
          displayName: 'Vikash Kumar',
          score: 250,
          rank: 1,
          metrics: {
            environmental: 85,
            social: 90,
            governance: 80,
            esgScore: 85,
            overallScore: 85,
            activityScore: 90
          },
          previousRank: 2,
          rankChange: 1,
          percentile: 95,
          badge: 'Eco Champion',
          achievements: ['carbon-neutral', 'community-leader'],
          lastUpdated: new Date(),
          category: 'overall',
          change: 1
        },
        {
          id: 'leaderboard-2',
          userId: 'demo-user-2',
          name: 'Sustainability Champion',
          displayName: 'Sustainability Champion',
          score: 200,
          rank: 2,
          metrics: {
            environmental: 90,
            social: 85,
            governance: 75,
            esgScore: 83,
            overallScore: 83,
            activityScore: 85
          },
          previousRank: 1,
          rankChange: -1,
          percentile: 90,
          badge: 'Green Leader',
          achievements: ['sustainability-expert'],
          lastUpdated: new Date(),
          category: 'overall',
          change: -1
        },
      ],
      lastUpdated: new Date(),
    };
  },

  async getTopUsers(scope: string, period: string, limit: number = 10): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { userId: 'demo-user-1', displayName: 'Vikash Kumar', score: 250, rank: 1 },
      { userId: 'demo-user-2', displayName: 'Sustainability Champion', score: 200, rank: 2 },
    ];
  }
};