import {
  GameScore,
  GameResult,
  GameType,
  LeaderboardEntry,
  ActivityLog,
  AuditLog,
} from '@/types/games';
import { api } from '@/lib/api';

export interface GameCompletionData {
  gameId: string;
  gameType: GameType;
  score: number;
  maxScore: number;
  completionTime: number;
  metadata: Record<string, any>;
  userId: string;
}

export interface EarnCoinsResponse {
  success: boolean;
  coinsEarned: number;
  newBalance: number;
  error?: string;
}

export interface LeaderboardUpdate {
  success: boolean;
  newRank?: number;
  error?: string;
}

export class GameIntegrationService {
  private static instance: GameIntegrationService;
  private dailyCoinLimit = 500;
  private dailyCoinsEarned = 0;
  private lastResetDate = new Date().toDateString();

  static getInstance(): GameIntegrationService {
    if (!GameIntegrationService.instance) {
      GameIntegrationService.instance = new GameIntegrationService();
    }
    return GameIntegrationService.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadDailyProgress();
    }
  }

  private loadDailyProgress(): void {
    if (typeof window === 'undefined') return;
    const today = new Date().toDateString();
    const stored = localStorage.getItem('dailyGameCoins');
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        this.dailyCoinsEarned = data.earned;
      } else {
        this.dailyCoinsEarned = 0;
        this.saveDailyProgress();
      }
    }
    this.lastResetDate = today;
  }

  private saveDailyProgress(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dailyGameCoins', JSON.stringify({
      date: this.lastResetDate,
      earned: this.dailyCoinsEarned
    }));
  }

  async completeGame(data: GameCompletionData): Promise<{
    gameScore: GameScore;
    coinsResponse: EarnCoinsResponse;
    leaderboardUpdate: LeaderboardUpdate;
  }> {
    try {
      // 1. Calculate percentage and coins
      const percentage = Math.round((data.score / data.maxScore) * 100);
      const baseCoins = await this.getGameCoins(data.gameId);
      const coinsEarned = this.calculateCoinsEarned(baseCoins, percentage);

      // 2. Create game score record
      const gameScore: GameScore = {
        scoreId: this.generateScoreId(),
        userId: data.userId,
        gameId: data.gameId,
        gameType: data.gameType,
        score: data.score,
        maxScore: data.maxScore,
        percentage,
        coinsEarned,
        completedAt: new Date().toISOString(),
        attempts: await this.getGameAttempts(data.userId, data.gameId) + 1,
        completionTime: data.completionTime,
        metadata: data.metadata,
        createdAt: new Date().toISOString()
      };

      // 3. Save game score to Firestore
      await this.saveGameScore(gameScore);

      // 4. Award coins (with daily limit check)
      const coinsResponse = await this.earnCoins(data.userId, data.gameId, coinsEarned);

      // 5. Update leaderboards
      const leaderboardUpdate = await this.updateLeaderboards(gameScore);

      // 6. Log activity
      await this.logGameActivity(gameScore);

      // 7. Create audit log
      await this.createAuditLog(gameScore, coinsResponse);

      return {
        gameScore,
        coinsResponse,
        leaderboardUpdate
      };

    } catch (error) {
      console.error('Error completing game:', error);
      throw new Error('Failed to complete game');
    }
  }

  private calculateCoinsEarned(baseCoins: number, percentage: number): number {
    // Award coins based on performance
    if (percentage >= 90) return baseCoins;
    if (percentage >= 80) return Math.floor(baseCoins * 0.8);
    if (percentage >= 70) return Math.floor(baseCoins * 0.6);
    if (percentage >= 60) return Math.floor(baseCoins * 0.4);
    if (percentage >= 50) return Math.floor(baseCoins * 0.2);
    return 0; // No coins for less than 50%
  }

  private async earnCoins(userId: string, gameId: string, coins: number): Promise<EarnCoinsResponse> {
    try {
      // Check daily limit
      if (this.dailyCoinsEarned + coins > this.dailyCoinLimit) {
        const remainingCoins = Math.max(0, this.dailyCoinLimit - this.dailyCoinsEarned);
        if (remainingCoins === 0) {
          return {
            success: false,
            coinsEarned: 0,
            newBalance: 0,
            error: 'Daily coin limit reached'
          };
        }
        coins = remainingCoins;
      }

      // Check for duplicate game completion (anti-abuse)
      const isDuplicate = await this.checkDuplicateCompletion(userId, gameId);
      if (isDuplicate) {
        return {
          success: false,
          coinsEarned: 0,
          newBalance: 0,
          error: 'Game already completed recently'
        };
      }

      // Call backend Cloud Function to award coins
      const result = await api as any; // placeholder to satisfy linter
      const resp = await api['request']('/earnCoins', {
        method: 'POST',
        body: JSON.stringify({ userId, gameId, coins, source: 'game_completion' }),
      } as any);

      if ((resp as any).success || (resp as any).newBalance !== undefined) {
        this.dailyCoinsEarned += coins;
        this.saveDailyProgress();
      }

      return {
        success: true,
        coinsEarned: coins,
        newBalance: (resp as any).newBalance || 0,
        error: undefined,
      };

    } catch (error) {
      console.error('Error earning coins:', error);
      return {
        success: false,
        coinsEarned: 0,
        newBalance: 0,
        error: 'Failed to award coins'
      };
    }
  }

  private async updateLeaderboards(gameScore: GameScore): Promise<LeaderboardUpdate> {
    try {
      // Update global leaderboard
      await this.updateGlobalLeaderboard(gameScore);
      
      // Update game-specific leaderboard
      await this.updateGameLeaderboard(gameScore);
      
      // Update category leaderboard
      await this.updateCategoryLeaderboard(gameScore);

      // Get new rank
      const newRank = await this.getUserRank(gameScore.userId);

      return {
        success: true,
        newRank
      };

    } catch (error) {
      console.error('Error updating leaderboards:', error);
      return {
        success: false,
        error: 'Failed to update leaderboards'
      };
    }
  }

  private async saveGameScore(gameScore: GameScore): Promise<void> {
    try {
      await (api as any)['request']('/gameScores', {
        method: 'POST',
        body: JSON.stringify(gameScore),
      } as any);
    } catch (error) {
      console.error('Error saving game score:', error);
      throw error;
    }
  }

  private async logGameActivity(gameScore: GameScore): Promise<void> {
    const activityLog: ActivityLog = {
      logId: this.generateLogId(),
      userId: gameScore.userId,
      action: 'game_completed',
      details: {
        gameId: gameScore.gameId,
        gameType: gameScore.gameType,
        score: gameScore.score,
        percentage: gameScore.percentage,
        coinsEarned: gameScore.coinsEarned,
        completionTime: gameScore.completionTime
      },
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    };

    try {
      await (api as any)['request']('/activityLogs', {
        method: 'POST',
        body: JSON.stringify(activityLog),
      } as any);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  private async createAuditLog(gameScore: GameScore, coinsResponse: EarnCoinsResponse): Promise<void> {
    const auditLog: AuditLog = {
      logId: this.generateLogId(),
      userId: gameScore.userId,
      action: 'earn_coins',
      entityType: 'wallet',
      entityId: gameScore.userId,
      before: { coins: coinsResponse.newBalance - coinsResponse.coinsEarned },
      after: { coins: coinsResponse.newBalance },
      changes: {
        coinsEarned: coinsResponse.coinsEarned,
        source: 'game_completion',
        gameId: gameScore.gameId,
        score: gameScore.score
      },
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    };

    try {
      await (api as any)['request']('/auditLogs', {
        method: 'POST',
        body: JSON.stringify(auditLog),
      } as any);
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  // Helper methods
  private generateScoreId(): string {
    return `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getGameCoins(gameId: string): Promise<number> {
    try {
      const game = await (api as any)['request'](`/games/${gameId}`);
      return game.coins || 10; // Default 10 coins
    } catch (error) {
      console.error('Error getting game coins:', error);
      return 10;
    }
  }

  private async getGameAttempts(userId: string, gameId: string): Promise<number> {
    try {
      const scores = await (api as any)['request'](`/gameScores?userId=${userId}&gameId=${gameId}`);
      return scores.length;
    } catch (error) {
      console.error('Error getting game attempts:', error);
      return 0;
    }
  }

  private async checkDuplicateCompletion(userId: string, gameId: string): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recentScores = await (api as any)['request'](
        `/gameScores?userId=${userId}&gameId=${gameId}&since=${oneHourAgo}`
      );
      return recentScores.length > 0;
    } catch (error) {
      console.error('Error checking duplicate completion:', error);
      return false;
    }
  }

  private async updateGlobalLeaderboard(gameScore: GameScore): Promise<void> {
    try {
      await (api as any)['request']('/leaderboards/global', {
        method: 'POST',
        body: JSON.stringify({
          userId: gameScore.userId,
          delta: gameScore.coinsEarned,
          score: gameScore.score,
          percentage: gameScore.percentage,
          source: 'game_completion',
          gameId: gameScore.gameId,
        }),
      } as any);
    } catch (e) {
      // Non-fatal for client flow
      console.warn('Global leaderboard update failed');
    }
  }

  private async updateGameLeaderboard(gameScore: GameScore): Promise<void> {
    try {
      await (api as any)['request'](`/leaderboards/game/${encodeURIComponent(gameScore.gameId)}`, {
        method: 'POST',
        body: JSON.stringify({
          userId: gameScore.userId,
          score: gameScore.score,
          percentage: gameScore.percentage,
          coinsEarned: gameScore.coinsEarned,
        }),
      } as any);
    } catch (e) {
      console.warn('Game leaderboard update failed');
    }
  }

  private async updateCategoryLeaderboard(gameScore: GameScore): Promise<void> {
    try {
      await (api as any)['request'](`/leaderboards/category/${encodeURIComponent(gameScore.gameType)}`, {
        method: 'POST',
        body: JSON.stringify({
          userId: gameScore.userId,
          score: gameScore.score,
          percentage: gameScore.percentage,
          coinsEarned: gameScore.coinsEarned,
        }),
      } as any);
    } catch (e) {
      console.warn('Category leaderboard update failed');
    }
  }

  private async getUserRank(userId: string): Promise<number> {
    try {
      const result = await (api as any)['request'](`/leaderboards/rank/${userId}`);
      return (result as any).rank || 0;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 0;
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('/api/client-ip');
      const result = await response.json();
      return result.ip || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  // Public methods for external use
  async getDailyProgress(): Promise<{ earned: number; limit: number; remaining: number }> {
    this.loadDailyProgress();
    return {
      earned: this.dailyCoinsEarned,
      limit: this.dailyCoinLimit,
      remaining: Math.max(0, this.dailyCoinLimit - this.dailyCoinsEarned)
    };
  }

  async getGameHistory(userId: string, limit = 10): Promise<GameScore[]> {
    try {
      const response = await fetch(`/api/gameScores?userId=${userId}&limit=${limit}&orderBy=createdAt&order=desc`);
      return await response.json();
    } catch (error) {
      console.error('Error getting game history:', error);
      return [];
    }
  }

  async getLeaderboard(scope: 'global' | 'game' | 'category', identifier?: string, limit = 10): Promise<LeaderboardEntry[]> {
    try {
      let url = `/api/leaderboards/${scope}?limit=${limit}`;
      if (identifier) {
        url += `&id=${identifier}`;
      }
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }
}

export const gameIntegration = GameIntegrationService.getInstance();