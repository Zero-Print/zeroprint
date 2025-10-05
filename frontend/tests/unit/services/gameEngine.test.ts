import { GameEngine } from '../../../src/services/gameEngine';
import { TEST_GAMES, TEST_QUESTIONS } from '../../fixtures/seed-data';
import { GameType, QuizAnswer, DragDropAnswer, SimulationResult } from '../../../src/types';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn(date => ({ toDate: () => date })),
  },
}));

// Mock audit service
jest.mock('../../../src/lib/auditService', () => ({
  logAudit: jest.fn(),
  logUserActivity: jest.fn(),
}));

describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    gameEngine = new GameEngine();
  });

  describe('Quiz Game Scoring', () => {
    const quizGame = TEST_GAMES.find(g => g.type === 'quiz')!;
    const quizQuestions = TEST_QUESTIONS.filter(q => q.gameId === quizGame.id);

    it('should calculate correct score for all correct answers', () => {
      const answers: QuizAnswer[] = quizQuestions.map(q => ({
        questionId: q.id,
        selectedOption: q.correctAnswer,
        timeSpent: 15000, // 15 seconds
        isCorrect: true,
      }));

      const result = gameEngine.calculateQuizScore(quizGame, quizQuestions, answers);

      expect(result.score).toBe(100); // All correct
      expect(result.correctAnswers).toBe(quizQuestions.length);
      expect(result.totalQuestions).toBe(quizQuestions.length);
      expect(result.coinsEarned).toBe(quizGame.maxCoins);
      expect(result.timeBonus).toBeGreaterThan(0); // Fast completion bonus
    });

    it('should calculate partial score for mixed answers', () => {
      const answers: QuizAnswer[] = quizQuestions.map((q, index) => ({
        questionId: q.id,
        selectedOption: index % 2 === 0 ? q.correctAnswer : 'wrong-option',
        timeSpent: 20000, // 20 seconds
        isCorrect: index % 2 === 0,
      }));

      const correctCount = Math.ceil(quizQuestions.length / 2);
      const expectedScore = Math.round((correctCount / quizQuestions.length) * 100);

      const result = gameEngine.calculateQuizScore(quizGame, quizQuestions, answers);

      expect(result.score).toBe(expectedScore);
      expect(result.correctAnswers).toBe(correctCount);
      expect(result.totalQuestions).toBe(quizQuestions.length);
      expect(result.coinsEarned).toBeLessThan(quizGame.maxCoins);
      expect(result.coinsEarned).toBeGreaterThan(0);
    });

    it('should apply time penalty for slow answers', () => {
      const answers: QuizAnswer[] = quizQuestions.map(q => ({
        questionId: q.id,
        selectedOption: q.correctAnswer,
        timeSpent: 60000, // 60 seconds (very slow)
        isCorrect: true,
      }));

      const result = gameEngine.calculateQuizScore(quizGame, quizQuestions, answers);

      expect(result.score).toBe(100); // Still correct
      expect(result.timeBonus).toBe(0); // No time bonus for slow completion
      expect(result.coinsEarned).toBeLessThan(quizGame.maxCoins); // Reduced coins due to time
    });

    it('should handle zero correct answers', () => {
      const answers: QuizAnswer[] = quizQuestions.map(q => ({
        questionId: q.id,
        selectedOption: 'wrong-option',
        timeSpent: 30000,
        isCorrect: false,
      }));

      const result = gameEngine.calculateQuizScore(quizGame, quizQuestions, answers);

      expect(result.score).toBe(0);
      expect(result.correctAnswers).toBe(0);
      expect(result.coinsEarned).toBe(0);
      expect(result.timeBonus).toBe(0);
    });

    it('should validate answer format and throw error for invalid data', () => {
      const invalidAnswers: any[] = [
        { questionId: 'invalid-id', selectedOption: 'A' }, // Missing required fields
      ];

      expect(() => {
        gameEngine.calculateQuizScore(quizGame, quizQuestions, invalidAnswers);
      }).toThrow('Invalid answer format');
    });

    it('should apply difficulty multiplier correctly', () => {
      const hardQuizGame = { ...quizGame, difficulty: 'hard' as const };
      const answers: QuizAnswer[] = quizQuestions.map(q => ({
        questionId: q.id,
        selectedOption: q.correctAnswer,
        timeSpent: 15000,
        isCorrect: true,
      }));

      const result = gameEngine.calculateQuizScore(hardQuizGame, quizQuestions, answers);

      expect(result.coinsEarned).toBeGreaterThan(quizGame.maxCoins); // Hard difficulty bonus
    });
  });

  describe('Drag-Drop Game Validation', () => {
    const dragDropGame = TEST_GAMES.find(g => g.type === 'drag-drop')!;

    it('should validate correct drag-drop placements', () => {
      const correctAnswers: DragDropAnswer[] = [
        {
          itemId: 'plastic-bottle',
          targetZone: 'recyclable',
          isCorrect: true,
          timeSpent: 5000,
        },
        {
          itemId: 'banana-peel',
          targetZone: 'organic',
          isCorrect: true,
          timeSpent: 3000,
        },
        {
          itemId: 'battery',
          targetZone: 'hazardous',
          isCorrect: true,
          timeSpent: 4000,
        },
      ];

      const result = gameEngine.validateDragDropAnswers(dragDropGame, correctAnswers);

      expect(result.score).toBe(100);
      expect(result.correctPlacements).toBe(3);
      expect(result.totalItems).toBe(3);
      expect(result.coinsEarned).toBe(dragDropGame.maxCoins);
    });

    it('should handle incorrect placements', () => {
      const mixedAnswers: DragDropAnswer[] = [
        {
          itemId: 'plastic-bottle',
          targetZone: 'organic', // Wrong zone
          isCorrect: false,
          timeSpent: 5000,
        },
        {
          itemId: 'banana-peel',
          targetZone: 'organic', // Correct
          isCorrect: true,
          timeSpent: 3000,
        },
        {
          itemId: 'battery',
          targetZone: 'recyclable', // Wrong zone
          isCorrect: false,
          timeSpent: 4000,
        },
      ];

      const result = gameEngine.validateDragDropAnswers(dragDropGame, mixedAnswers);

      expect(result.score).toBe(Math.round((1 / 3) * 100)); // 33%
      expect(result.correctPlacements).toBe(1);
      expect(result.totalItems).toBe(3);
      expect(result.coinsEarned).toBeLessThan(dragDropGame.maxCoins);
    });

    it('should apply speed bonus for quick placements', () => {
      const fastAnswers: DragDropAnswer[] = [
        {
          itemId: 'plastic-bottle',
          targetZone: 'recyclable',
          isCorrect: true,
          timeSpent: 2000, // Very fast
        },
        {
          itemId: 'banana-peel',
          targetZone: 'organic',
          isCorrect: true,
          timeSpent: 1500, // Very fast
        },
      ];

      const result = gameEngine.validateDragDropAnswers(dragDropGame, fastAnswers);

      expect(result.speedBonus).toBeGreaterThan(0);
      expect(result.coinsEarned).toBeGreaterThan(
        Math.round((result.score / 100) * dragDropGame.maxCoins)
      );
    });

    it('should validate item-zone compatibility', () => {
      const invalidPlacements: DragDropAnswer[] = [
        {
          itemId: 'non-existent-item',
          targetZone: 'recyclable',
          isCorrect: false,
          timeSpent: 5000,
        },
      ];

      expect(() => {
        gameEngine.validateDragDropAnswers(dragDropGame, invalidPlacements);
      }).toThrow('Invalid item or target zone');
    });
  });

  describe('Simulation Math Calculations', () => {
    const simulationGame = TEST_GAMES.find(g => g.type === 'simulation')!;

    it('should calculate carbon footprint reduction correctly', () => {
      const simulationData = {
        transportMode: 'bicycle',
        distance: 10, // km
        frequency: 5, // days per week
        duration: 4, // weeks
      };

      const result = gameEngine.calculateSimulationResult(simulationGame, simulationData);

      expect(result.carbonSaved).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
      expect(result.coinsEarned).toBeGreaterThan(0);
      expect(result.metrics).toHaveProperty('totalDistance');
      expect(result.metrics).toHaveProperty('co2Reduction');
    });

    it('should handle different transport modes with correct emission factors', () => {
      const carSimulation = {
        transportMode: 'car',
        distance: 20,
        frequency: 7,
        duration: 2,
      };

      const bikeSimulation = {
        transportMode: 'bicycle',
        distance: 20,
        frequency: 7,
        duration: 2,
      };

      const carResult = gameEngine.calculateSimulationResult(simulationGame, carSimulation);
      const bikeResult = gameEngine.calculateSimulationResult(simulationGame, bikeSimulation);

      // Bicycle should have much higher carbon savings compared to car
      expect(bikeResult.carbonSaved).toBeGreaterThan(carResult.carbonSaved);
      expect(bikeResult.score).toBeGreaterThan(carResult.score);
    });

    it('should calculate energy consumption simulation', () => {
      const energySimulation = {
        appliances: [
          { type: 'led-bulb', quantity: 10, hoursPerDay: 6 },
          { type: 'ac', quantity: 2, hoursPerDay: 8 },
          { type: 'refrigerator', quantity: 1, hoursPerDay: 24 },
        ],
        duration: 30, // days
      };

      const result = gameEngine.calculateEnergySimulation(energySimulation);

      expect(result.totalConsumption).toBeGreaterThan(0);
      expect(result.cost).toBeGreaterThan(0);
      expect(result.carbonFootprint).toBeGreaterThan(0);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide optimization recommendations', () => {
      const inefficientSimulation = {
        appliances: [
          { type: 'incandescent-bulb', quantity: 20, hoursPerDay: 12 },
          { type: 'old-ac', quantity: 3, hoursPerDay: 16 },
        ],
        duration: 30,
      };

      const result = gameEngine.calculateEnergySimulation(inefficientSimulation);

      expect(result.recommendations).toContain(expect.stringMatching(/LED/i));
      expect(result.recommendations).toContain(expect.stringMatching(/efficient/i));
    });

    it('should handle edge cases in simulation data', () => {
      const edgeCaseData = {
        transportMode: 'walking',
        distance: 0,
        frequency: 0,
        duration: 0,
      };

      const result = gameEngine.calculateSimulationResult(simulationGame, edgeCaseData);

      expect(result.carbonSaved).toBe(0);
      expect(result.score).toBe(0);
      expect(result.coinsEarned).toBe(0);
    });
  });

  describe('Game Progress Tracking', () => {
    it('should track user progress correctly', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-quiz-1';
      const sessionData = {
        startTime: new Date().toISOString(),
        answers: [],
        currentQuestion: 0,
        timeSpent: 0,
      };

      // Mock Firestore operations
      const mockDoc = {
        set: jest.fn(),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => sessionData,
        }),
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc),
      };

      const mockDb = {
        collection: jest.fn(() => mockCollection),
      };

      (gameEngine as any).db = mockDb;

      await gameEngine.saveGameProgress(userId, gameId, sessionData);

      expect(mockDb.collection).toHaveBeenCalledWith('gameProgress');
      expect(mockCollection.doc).toHaveBeenCalledWith(`${userId}_${gameId}`);
      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          gameId,
          ...sessionData,
          lastUpdated: expect.any(String),
        })
      );
    });

    it('should load saved game progress', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-quiz-1';

      const savedProgress = {
        userId,
        gameId,
        startTime: new Date().toISOString(),
        answers: [{ questionId: 'q1', selectedOption: 'A' }],
        currentQuestion: 1,
        timeSpent: 30000,
        lastUpdated: new Date().toISOString(),
      };

      const mockDoc = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => savedProgress,
        }),
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc),
      };

      const mockDb = {
        collection: jest.fn(() => mockCollection),
      };

      (gameEngine as any).db = mockDb;

      const progress = await gameEngine.loadGameProgress(userId, gameId);

      expect(progress).toEqual(savedProgress);
      expect(mockDb.collection).toHaveBeenCalledWith('gameProgress');
      expect(mockCollection.doc).toHaveBeenCalledWith(`${userId}_${gameId}`);
    });
  });

  describe('Game Completion and Scoring', () => {
    it('should finalize game session with complete scoring', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-quiz-1';
      const game = TEST_GAMES.find(g => g.id === gameId)!;
      const questions = TEST_QUESTIONS.filter(q => q.gameId === gameId);

      const answers: QuizAnswer[] = questions.map(q => ({
        questionId: q.id,
        selectedOption: q.correctAnswer,
        timeSpent: 15000,
        isCorrect: true,
      }));

      const mockWalletService = {
        creditHealCoins: jest.fn().mockResolvedValue({
          id: 'txn_game_123',
          amount: game.maxCoins,
          status: 'completed',
        }),
      };

      (gameEngine as any).walletService = mockWalletService;

      const result = await gameEngine.completeGame(userId, game, questions, answers);

      expect(result.score).toBe(100);
      expect(result.coinsEarned).toBe(game.maxCoins);
      expect(result.completed).toBe(true);
      expect(mockWalletService.creditHealCoins).toHaveBeenCalledWith(
        userId,
        game.maxCoins,
        expect.stringContaining('Game completion'),
        'game'
      );

      // Verify audit logging
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'GAME_COMPLETED',
          userId,
          details: expect.objectContaining({
            gameId,
            score: 100,
            coinsEarned: game.maxCoins,
          }),
        })
      );
    });

    it('should handle game completion with partial score', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-quiz-1';
      const game = TEST_GAMES.find(g => g.id === gameId)!;
      const questions = TEST_QUESTIONS.filter(q => q.gameId === gameId);

      const answers: QuizAnswer[] = questions.map((q, index) => ({
        questionId: q.id,
        selectedOption: index < 2 ? q.correctAnswer : 'wrong-option',
        timeSpent: 20000,
        isCorrect: index < 2,
      }));

      const mockWalletService = {
        creditHealCoins: jest.fn().mockResolvedValue({
          id: 'txn_game_partial_123',
          amount: Math.round(game.maxCoins * 0.4), // Partial coins
          status: 'completed',
        }),
      };

      (gameEngine as any).walletService = mockWalletService;

      const result = await gameEngine.completeGame(userId, game, questions, answers);

      expect(result.score).toBeLessThan(100);
      expect(result.coinsEarned).toBeLessThan(game.maxCoins);
      expect(result.coinsEarned).toBeGreaterThan(0);
      expect(result.completed).toBe(true);
    });
  });
});
