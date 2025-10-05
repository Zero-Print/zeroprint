import { PuzzlePiece, PuzzleConfig } from '@/types/games';

export interface PuzzleGameState {
  pieces: PuzzlePiece[];
  emptyPosition: { x: number; y: number };
  moves: number;
  isComplete: boolean;
  timeRemaining?: number;
}

export class PuzzleGameEngine {
  private config: PuzzleConfig;
  private state: PuzzleGameState;
  private gridSize: number;

  constructor(config: PuzzleConfig) {
    this.config = config;
    this.gridSize = Math.sqrt(config.pieces.length);
    this.state = {
      pieces: [...config.pieces],
      emptyPosition: { x: this.gridSize - 1, y: this.gridSize - 1 },
      moves: 0,
      isComplete: false,
      timeRemaining: config.timeLimit,
    };
  }

  getState(): PuzzleGameState {
    return { ...this.state };
  }

  movePiece(pieceId: string): { success: boolean; isComplete: boolean; message?: string } {
    if (this.state.isComplete) {
      return { success: false, isComplete: true, message: 'Game already completed' };
    }

    const piece = this.state.pieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) {
      return { success: false, isComplete: false, message: 'Invalid piece' };
    }

    // Check if piece can move to empty position
    const canMove = this.canMoveToEmpty(piece);
    if (!canMove) {
      return { success: false, isComplete: false, message: 'Cannot move this piece' };
    }

    // Move piece to empty position
    const oldPosition = { ...piece.currentPosition };
    piece.currentPosition = { ...this.state.emptyPosition };
    this.state.emptyPosition = oldPosition;
    this.state.moves++;

    // Check if piece is in correct position
    piece.isInCorrectPosition = this.isInCorrectPosition(piece);

    // Check if game is complete
    const allPiecesCorrect = this.state.pieces.every(p => p.isInCorrectPosition);
    if (allPiecesCorrect) {
      this.state.isComplete = true;
      return { success: true, isComplete: true, message: 'Congratulations! Puzzle completed!' };
    }

    return { success: true, isComplete: false };
  }

  private canMoveToEmpty(piece: PuzzlePiece): boolean {
    const { x, y } = piece.currentPosition;
    const { x: emptyX, y: emptyY } = this.state.emptyPosition;
    
    // Check if piece is adjacent to empty position
    const dx = Math.abs(x - emptyX);
    const dy = Math.abs(y - emptyY);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  private isInCorrectPosition(piece: PuzzlePiece): boolean {
    return piece.currentPosition.x === piece.correctPosition.x && 
           piece.currentPosition.y === piece.correctPosition.y;
  }

  shuffle(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.state.pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.state.pieces[i].currentPosition;
      this.state.pieces[i].currentPosition = this.state.pieces[j].currentPosition;
      this.state.pieces[j].currentPosition = temp;
    }

    // Update isInCorrectPosition for all pieces
    this.state.pieces.forEach(piece => {
      piece.isInCorrectPosition = this.isInCorrectPosition(piece);
    });

    this.state.moves = 0;
    this.state.isComplete = false;
  }

  reset(): void {
    this.state = {
      pieces: this.config.pieces.map(piece => ({
        ...piece,
        currentPosition: { ...piece.correctPosition },
        isPlaced: false,
        isInCorrectPosition: true,
      })),
      emptyPosition: { x: this.gridSize - 1, y: this.gridSize - 1 },
      moves: 0,
      isComplete: false,
      timeRemaining: this.config.timeLimit,
    };
  }

  getScore(): number {
    const totalPieces = this.state.pieces.length;
    const correctPieces = this.state.pieces.filter(p => p.isInCorrectPosition).length;
    const efficiency = Math.max(0, 1 - this.state.moves / (totalPieces * 2));
    return Math.round((correctPieces / totalPieces) * 100 * efficiency);
  }

  getCurrentGameData(): PuzzleGameState {
    return this.state as PuzzleGameState;
  }

  getGameMode(): string {
    return 'puzzle';
  }

  getCurrentRoundTitle(): string {
    return 'Puzzle Challenge';
  }

  nextRound(): PuzzleGameState {
    this.state = this.shufflePuzzle();
    return this.state as PuzzleGameState;
  }

  resetRound(): PuzzleGameState {
    this.state = {
      ...this.state,
      pieces: this.initializePieces(this.config.pieces),
      emptyPosition: { row: -1, col: -1 },
      moves: 0,
      isComplete: false,
    };
    return this.state as PuzzleGameState;
  }

  completeRound(): PuzzleGameState {
    this.state.isComplete = true;
    return this.state as PuzzleGameState;
  }

  swapPieces(piece1Id: string, piece2Id: string): { success: boolean; isComplete: boolean; message?: string } {
    const piece1 = this.state.pieces.find(p => p.id === piece1Id);
    const piece2 = this.state.pieces.find(p => p.id === piece2Id);
    
    if (!piece1 || !piece2) {
      return { success: false, isComplete: this.state.isComplete, message: 'Invalid pieces' };
    }
    
    // Swap positions
    const tempPosition = piece1.currentPosition;
    piece1.currentPosition = piece2.currentPosition;
    piece2.currentPosition = tempPosition;
    
    this.state.moves++;
    
    // Check if puzzle is complete
    const isComplete = this.checkCompletion();
    this.state.isComplete = isComplete;
    
    return { success: true, isComplete, message: isComplete ? 'Puzzle complete!' : 'Pieces swapped' };
  }

  shufflePuzzle(): PuzzleGameState {
    this.state.pieces = this.initializePieces(this.config.pieces);
    this.state.moves = 0;
    this.state.isComplete = false;
    return this.state as PuzzleGameState;
  }
}
