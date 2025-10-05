import { 
  GameEngine, 
  GameConfig, 
  GameState, 
  GameResult, 
  GameEvent, 
  GameActivityLog,
  GameAuditLog 
} from '@/types/games';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export abstract class BaseGameEngine<T extends GameConfig = GameConfig> implements GameEngine<T> {
  public config: T;
  public state: GameState;
  private eventListeners: ((event: GameEvent) => void)[] = [];
  private timerInterval?: NodeJS.Timeout;

  constructor(config: T) {
    this.config = config;
    this.state = this.createInitialState();
  }

  // Abstract methods to be implemented by specific engines
  abstract validateAnswer(questionId: string, answer: any): boolean;
  abstract validateDrop(itemId: string, targetId: string): boolean;
  abstract validateInput(inputId: string, value: any): boolean;
  abstract calculateScore(): number;

  // Core implementation
  initialize(config: T, userId: string): void {
    this.config = config;
    this.state = {
      ...this.createInitialState(),
      gameId: config.id,
      userId,
      maxScore: config.maxScore,
      totalSteps: this.getTotalSteps(),
    };
    
    this.logActivity('started', {
      gameType: config.type,
      category: config.category,
      difficulty: config.difficulty,
    });
  }

  start(): void {
    if (this.state.status !== 'not_started') {
      throw new Error('Game has already been started');
    }

    this.updateState({
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      attempts: this.state.attempts + 1,
    });

    // Start timer if configured
    if (this.getTimeLimit()) {
      this.startTimer();
    }

    this.emitEvent({
      type: 'GAME_STARTED',
      payload: { gameId: this.state.gameId, userId: this.state.userId },
    });
  }

  processEvent(event: GameEvent): void {
    switch (event.type) {
      case 'ANSWER_SUBMITTED':
        this.handleAnswerSubmitted(event.payload);
        break;
      case 'ITEM_DROPPED':
        this.handleItemDropped(event.payload);
        break;
      case 'INPUT_CHANGED':
        this.handleInputChanged(event.payload);
        break;
      case 'TIMER_TICK':
        this.handleTimerTick(event.payload);
        break;
      case 'TIMER_EXPIRED':
        this.handleTimerExpired();
        break;
      default:
        console.warn('Unhandled game event:', event);
    }
  }

  complete(): GameResult {
    if (this.state.status === 'completed') {
      throw new Error('Game has already been completed');
    }

    const completedAt = new Date().toISOString();
    const completionTime = this.calculateCompletionTime(completedAt);
    const score = this.calculateScore();
    const percentage = (score / this.state.maxScore) * 100;
    const coinsEarned = this.calculateCoinsEarned(score, percentage);

    const result: GameResult = {
      gameId: this.state.gameId,
      userId: this.state.userId,
      score,
      maxScore: this.state.maxScore,
      percentage,
      coinsEarned,
      completionTime,
      attempts: this.state.attempts,
      answers: this.state.answers || {},
      feedback: this.generateFeedback(percentage),
      achievements: this.checkAchievements(score, completionTime),
    };

    this.updateState({
      status: 'completed',
      completedAt,
      score,
      coinsEarned,
    });

    this.stopTimer();
    this.saveGameScore(result);
    this.logActivity('completed', result);
    
    this.emitEvent({
      type: 'GAME_COMPLETED',
      payload: result,
    });

    return result;
  }

  abandon(reason?: string): void {
    if (this.state.status === 'completed') {
      throw new Error('Cannot abandon a completed game');
    }

    this.updateState({
      status: 'abandoned',
    });

    this.stopTimer();
    this.logActivity('abandoned', { reason });

    this.emitEvent({
      type: 'GAME_ABANDONED',
      payload: { gameId: this.state.gameId, reason },
    });
  }

  getState(): GameState {
    return { ...this.state };
  }

  updateState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };
  }

  // Event handling
  addEventListener(listener: (event: GameEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: GameEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private emitEvent(event: GameEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  // Timer management
  private startTimer(): void {
    const timeLimit = this.getTimeLimit();
    if (!timeLimit) return;

    this.updateState({ timeRemaining: timeLimit });

    this.timerInterval = setInterval(() => {
      const newTimeRemaining = (this.state.timeRemaining || 0) - 1;
      
      if (newTimeRemaining <= 0) {
        this.emitEvent({
          type: 'TIMER_EXPIRED',
          payload: { gameId: this.state.gameId },
        });
      } else {
        this.emitEvent({
          type: 'TIMER_TICK',
          payload: { timeRemaining: newTimeRemaining },
        });
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  // Event handlers
  private handleAnswerSubmitted(payload: any): void {
    const { questionId, answer, isCorrect } = payload;
    
    this.updateState({
      answers: {
        ...this.state.answers,
        [questionId]: answer,
      },
      currentStep: (this.state.currentStep || 0) + 1,
    });

    // Check if game is complete
    if (this.isGameComplete()) {
      this.complete();
    }
  }

  private handleItemDropped(payload: any): void {
    const { itemId, targetId, isCorrect } = payload;
    
    this.updateState({
      answers: {
        ...this.state.answers,
        [itemId]: targetId,
      },
      currentStep: (this.state.currentStep || 0) + 1,
    });

    if (this.isGameComplete()) {
      this.complete();
    }
  }

  private handleInputChanged(payload: any): void {
    const { inputId, value } = payload;
    
    this.updateState({
      answers: {
        ...this.state.answers,
        [inputId]: value,
      },
    });
  }

  private handleTimerTick(payload: any): void {
    this.updateState({ timeRemaining: payload.timeRemaining });
  }

  private handleTimerExpired(): void {
    this.complete();
  }

  // Helper methods
  private createInitialState(): GameState {
    return {
      gameId: '',
      userId: '',
      status: 'not_started',
      score: 0,
      maxScore: 0,
      coinsEarned: 0,
      currentStep: 0,
      totalSteps: 0,
      answers: {},
      attempts: 0,
    };
  }

  private getTotalSteps(): number {
    switch (this.config.type) {
      case 'quiz':
        return (this.config as any).config.questions?.length || 0;
      case 'dragdrop':
        return (this.config as any).config.items?.length || 0;
      case 'simulation':
        return (this.config as any).config.inputs?.length || 0;
      default:
        return 0;
    }
  }

  private getTimeLimit(): number | undefined {
    switch (this.config.type) {
      case 'quiz':
        return (this.config as any).config.timeLimit;
      case 'dragdrop':
        return (this.config as any).config.timeLimit;
      case 'simulation':
        return (this.config as any).config.timeLimit;
      default:
        return undefined;
    }
  }

  private isGameComplete(): boolean {
    return (this.state.currentStep || 0) >= this.state.totalSteps;
  }

  private calculateCompletionTime(completedAt: string): number {
    if (!this.state.startedAt) return 0;
    
    const startTime = new Date(this.state.startedAt).getTime();
    const endTime = new Date(completedAt).getTime();
    return Math.round((endTime - startTime) / 1000); // seconds
  }

  private calculateCoinsEarned(score: number, percentage: number): number {
    const baseCoins = this.config.coins;
    
    // Bonus for high performance
    let multiplier = 1;
    if (percentage >= 90) multiplier = 1.5;
    else if (percentage >= 80) multiplier = 1.3;
    else if (percentage >= 70) multiplier = 1.1;
    
    // Penalty for multiple attempts
    const attemptPenalty = Math.max(0, 1 - (this.state.attempts - 1) * 0.1);
    
    return Math.round(baseCoins * multiplier * attemptPenalty);
  }

  private generateFeedback(percentage: number): string {
    if (percentage >= 90) return 'Excellent work! You\'re a sustainability champion!';
    if (percentage >= 80) return 'Great job! You have strong environmental knowledge.';
    if (percentage >= 70) return 'Good effort! Keep learning about sustainability.';
    if (percentage >= 60) return 'Not bad! There\'s room for improvement.';
    return 'Keep trying! Every step towards sustainability counts.';
  }

  private checkAchievements(score: number, completionTime: number): string[] {
    const achievements: string[] = [];
    
    if (score === this.state.maxScore) {
      achievements.push('Perfect Score');
    }
    
    if (completionTime < 60) {
      achievements.push('Speed Demon');
    }
    
    if (this.state.attempts === 1) {
      achievements.push('First Try');
    }
    
    return achievements;
  }

  // Database operations
  private async saveGameScore(result: GameResult): Promise<void> {
    try {
      const gameScoreData = {
        gameId: result.gameId,
        userId: result.userId,
        score: result.score,
        coinsEarned: result.coinsEarned,
        attempts: result.attempts,
        completionTime: result.completionTime,
        metadata: {
          percentage: result.percentage,
          answers: result.answers,
          achievements: result.achievements,
        },
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'gameScores'), gameScoreData);
      
      // Trigger cloud function to update wallet and leaderboards
      await this.triggerEarnCoins(result.userId, result.gameId, result.coinsEarned);
      
    } catch (error) {
      console.error('Failed to save game score:', error);
    }
  }

  private async triggerEarnCoins(userId: string, gameId: string, coins: number): Promise<void> {
    try {
      // This would typically call a cloud function
      // For now, we'll add to activity logs
      await this.logAudit('earnCoins', {
        userId,
        gameId,
        coins,
        before: { coins: 0 }, // Would fetch current wallet
        after: { coins }, // Would be updated wallet
      });
    } catch (error) {
      console.error('Failed to trigger earn coins:', error);
    }
  }

  private async logActivity(action: string, details: Record<string, any>): Promise<void> {
    try {
      const activityLog: Omit<GameActivityLog, 'logId'> = {
        userId: this.state.userId,
        gameId: this.state.gameId,
        action: action as any,
        details,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'activityLogs'), activityLog);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  private async logAudit(action: string, data: Record<string, any>): Promise<void> {
    try {
      const auditLog: Omit<GameAuditLog, 'auditId'> = {
        userId: this.state.userId,
        action: action as any,
        gameId: this.state.gameId,
        before: data.before || {},
        after: data.after || {},
        timestamp: new Date().toISOString(),
        severity: 'medium',
      };

      await addDoc(collection(db, 'auditLogs'), auditLog);
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
}