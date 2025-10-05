/**
 * Mock Game Engine Service
 * 
 * Mock implementation for testing purposes
 */

export interface GameConfig {
  id: string;
  type: 'quiz' | 'drag-drop' | 'simulation';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  maxScore: number;
  maxCoins?: number;
  questions?: any[];
  items?: any[];
  simulation?: any;
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface DragDropAnswer {
  itemId: string;
  targetZone: string;
  timeSpent: number;
  isCorrect: boolean;
}

export interface SimulationResult {
  carbonSaved: number;
  score: number;
  coinsEarned: number;
  recommendations: string[];
}

export class GameEngine {
  constructor() {}
  
  // Quiz game methods
  calculateQuizScore = jest.fn().mockReturnValue({
    score: 100,
    correctAnswers: 5,
    totalQuestions: 5,
    timeBonus: 10,
    coinsEarned: 50
  });
  
  // Drag-drop game methods
  validateDragDropAnswers = jest.fn().mockReturnValue({
    score: 100,
    correctPlacements: 3,
    totalPlacements: 3,
    speedBonus: 5,
    coinsEarned: 30
  });
  
  // Simulation methods
  calculateSimulationResult = jest.fn().mockReturnValue({
    carbonSaved: 2.5,
    score: 85,
    coinsEarned: 25,
    recommendations: ['Use LED bulbs', 'Install solar panels']
  });
  
  calculateEnergySimulation = jest.fn().mockReturnValue({
    totalConsumption: 100,
    cost: 50,
    recommendations: ['Switch to LED', 'Use energy-efficient appliances']
  });
  
  // Game progress methods
  saveGameProgress = jest.fn().mockResolvedValue({ success: true });
  loadGameProgress = jest.fn().mockResolvedValue({
    userId: 'test-user',
    gameId: 'test-game',
    progress: 50,
    score: 100
  });
  
  // Game completion methods
  completeGame = jest.fn().mockResolvedValue({
    score: 100,
    coinsEarned: 50,
    completed: true,
    timeSpent: 30000
  });
  
  // Legacy methods
  startGame = jest.fn();
  submitAnswer = jest.fn();
  getLeaderboard = jest.fn();
  
  // Additional methods that might be expected
  submitQuizAnswer = jest.fn().mockReturnValue({
    score: 100,
    maxScore: 100,
    percentage: 100,
    timeSpent: 30000,
    completed: true,
    answers: [],
    feedback: 'Excellent!'
  });
  
  submitDragDropAnswer = jest.fn().mockReturnValue({
    score: 100,
    maxScore: 100,
    percentage: 100,
    timeSpent: 30000,
    completed: true,
    answers: [],
    feedback: 'Excellent!'
  });
  
  getGame = jest.fn().mockReturnValue({
    id: 'test-game',
    type: 'quiz',
    title: 'Test Game',
    description: 'Test Description',
    difficulty: 'easy',
    maxScore: 100,
    maxCoins: 50
  });
  
  getAllGames = jest.fn().mockReturnValue([]);
  getGamesByType = jest.fn().mockReturnValue([]);
  getGamesByDifficulty = jest.fn().mockReturnValue([]);
  getSession = jest.fn().mockReturnValue(null);
  getUserSessions = jest.fn().mockReturnValue([]);
  abandonGame = jest.fn().mockReturnValue(true);
  clearCompletedSessions = jest.fn();
  addGame = jest.fn();
  removeGame = jest.fn().mockReturnValue(true);
}

// Export singleton instance
export const gameEngine = new GameEngine();