'use client';

import React, { useState, useEffect } from 'react';
import { GameState, MemoryCard } from '@/types/games';
import { MemoryGameEngine } from '@/lib/gameEngine/MemoryGameEngine';

interface MemoryGameUIProps {
  gameEngine: MemoryGameEngine;
  gameState: GameState;
  onStateChange: (state: GameState) => void;
}

interface MemoryUIState {
  cards: MemoryCard[];
  flippedCards: string[];
  matchedCards: string[];
  canFlip: boolean;
  showFeedback: boolean;
  feedbackMessage: string;
  moves: number;
  timeBonus: number;
}

export default function MemoryGameUI({ gameEngine, gameState, onStateChange }: MemoryGameUIProps) {
  const [uiState, setUIState] = useState<MemoryUIState>({
    cards: [],
    flippedCards: [],
    matchedCards: [],
    canFlip: true,
    showFeedback: false,
    feedbackMessage: '',
    moves: 0,
    timeBonus: 0,
  });

  // Initialize game data
  useEffect(() => {
    const gameData = gameEngine.getCurrentGameData();
    if (gameData) {
      setUIState(prev => ({
        ...prev,
        cards: gameData.cards || [],
        matchedCards: gameData.matchedCards || [],
        moves: gameData.moves || 0,
        timeBonus: gameData.timeBonus || 0,
      }));
    }
  }, [gameState.currentStep, gameEngine]);

  const handleCardClick = (cardId: string) => {
    if (!uiState.canFlip || 
        uiState.flippedCards.includes(cardId) || 
        uiState.matchedCards.includes(cardId) ||
        uiState.flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...uiState.flippedCards, cardId];
    
    setUIState(prev => ({
      ...prev,
      flippedCards: newFlippedCards,
      moves: prev.moves + (newFlippedCards.length === 1 ? 1 : 0),
    }));

    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setUIState(prev => ({ ...prev, canFlip: false }));
      
      setTimeout(() => {
        const result = gameEngine.checkMatch(newFlippedCards[0], newFlippedCards[1]);
        
        if (result.isMatch) {
          setUIState(prev => ({
            ...prev,
            matchedCards: [...prev.matchedCards, ...newFlippedCards],
            flippedCards: [],
            canFlip: true,
            showFeedback: true,
            feedbackMessage: 'Great match! 🎉',
          }));

          // Check if round is complete
          const totalCards = uiState.cards.length;
          const newMatchedCount = uiState.matchedCards.length + 2;
          
          if (newMatchedCount >= totalCards) {
            setTimeout(() => {
              const roundResult = gameEngine.completeRound();
              setUIState(prev => ({
                ...prev,
                showFeedback: true,
                feedbackMessage: `Round Complete! Score: ${roundResult.score}`,
                timeBonus: roundResult.timeBonus || 0,
              }));

              setTimeout(() => {
                if (gameState.currentStep < gameState.totalSteps) {
                  gameEngine.nextRound();
                }
                onStateChange(gameEngine.getState());
              }, 3000);
            }, 1000);
          }
        } else {
          setUIState(prev => ({
            ...prev,
            flippedCards: [],
            canFlip: true,
            showFeedback: true,
            feedbackMessage: 'Not a match, try again! 💪',
          }));
        }

        // Hide feedback after 2 seconds
        setTimeout(() => {
          setUIState(prev => ({ ...prev, showFeedback: false, feedbackMessage: '' }));
        }, 2000);

        onStateChange(gameEngine.getState());
      }, 1000);
    }
  };

  const handleRestart = () => {
    gameEngine.resetRound();
    setUIState(prev => ({
      ...prev,
      flippedCards: [],
      matchedCards: [],
      moves: 0,
      canFlip: true,
      showFeedback: false,
      feedbackMessage: '',
    }));
    onStateChange(gameEngine.getState());
  };

  const getCardClassName = (card: MemoryCard): string => {
    const baseClass = "relative w-20 h-20 cursor-pointer transition-all duration-300 transform ";
    const borderClass = "border-2 rounded-lg ";
    
    if (uiState.matchedCards.includes(card.id)) {
      return baseClass + borderClass + "border-green-500 bg-green-50 scale-95 cursor-default";
    }
    
    if (uiState.flippedCards.includes(card.id)) {
      return baseClass + borderClass + "border-blue-500 bg-white scale-105";
    }
    
    return baseClass + borderClass + "border-gray-300 bg-gray-100 hover:bg-gray-200 hover:scale-105";
  };

  const isCardFlipped = (cardId: string): boolean => {
    return uiState.flippedCards.includes(cardId) || uiState.matchedCards.includes(cardId);
  };

  const getGridClassName = (): string => {
    const cardCount = uiState.cards.length;
    if (cardCount <= 12) return "grid-cols-4";
    if (cardCount <= 20) return "grid-cols-5";
    return "grid-cols-6";
  };

  const calculateAccuracy = (): number => {
    if (uiState.moves === 0) return 100;
    const perfectMoves = uiState.matchedCards.length / 2;
    return Math.round((perfectMoves / uiState.moves) * 100);
  };

  const getPerformanceMessage = (): string => {
    const accuracy = calculateAccuracy();
    if (accuracy >= 90) return "Excellent memory! 🧠✨";
    if (accuracy >= 75) return "Great job! 👍";
    if (accuracy >= 60) return "Good work! 👌";
    return "Keep practicing! 💪";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Memory Challenge
            </h2>
            <p className="text-gray-600 text-sm">
              Find all matching pairs by flipping cards
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
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-blue-600">{uiState.moves}</div>
            <div className="text-xs text-blue-800">Moves</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-green-600">
              {uiState.matchedCards.length / 2}
            </div>
            <div className="text-xs text-green-800">Matches</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-purple-600">
              {calculateAccuracy()}%
            </div>
            <div className="text-xs text-purple-800">Accuracy</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-orange-600">
              +{uiState.timeBonus}
            </div>
            <div className="text-xs text-orange-800">Time Bonus</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(uiState.matchedCards.length / uiState.cards.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {uiState.matchedCards.length} of {uiState.cards.length} cards matched
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className={`grid ${getGridClassName()} gap-4 justify-items-center`}>
          {uiState.cards.map((card) => (
            <div
              key={card.id}
              className={getCardClassName(card)}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Card Back */}
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg transition-opacity duration-300 ${
                  isCardFlipped(card.id) ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="text-white text-2xl">🎴</div>
              </div>
              
              {/* Card Front */}
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-white rounded-lg transition-opacity duration-300 ${
                  isCardFlipped(card.id) ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{card.icon}</div>
                  {card.label && (
                    <div className="text-xs text-gray-600">{card.label}</div>
                  )}
                </div>
              </div>
              
              {/* Match Effect */}
              {uiState.matchedCards.includes(card.id) && (
                <div className="absolute inset-0 bg-green-200 bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="text-green-600 text-lg">✓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={handleRestart}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Restart Round
        </button>
        
        {uiState.matchedCards.length >= uiState.cards.length && (
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
      {uiState.matchedCards.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-blue-900 font-medium">{getPerformanceMessage()}</p>
          <p className="text-blue-700 text-sm mt-1">
            Keep going to improve your memory skills!
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">How to Play:</h3>
        <ul className="text-gray-700 text-sm space-y-1">
          <li>• Click on cards to flip them over</li>
          <li>• Find matching pairs by remembering card positions</li>
          <li>• Complete all matches to finish the round</li>
          <li>• Try to minimize your moves for a higher score</li>
        </ul>
      </div>

      {/* Feedback Overlay */}
      {uiState.showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm mx-4">
            <div className="text-4xl mb-2">
              {uiState.feedbackMessage.includes('match') ? '🎉' : 
               uiState.feedbackMessage.includes('Complete') ? '🏆' : '💪'}
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {uiState.feedbackMessage}
            </p>
            {uiState.feedbackMessage.includes('Complete') && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Moves: {uiState.moves}</p>
                <p>Accuracy: {calculateAccuracy()}%</p>
                {uiState.timeBonus > 0 && <p>Time Bonus: +{uiState.timeBonus}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}