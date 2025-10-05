import { PuzzleGameEngine } from '@/lib/gameEngine/PuzzleGameEngine';
import { PuzzleConfig } from '@/types/games';

describe('PuzzleGameEngine', () => {
  const mockConfig: PuzzleConfig = {
    pieces: [
      { id: '1', position: { x: 0, y: 0 }, correctPosition: { x: 0, y: 0 } },
      { id: '2', position: { x: 1, y: 0 }, correctPosition: { x: 1, y: 0 } },
      { id: '3', position: { x: 0, y: 1 }, correctPosition: { x: 0, y: 1 } },
      { id: '4', position: { x: 1, y: 1 }, correctPosition: { x: 1, y: 1 } },
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
      // In a 2x2 puzzle, piece at (0,1) should be able to move to empty position at (1,1)
      const piece = { id: '3', position: { x: 0, y: 1 }, correctPosition: { x: 0, y: 1 } };
      
      const canMove = engine.canMove(piece);
      expect(canMove).toBe(true);
    });

    it('should reject invalid moves', () => {
      // Piece at (0,0) should not be able to move to empty position at (1,1)
      const piece = { id: '1', position: { x: 0, y: 0 }, correctPosition: { x: 0, y: 0 } };
      
      const canMove = engine.canMove(piece);
      expect(canMove).toBe(false);
    });
  });

  describe('Game Completion', () => {
    it('should detect when puzzle is complete', () => {
      // Create a solved puzzle configuration
      const solvedConfig: PuzzleConfig = {
        pieces: [
          { id: '1', position: { x: 0, y: 0 }, correctPosition: { x: 0, y: 0 } },
          { id: '2', position: { x: 1, y: 0 }, correctPosition: { x: 1, y: 0 } },
          { id: '3', position: { x: 0, y: 1 }, correctPosition: { x: 0, y: 1 } },
          { id: '4', position: { x: 1, y: 1 }, correctPosition: { x: 1, y: 1 } },
        ],
        timeLimit: 300,
        difficulty: 'easy',
      };

      const solvedEngine = new PuzzleGameEngine(solvedConfig);
      
      // Manually set all pieces to correct positions
      solvedEngine.getState().pieces.forEach(piece => {
        piece.position = piece.correctPosition;
      });

      const isComplete = solvedEngine.checkCompletion();
      expect(isComplete).toBe(true);
    });

    it('should not be complete with misplaced pieces', () => {
      const isComplete = engine.checkCompletion();
      expect(isComplete).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid piece moves gracefully', () => {
      const invalidPiece = { id: 'invalid', position: { x: 999, y: 999 }, correctPosition: { x: 0, y: 0 } };
      
      expect(() => {
        engine.movePiece(invalidPiece);
      }).toThrow('Cannot move piece');
    });

    it('should handle empty configuration', () => {
      const emptyConfig: PuzzleConfig = {
        pieces: [],
        timeLimit: 300,
        difficulty: 'easy',
      };

      expect(() => {
        new PuzzleGameEngine(emptyConfig);
      }).toThrow();
    });
  });

  describe('Time Management', () => {
    it('should update time remaining', () => {
      const initialState = engine.getState();
      expect(initialState.timeRemaining).toBe(300);

      engine.updateTime(60);
      
      const updatedState = engine.getState();
      expect(updatedState.timeRemaining).toBe(240);
    });

    it('should handle time expiration', () => {
      engine.updateTime(300);
      
      const state = engine.getState();
      expect(state.timeRemaining).toBe(0);
      expect(state.isComplete).toBe(false); // Game should not auto-complete on timeout
    });
  });
});
