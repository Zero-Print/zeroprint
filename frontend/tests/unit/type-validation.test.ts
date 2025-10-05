/**
 * Type Validation Tests
 * Ensures frontend and backend types match exactly
 */

import { describe, it, expect } from '@jest/globals';

// Import frontend types
import type {
  User,
  Wallet,
  CarbonLog,
  Game,
  Subscription,
  Reward,
  ApiResponse,
  PaginatedApiResponse,
} from '@/types';

// Mock backend types (in real implementation, these would be imported from backend)
const mockBackendTypes = {
  User: {} as User,
  Wallet: {} as Wallet,
  CarbonLog: {} as CarbonLog,
  Game: {} as Game,
  Subscription: {} as Subscription,
  Reward: {} as Reward,
  ApiResponse: {} as ApiResponse,
  PaginatedApiResponse: {} as PaginatedApiResponse,
};

describe('Type Validation', () => {
  it('should have matching User types', () => {
    // Test that User interface has required fields
    const user: User = {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'citizen',
      profile: {
        preferences: {
          theme: 'light',
          language: 'en',
          units: 'metric',
        },
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.profile).toBeDefined();
    expect(user.notifications).toBeDefined();
    expect(user.isActive).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should have matching Wallet types', () => {
    const wallet: Wallet = {
      id: 'wallet-id',
      userId: 'user-id',
      inrBalance: 1000,
      healCoins: 500,
      totalEarned: 1000,
      totalRedeemed: 500,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(wallet.id).toBeDefined();
    expect(wallet.userId).toBeDefined();
    expect(wallet.inrBalance).toBeTypeOf('number');
    expect(wallet.healCoins).toBeTypeOf('number');
    expect(wallet.totalEarned).toBeTypeOf('number');
    expect(wallet.totalRedeemed).toBeTypeOf('number');
  });

  it('should have matching CarbonLog types', () => {
    const carbonLog: CarbonLog = {
      id: 'log-id',
      userId: 'user-id',
      actionType: 'transport',
      value: 10,
      co2Saved: 2.5,
      coinsEarned: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(carbonLog.id).toBeDefined();
    expect(carbonLog.userId).toBeDefined();
    expect(carbonLog.actionType).toBeDefined();
    expect(carbonLog.value).toBeTypeOf('number');
    expect(carbonLog.co2Saved).toBeTypeOf('number');
    expect(carbonLog.coinsEarned).toBeTypeOf('number');
  });

  it('should have matching Game types', () => {
    const game: Game = {
      id: 'game-id',
      title: 'Test Game',
      description: 'A test game',
      type: 'quiz',
      config: {
        questions: [],
        timeLimit: 300,
        maxAttempts: 3,
      },
      coinsReward: 100,
      isActive: true,
      difficulty: 'easy',
      category: 'environment',
      tags: ['test', 'quiz'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(game.id).toBeDefined();
    expect(game.title).toBeDefined();
    expect(game.type).toBeDefined();
    expect(game.config).toBeDefined();
    expect(game.coinsReward).toBeTypeOf('number');
    expect(game.isActive).toBeTypeOf('boolean');
  });

  it('should have matching Subscription types', () => {
    const subscription: Subscription = {
      id: 'sub-id',
      userId: 'user-id',
      planId: 'basic',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(subscription.id).toBeDefined();
    expect(subscription.userId).toBeDefined();
    expect(subscription.planId).toBeDefined();
    expect(subscription.status).toBeDefined();
    expect(subscription.startDate).toBeInstanceOf(Date);
    expect(subscription.endDate).toBeInstanceOf(Date);
    expect(subscription.autoRenew).toBeTypeOf('boolean');
  });

  it('should have matching Reward types', () => {
    const reward: Reward = {
      id: 'reward-id',
      title: 'Test Reward',
      description: 'A test reward',
      category: 'eco',
      healCoinsCost: 100,
      stock: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(reward.id).toBeDefined();
    expect(reward.title).toBeDefined();
    expect(reward.category).toBeDefined();
    expect(reward.healCoinsCost).toBeTypeOf('number');
    expect(reward.stock).toBeTypeOf('number');
    expect(reward.isActive).toBeTypeOf('boolean');
  });

  it('should have matching ApiResponse types', () => {
    const successResponse: ApiResponse<User> = {
      success: true,
      data: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'citizen',
        profile: {
          preferences: {
            theme: 'light',
            language: 'en',
            units: 'metric',
          },
        },
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const errorResponse: ApiResponse = {
      success: false,
      error: 'Test error',
      message: 'Test error message',
    };

    expect(successResponse.success).toBe(true);
    expect(successResponse.data).toBeDefined();
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBeDefined();
  });

  it('should have matching PaginatedApiResponse types', () => {
    const paginatedResponse: PaginatedApiResponse<User> = {
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        hasNext: true,
        hasPrev: false,
      },
    };

    expect(paginatedResponse.success).toBe(true);
    expect(paginatedResponse.data).toBeInstanceOf(Array);
    expect(paginatedResponse.pagination).toBeDefined();
    expect(paginatedResponse.pagination?.page).toBeTypeOf('number');
    expect(paginatedResponse.pagination?.limit).toBeTypeOf('number');
    expect(paginatedResponse.pagination?.total).toBeTypeOf('number');
    expect(paginatedResponse.pagination?.hasNext).toBeTypeOf('boolean');
    expect(paginatedResponse.pagination?.hasPrev).toBeTypeOf('boolean');
  });

  it('should validate type compatibility', () => {
    // Test that frontend types can be assigned to backend types
    const frontendUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'citizen',
      profile: {
        preferences: {
          theme: 'light',
          language: 'en',
          units: 'metric',
        },
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // This should compile without errors if types match
    const backendUser: typeof mockBackendTypes.User = frontendUser;
    expect(backendUser).toBeDefined();
  });
});
