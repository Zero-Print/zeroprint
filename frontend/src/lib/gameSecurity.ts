import { GameScore, SecurityCheck, GameType } from '@/types/games';

export interface SecurityValidation {
  isValid: boolean;
  violations: string[];
  riskScore: number;
  action: 'allow' | 'warn' | 'block';
}

export interface PlaySession {
  sessionId: string;
  userId: string;
  gameId: string;
  startTime: number;
  interactions: GameInteraction[];
  suspicious: boolean;
}

export interface GameInteraction {
  timestamp: number;
  type: 'start' | 'answer' | 'move' | 'input' | 'complete';
  data: any;
  responseTime?: number;
}

export class GameSecurityService {
  private static instance: GameSecurityService;
  private activeSessions = new Map<string, PlaySession>();
  private userSessions = new Map<string, string[]>(); // userId -> sessionIds
  private dailyLimits = {
    maxGamesPerDay: 50,
    maxCoinsPerDay: 500,
    maxAttemptsPerGame: 10
  };

  static getInstance(): GameSecurityService {
    if (!GameSecurityService.instance) {
      GameSecurityService.instance = new GameSecurityService();
    }
    return GameSecurityService.instance;
  }

  private constructor() {
    // Clean up old sessions every hour
    setInterval(() => this.cleanupOldSessions(), 60 * 60 * 1000);
  }

