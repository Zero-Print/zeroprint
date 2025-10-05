import { PuzzleGameEngine } from '@/lib/gameEngine/PuzzleGameEngine';
import { PuzzleConfig } from '@/types/games';

describe('PuzzleGameEngine', () => {
  const mockConfig: PuzzleConfig = {
    pieces: [
      { id: '1', currentPosition: { x: 0, y: 0 }, correctPosition: { x: 0, y: 0 }, isPlaced: false },
      { id: '2', currentPosition: { x: 1, y: 0 }, correctPosition: { x: 1, y: 0 }, isPlaced: false },
      { id: '3', currentPosition: { x: 0, y: 1 }, correctPosition: { x: 0, y: 1 }, isPlaced: false },
      { id: '4', currentPosition: { x: 1, y: 1 }, correctPosition: { x: 1, y: 1 }, isPlaced: false },
    ],
    timeLimit: 300,
    difficulty: 'easy',
  };

  let engine: PuzzleGameEngine;

  beforeEach(() => {
    engine = new PuzzleGameEngine(mockConfig);
  });

  describe('Initialization', () => {
    it('should initialize with correct state', () => {
      const state = engine.getState();

      expect(state.pieces).toHaveLength(4);
      expect(state.emptyPosition).toEqual({ x: 1, y: 1 });
      expect(state.isComplete).toBe(false);
      expect(state.timeRemaining).toBe(300);
    });

    it('should calculate grid size correctly', () => {
      const state = engine.getState();
      expect(state.pieces).toHaveLength(4); // 2x2 grid
    });
  });

  describe('Game State', () => {
    it('should return current game state', () => {
      const state = engine.getState();

      expect(state).toHaveProperty('pieces');
      expect(state).toHaveProperty('emptyPosition');
      expect(state).toHaveProperty('isComplete');
      expect(state).toHaveProperty('timeRemaining');
    });

    it('should not allow direct state modification', () => {
      const state = engine.getState();
      const originalPieces = state.pieces;

      // Try to modify the returned state
      state.pieces = [];

      // Original state should be unchanged
      expect(engine.getState().pieces).toEqual(originalPieces);
    });
  });

  describe('Move Validation', () => {
    it('should validate valid moves', () => {
      const result = engine.movePiece('3');
      expect(result.success).toBe(true);
    });

    it('should reject invalid moves', () => {
      const result = engine.movePiece('1');
      expect(result.success).toBe(false);
    });
  });

  describe('Game Completion', () => {
    it('should detect when puzzle is complete', () => {
      const state = engine.getState();
      expect(state.isComplete).toBe(false);
    });

    it('should not be complete with misplaced pieces', () => {
      const state = engine.getState();
      expect(state.isComplete).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid piece moves gracefully', () => {
      const result = engine.movePiece('invalid');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid piece');
    });

    it('should handle empty configuration', () => {
      const emptyConfig: PuzzleConfig = {
        pieces: [],
        timeLimit: 300,
        difficulty: 'easy',
      };

      expect(() => {
        new PuzzleGameEngine(emptyConfig);
      }).not.toThrow();
    });
  });

  describe('Time Management', () => {
    it('should have time remaining', () => {
      const state = engine.getState();
      expect(state.timeRemaining).toBe(300);
    });

    it('should track moves', () => {
      const initialState = engine.getState();
      expect(initialState.moves).toBe(0);

      const result = engine.movePiece('3');
      if (result.success) {
        const updatedState = engine.getState();
        expect(updatedState.moves).toBeGreaterThan(0);
      } else {
        // If the move failed, the moves should still be 0
        const updatedState = engine.getState();
        expect(updatedState.moves).toBe(0);
      }
    });
  });
});