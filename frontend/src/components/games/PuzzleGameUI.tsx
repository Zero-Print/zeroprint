'use client';

import React, { useState, useEffect } from 'react';
import { GameState, PuzzlePiece } from '@/types/games';
import { PuzzleGameEngine } from '@/lib/gameEngine/PuzzleGameEngine';

interface PuzzleGameUIProps {
  gameEngine: PuzzleGameEngine;
  gameState: GameState;
  onStateChange: (state: GameState) => void;
}

interface PuzzleUIState {
  pieces: PuzzlePiece[];
  gridSize: number;
  emptyPosition: { row: number; col: number };
  moves: number;
  isComplete: boolean;
  showFeedback: boolean;
  feedbackMessage: string;
  puzzleType: 'sliding' | 'jigsaw';
  selectedPiece: string | null;
}

export default function PuzzleGameUI({ gameEngine, gameState, onStateChange }: PuzzleGameUIProps) {
  const [uiState, setUIState] = useState<PuzzleUIState>({
    pieces: [],
    gridSize: 3,
    emptyPosition: { row: 2, col: 2 },
    moves: 0,
    isComplete: false,
    showFeedback: false,
    feedbackMessage: '',
    puzzleType: 'sliding',
    selectedPiece: null,
  });

  // Initialize game data
  useEffect(() => {
    const gameData = gameEngine.getCurrentGameData();
    if (gameData) {
      setUIState(prev => ({
        ...prev,
        pieces: gameData.pieces || [],
        gridSize: gameData.gridSize || 3,
        emptyPosition: gameData.emptyPosition || { row: 2, col: 2 },
        moves: gameData.moves || 0,
        isComplete: gameData.isComplete || false,
        puzzleType: gameData.puzzleType || 'sliding',
      }));
    }
  }, [gameState.currentStep, gameEngine]);

  const handlePieceClick = (pieceId: string) => {
    if (uiState.isComplete) return;

    const piece = uiState.pieces.find(p => p.id === pieceId);
    if (!piece) return;

    if (uiState.puzzleType === 'sliding') {
      handleSlidingPuzzleMove(piece);
    } else {
      handleJigsawPuzzleMove(piece);
    }
  };

  const handleSlidingPuzzleMove = (piece: PuzzlePiece) => {
    const canMove = isAdjacentToEmpty(piece.currentPosition);
    
    if (canMove) {
      const result = gameEngine.movePiece(piece.id, uiState.emptyPosition);
      
      if (result.success) {
        setUIState(prev => ({
          ...prev,
          pieces: result.newPieces || prev.pieces,
          emptyPosition: piece.currentPosition,
          moves: prev.moves + 1,
          isComplete: result.isComplete || false,
        }));

        if (result.isComplete) {
          setUIState(prev => ({
            ...prev,
            showFeedback: true,
            feedbackMessage: `Puzzle Complete! 🎉\nMoves: ${prev.moves + 1}`,
          }));

          setTimeout(() => {
            const roundResult = gameEngine.completeRound();
            onStateChange(gameEngine.getState());
          }, 3000);
        } else {
          onStateChange(gameEngine.getState());
        }
      }
    }
  };

  const handleJigsawPuzzleMove = (piece: PuzzlePiece) => {
    if (uiState.selectedPiece === piece.id) {
      // Deselect if clicking the same piece
      setUIState(prev => ({ ...prev, selectedPiece: null }));
    } else if (uiState.selectedPiece) {
      // Try to swap pieces
      const result = gameEngine.swapPieces(uiState.selectedPiece, piece.id);
      
      if (result.success) {
        setUIState(prev => ({
          ...prev,
          pieces: result.newPieces || prev.pieces,
          selectedPiece: null,
          moves: prev.moves + 1,
          isComplete: result.isComplete || false,
        }));

        if (result.isComplete) {
          setUIState(prev => ({
            ...prev,
            showFeedback: true,
            feedbackMessage: `Puzzle Complete! 🎉\nMoves: ${prev.moves + 1}`,
          }));

          setTimeout(() => {
            const roundResult = gameEngine.completeRound();
            onStateChange(gameEngine.getState());
          }, 3000);
        } else {
          onStateChange(gameEngine.getState());
        }
      } else {
        setUIState(prev => ({ ...prev, selectedPiece: null }));
      }
    } else {
      // Select piece
      setUIState(prev => ({ ...prev, selectedPiece: piece.id }));
    }
  };

  const isAdjacentToEmpty = (position: { row: number; col: number }): boolean => {
    const { row, col } = position;
    const { row: emptyRow, col: emptyCol } = uiState.emptyPosition;
    
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  const handleShuffle = () => {
    gameEngine.shufflePuzzle();
    setUIState(prev => ({
      ...prev,
      moves: 0,
      isComplete: false,
      selectedPiece: null,
    }));
    onStateChange(gameEngine.getState());
  };

  const handleReset = () => {
    gameEngine.resetRound();
    setUIState(prev => ({
      ...prev,
      moves: 0,
      isComplete: false,
      selectedPiece: null,
    }));
    onStateChange(gameEngine.getState());
  };

  const getPieceClassName = (piece: PuzzlePiece): string => {
    const baseClass = "relative cursor-pointer transition-all duration-200 border-2 flex items-center justify-center ";
    const sizeClass = "w-20 h-20 ";
    
    if (uiState.isComplete && piece.isInCorrectPosition) {
      return baseClass + sizeClass + "border-green-500 bg-green-50 text-green-700";
    }
    
    if (uiState.selectedPiece === piece.id) {
      return baseClass + sizeClass + "border-blue-500 bg-blue-50 text-blue-700 scale-105";
    }
    
    if (piece.isInCorrectPosition) {
      return baseClass + sizeClass + "border-green-300 bg-green-25 text-green-600";
    }
    
    if (uiState.puzzleType === 'sliding' && isAdjacentToEmpty(piece.currentPosition)) {
      return baseClass + sizeClass + "border-blue-300 bg-blue-25 text-blue-600 hover:bg-blue-50";
    }
    
    return baseClass + sizeClass + "border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
  };

  const getEmptySlotClassName = (): string => {
    return "w-20 h-20 border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400";
  };

  const renderPuzzleGrid = () => {
    const grid = Array(uiState.gridSize).fill(null).map(() => Array(uiState.gridSize).fill(null));
    
    // Place pieces in grid
    uiState.pieces.forEach(piece => {
      if (piece.currentPosition) {
        grid[piece.currentPosition.row][piece.currentPosition.col] = piece;
      }
    });

    return (
      <div 
        className="inline-block bg-gray-200 p-2 rounded-lg"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${uiState.gridSize}, 1fr)`,
          gap: '2px'
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            if (piece) {
              return (
                <div
                  key={piece.id}
                  className={getPieceClassName(piece)}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{piece.content}</div>
                    {piece.label && (
                      <div className="text-xs">{piece.label}</div>
                    )}
                  </div>
                </div>
              );
            } else if (
              uiState.puzzleType === 'sliding' &&
              rowIndex === uiState.emptyPosition.row &&
              colIndex === uiState.emptyPosition.col
            ) {
              return (
                <div
                  key={`empty-${rowIndex}-${colIndex}`}
                  className={getEmptySlotClassName()}
                >
                  <div className="text-xs">Empty</div>
                </div>
              );
            } else {
              return (
                <div
                  key={`slot-${rowIndex}-${colIndex}`}
                  className="w-20 h-20 border-2 border-gray-200 bg-gray-100"
                />
              );
            }
          })
        )}
      </div>
    );
  };

  const calculateProgress = (): number => {
    const correctPieces = uiState.pieces.filter(p => p.isInCorrectPosition).length;
    return Math.round((correctPieces / uiState.pieces.length) * 100);
  };

  const getPerformanceMessage = (): string => {
    if (uiState.moves <= uiState.pieces.length) return "Perfect! Minimal moves! 🏆";
    if (uiState.moves <= uiState.pieces.length * 2) return "Excellent efficiency! ⭐";
    if (uiState.moves <= uiState.pieces.length * 3) return "Good job! 👍";
    return "Completed! Keep practicing! 💪";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {uiState.puzzleType === 'sliding' ? 'Sliding Puzzle' : 'Jigsaw Puzzle'}
            </h2>
            <p className="text-gray-600 text-sm">
              {uiState.puzzleType === 'sliding' 
                ? 'Slide pieces to arrange them in order'
                : 'Swap pieces to complete the puzzle'
              }
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Round {gameState.currentStep} of {gameState.totalSteps}
            </div>
            <div className="text-lg font-semibold text-green-600">
              Score: {gameState.score}
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-blue-600">{uiState.moves}</div>
            <div className="text-xs text-blue-800">Moves</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-green-600">
              {calculateProgress()}%
            </div>
            <div className="text-xs text-green-800">Complete</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-purple-600">
              {uiState.pieces.filter(p => p.isInCorrectPosition).length}
            </div>
            <div className="text-xs text-purple-800">Correct</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Puzzle Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-center">
          {renderPuzzleGrid()}
        </div>
        
        {uiState.puzzleType === 'jigsaw' && uiState.selectedPiece && (
          <div className="mt-4 text-center text-blue-600 text-sm">
            Selected piece: {uiState.pieces.find(p => p.id === uiState.selectedPiece)?.content}
            <br />
            Click another piece to swap positions
          </div>
        )}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={handleShuffle}
          disabled={uiState.isComplete}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          Shuffle
        </button>
        
        <button
          onClick={handleReset}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
        
        {uiState.isComplete && (
          <button
            onClick={() => {
              if (gameState.currentStep < gameState.totalSteps) {
                gameEngine.nextRound();
              }
              onStateChange(gameEngine.getState());
            }}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {gameState.currentStep >= gameState.totalSteps ? 'Complete Game' : 'Next Round'}
          </button>
        )}
      </div>

      {/* Performance Feedback */}
      {uiState.isComplete && (
        <div className="bg-green-50 rounded-lg p-4 text-center mb-6">
          <p className="text-green-900 font-medium">{getPerformanceMessage()}</p>
          <p className="text-green-700 text-sm mt-1">
            Completed in {uiState.moves} moves
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">How to Play:</h3>
        <ul className="text-gray-700 text-sm space-y-1">
          {uiState.puzzleType === 'sliding' ? (
            <>
              <li>• Click on pieces adjacent to the empty space to slide them</li>
              <li>• Arrange all pieces in the correct order</li>
              <li>• Use the shuffle button to mix up the puzzle</li>
              <li>• Try to solve it in as few moves as possible</li>
            </>
          ) : (
            <>
              <li>• Click on a piece to select it (highlighted in blue)</li>
              <li>• Click on another piece to swap their positions</li>
              <li>• Arrange all pieces in their correct positions</li>
              <li>• Green borders indicate correctly placed pieces</li>
            </>
          )}
        </ul>
      </div>

      {/* Feedback Overlay */}
      {uiState.showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm mx-4">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-semibold text-gray-900 whitespace-pre-line">
              {uiState.feedbackMessage}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {getPerformanceMessage()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}