  startGameSession(userId: string, gameId: string): string {
    const sessionId = this.generateSessionId();
    const session: PlaySession = {
      sessionId,
      userId,
      gameId,
      startTime: Date.now(),
      interactions: [{
        timestamp: Date.now(),
        type: 'start',
        data: { gameId }
      }],
      suspicious: false
    };

    this.activeSessions.set(sessionId, session);
    
    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, []);
    }
    this.userSessions.get(userId)!.push(sessionId);

    return sessionId;
  }

  recordInteraction(sessionId: string, interaction: Omit<GameInteraction, 'timestamp'>): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const fullInteraction: GameInteraction = {
      ...interaction,
      timestamp: Date.now()
    };

    session.interactions.push(fullInteraction);

    // Check for suspicious patterns
    this.analyzeSuspiciousActivity(session);
  }

  async validateGameCompletion(sessionId: string, gameScore: GameScore): Promise<SecurityValidation> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return {
        isValid: false,
        violations: ['Invalid session'],
        riskScore: 100,
        action: 'block'
      };
    }

    const violations: string[] = [];
    
    // Check if score exceeds maximum possible
    if (gameScore.score > gameScore.maxScore) {
      violations.push('Score exceeds maximum possible value');
    }
    
    // Check session duration (too short is suspicious)
    const sessionDuration = Date.now() - session.startTime;
    if (sessionDuration < 5000) { // Less than 5 seconds
      violations.push('Session duration too short');
    }
    
    // Check for suspicious activity flags
    if (session.suspicious) {
      violations.push('Suspicious activity patterns detected');
    }
    let riskScore = 0;

    // 1. Check session integrity
    if (session.userId !== gameScore.userId || session.gameId !== gameScore.gameId) {
      violations.push('Session mismatch');
      riskScore += 50;
    }

    // 2. Check completion time
    const minCompletionTime = await this.getMinCompletionTime(gameScore.gameType);
    if (gameScore.completionTime < minCompletionTime) {
      violations.push('Completion time too fast');
      riskScore += 30;
    }

    // 3. Check interaction patterns
    const interactionValidation = this.validateInteractionPattern(session, gameScore);
    violations.push(...interactionValidation.violations);
    riskScore += interactionValidation.riskScore;

    // 4. Check daily limits
    const dailyValidation = await this.validateDailyLimits(gameScore.userId);
    violations.push(...dailyValidation.violations);
    riskScore += dailyValidation.riskScore;

    // 5. Check for duplicate submissions
    const duplicateCheck = await this.checkDuplicateSubmission(gameScore);
    if (duplicateCheck.isDuplicate) {
      violations.push('Duplicate submission detected');
      riskScore += 40;
    }

    // 6. Check score validity
    const scoreValidation = this.validateScore(gameScore);
    violations.push(...scoreValidation.violations);
    riskScore += scoreValidation.riskScore;

    // 7. Check user behavior patterns
    const behaviorValidation = await this.validateUserBehavior(gameScore.userId);
    violations.push(...behaviorValidation.violations);
    riskScore += behaviorValidation.riskScore;

    // Determine action based on risk score
    let action: 'allow' | 'warn' | 'block' = 'allow';
    if (riskScore >= 80) action = 'block';
    else if (riskScore >= 50) action = 'warn';

    return {
      isValid: violations.length === 0,
      violations,
      riskScore: Math.min(100, riskScore),
      action
    };
  }

  private analyzeSuspiciousActivity(session: PlaySession): void {
    const interactions = session.interactions;
    if (interactions.length < 2) return;

    // Check for bot-like patterns
    const responseTimes = interactions
      .filter(i => i.responseTime)
      .map(i => i.responseTime!);

    if (responseTimes.length >= 3) {
      // Check for consistent response times (bot behavior)
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length;
      
      if (variance < 100 && avgResponseTime < 500) { // Very consistent and fast
        session.suspicious = true;
      }
    }

    // Check for rapid-fire interactions
    const recentInteractions = interactions.slice(-5);
    const timeDiffs = [];
    for (let i = 1; i < recentInteractions.length; i++) {
      timeDiffs.push(recentInteractions[i].timestamp - recentInteractions[i-1].timestamp);
    }

    if (timeDiffs.every(diff => diff < 100)) { // All interactions within 100ms
      session.suspicious = true;
    }
  }

  private validateInteractionPattern(session: PlaySession, gameScore: GameScore): { violations: string[]; riskScore: number } {
    const violations: string[] = [];
    let riskScore = 0;

    // Check if session was marked as suspicious
    if (session.suspicious) {
      violations.push('Suspicious interaction pattern detected');
      riskScore += 25;
    }

    // Check minimum interactions based on game type
    const minInteractions = this.getMinInteractions(gameScore.gameType, gameScore.score, gameScore.maxScore);
    if (session.interactions.length < minInteractions) {
      violations.push('Insufficient interactions for score achieved');
      riskScore += 20;
    }

    // Check for completion interaction
    const hasCompletion = session.interactions.some(i => i.type === 'complete');
    if (!hasCompletion) {
      violations.push('Missing completion interaction');
      riskScore += 15;
    }

    return { violations, riskScore };
  }

  private async validateDailyLimits(userId: string): Promise<{ violations: string[]; riskScore: number }> {
    const violations: string[] = [];
    let riskScore = 0;

    try {
      // Check daily game count
      const todayGames = await this.getTodayGameCount(userId);
      if (todayGames >= this.dailyLimits.maxGamesPerDay) {
        violations.push('Daily game limit exceeded');
        riskScore += 30;
      }

      // Check daily coins earned
      const todayCoins = await this.getTodayCoinsEarned(userId);
      if (todayCoins >= this.dailyLimits.maxCoinsPerDay) {
        violations.push('Daily coin limit exceeded');
        riskScore += 25;
      }

    } catch (error) {
      console.error('Error validating daily limits:', error);
    }

    return { violations, riskScore };
  }

  private async checkDuplicateSubmission(gameScore: GameScore): Promise<{ isDuplicate: boolean }> {
    try {
      const recentWindow = 5 * 60 * 1000; // 5 minutes
      const since = new Date(Date.now() - recentWindow).toISOString();
      
      const response = await fetch(
        `/api/gameScores?userId=${gameScore.userId}&gameId=${gameScore.gameId}&since=${since}`
      );
      const recentScores = await response.json();
      
      // Check for exact score matches within the time window
      const exactMatches = recentScores.filter((score: GameScore) => 
        score.score === gameScore.score && 
        Math.abs(score.completionTime - gameScore.completionTime) < 1000
      );

      return { isDuplicate: exactMatches.length > 0 };
    } catch (error) {
      console.error('Error checking duplicate submission:', error);
      return { isDuplicate: false };
    }
  }

  private validateScore(gameScore: GameScore): { violations: string[]; riskScore: number } {
    const violations: string[] = [];
    let riskScore = 0;

    // Check score bounds
    if (gameScore.score < 0 || gameScore.score > gameScore.maxScore) {
      violations.push('Score out of valid range');
      riskScore += 50;
    }

    // Check percentage calculation
    const calculatedPercentage = Math.round((gameScore.score / gameScore.maxScore) * 100);
    if (Math.abs(calculatedPercentage - gameScore.percentage) > 1) {
      violations.push('Incorrect percentage calculation');
      riskScore += 20;
    }

    // Check for perfect scores (might be suspicious if too frequent)
    if (gameScore.percentage === 100) {
      riskScore += 5; // Slight increase for perfect scores
    }

    return { violations, riskScore };
  }

  private async validateUserBehavior(userId: string): Promise<{ violations: string[]; riskScore: number }> {
    const violations: string[] = [];
    let riskScore = 0;

    try {
      // Get user's recent game history
      const recentGames = await this.getRecentGameHistory(userId, 10);
      
      if (recentGames.length >= 5) {
        // Check for consistently perfect scores (suspicious)
        const perfectScores = recentGames.filter(game => game.percentage === 100).length;
        if (perfectScores / recentGames.length > 0.8) {
          violations.push('Unusually high perfect score rate');
          riskScore += 20;
        }

        // Check for consistent completion times (bot behavior)
        const completionTimes = recentGames.map(game => game.completionTime);
        const avgTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
        const variance = completionTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / completionTimes.length;
        
        if (variance < 1000 && avgTime < 30000) { // Very consistent and fast
          violations.push('Suspicious completion time pattern');
          riskScore += 15;
        }
      }

    } catch (error) {
      console.error('Error validating user behavior:', error);
    }

    return { violations, riskScore };
  }

  // Helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getMinCompletionTime(gameType: GameType): Promise<number> {
    // Minimum realistic completion times in milliseconds
    switch (gameType) {
      case 'quiz': return 10000; // 10 seconds minimum
      case 'dragdrop': return 15000; // 15 seconds minimum
      case 'simulation': return 20000; // 20 seconds minimum
      default: return 10000;
    }
  }

  private getMinInteractions(gameType: GameType, score: number, maxScore: number): number {
    const scoreRatio = score / maxScore;
    
    switch (gameType) {
      case 'quiz':
        // At least 1 interaction per question attempted
        return Math.max(2, Math.ceil(scoreRatio * 10));
      case 'dragdrop':
        // At least 1 interaction per item moved
        return Math.max(3, Math.ceil(scoreRatio * 15));
      case 'simulation':
        // At least a few input changes
        return Math.max(2, Math.ceil(scoreRatio * 8));
      default:
        return 2;
    }
  }

  private async getTodayGameCount(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/gameScores/count?userId=${userId}&date=${today}`);
      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Error getting today game count:', error);
      return 0;
    }
  }

  private async getTodayCoinsEarned(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/gameScores/coins?userId=${userId}&date=${today}`);
      const result = await response.json();
      return result.totalCoins || 0;
    } catch (error) {
      console.error('Error getting today coins earned:', error);
      return 0;
    }
  }

  private async getRecentGameHistory(userId: string, limit: number): Promise<GameScore[]> {
    try {
      const response = await fetch(`/api/gameScores?userId=${userId}&limit=${limit}&orderBy=createdAt&order=desc`);
      return await response.json();
    } catch (error) {
      console.error('Error getting recent game history:', error);
      return [];
    }
  }

  private cleanupOldSessions(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.startTime < oneHourAgo) {
        this.activeSessions.delete(sessionId);
        
        // Remove from user sessions
        const userSessions = this.userSessions.get(session.userId);
        if (userSessions) {
          const index = userSessions.indexOf(sessionId);
          if (index > -1) {
            userSessions.splice(index, 1);
          }
        }
      }
    }
  }

  // Public methods
  endGameSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.recordInteraction(sessionId, {
        type: 'complete',
        data: { endTime: Date.now() }
      });
    }
  }

  getSessionInfo(sessionId: string): PlaySession | undefined {
    return this.activeSessions.get(sessionId);
  }

  async createSecurityCheck(validation: SecurityValidation, gameScore: GameScore): Promise<SecurityCheck> {
    const securityCheck: SecurityCheck = {
      checkId: this.generateSessionId(),
      userId: gameScore.userId,
      gameId: gameScore.gameId,
      scoreId: gameScore.scoreId,
      checkType: 'game_completion',
      result: validation.action,
      riskScore: validation.riskScore,
      violations: validation.violations,
      metadata: {
        completionTime: gameScore.completionTime,
        score: gameScore.score,
        percentage: gameScore.percentage
      },
      timestamp: new Date().toISOString()
    };

    try {
      await fetch('/api/securityChecks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(securityCheck)
      });
    } catch (error) {
      console.error('Error creating security check:', error);
    }

    return securityCheck;
  }
}

export const gameSecurity = GameSecurityService.getInstance();