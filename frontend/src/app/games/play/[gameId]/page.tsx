'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth';
import { Game, GameState, GameResult } from '@/types/games';
import { gameEngineUtils } from '@/lib/gameEngine';
import { GameIntegrationService } from '@/lib/gameIntegration';
import { GameSecurityService } from '@/lib/gameSecurity';
import apiClient from '@/lib/api';

// Game UI Components
import QuizGameUI from '@/components/games/QuizGameUI';
import DragDropGameUI from '@/components/games/DragDropGameUI';
import SimulationGameUI from '@/components/games/SimulationGameUI';

interface GamePlayState {
  game: Game | null;
  gameEngine: any;
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  timeRemaining: number;
  isPaused: boolean;
  showResults: boolean;
  gameResult: GameResult | null;
}

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gameId = params.gameId as string;

  const [playState, setPlayState] = useState<GamePlayState>({
    game: null,
    gameEngine: null,
    gameState: null,
    loading: true,
    error: null,
    sessionId: null,
    timeRemaining: 0,
    isPaused: false,
    showResults: false,
    gameResult: null,
  });

  const gameIntegration = new GameIntegrationService();
  const gameSecurity = new GameSecurityService();

  // Initialize game
  useEffect(() => {
    if (!user || !gameId) return;
    initializeGame();
  }, [user, gameId, initializeGame]);

  // Game timer
  useEffect(() => {
    if (!playState.gameState || playState.isPaused || playState.showResults) return;

    const timer = setInterval(() => {
      setPlayState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          handleGameTimeout();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playState.gameState, playState.isPaused, playState.showResults, handleGameTimeout]);

  const initializeGame = useCallback(async () => {
    try {
      setPlayState(prev => ({ ...prev, loading: true, error: null }));

      // Load game configuration
      const game = await apiClient.games.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Start security session
      const sessionId = await gameSecurity.startSession(gameId, user!.uid);

      // Create game engine
      const engine = gameEngineUtils.createEngine(game.type);
      engine.initialize(game, user!.uid);

      // Set up event listeners
      engine.addEventListener('stateChange', handleGameStateChange);
      engine.addEventListener('complete', handleGameComplete);
      engine.addEventListener('error', handleGameError);

      setPlayState(prev => ({
        ...prev,
        game,
        gameEngine: engine,
        gameState: engine.getState(),
        sessionId,
        timeRemaining: game.estimatedTime,
        loading: false,
      }));

    } catch (error) {
      console.error('Failed to initialize game:', error);
      setPlayState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load game',
        loading: false,
      }));
    }
  }, [gameId, gameSecurity, user]);

  const handleGameStateChange = useCallback((newState: GameState) => {
    setPlayState(prev => ({ ...prev, gameState: newState }));
    
    // Record interaction for security
    if (playState.sessionId) {
      gameSecurity.recordInteraction(playState.sessionId, {
        type: 'state_change',
        timestamp: Date.now(),
        data: { score: newState.score, step: newState.currentStep }
      });
    }
  }, [playState.sessionId]);

  const handleGameComplete = useCallback(async (result: GameResult) => {
    try {
      if (!playState.sessionId || !playState.game) return;

      // Validate game completion
      const validation = await gameSecurity.validateGameCompletion(
        playState.sessionId,
        result
      );

      if (!validation.isValid) {
        throw new Error(`Game validation failed: ${validation.reason}`);
      }

      // Process game completion
      const completionData = await gameIntegration.completeGame({
        gameId: playState.game.gameId,
        userId: user!.uid,
        score: result.score,
        maxScore: result.maxScore,
        completedAt: new Date().toISOString(),
        timeTaken: playState.game.estimatedTime - playState.timeRemaining,
        metadata: result.metadata
      });

      setPlayState(prev => ({
        ...prev,
        showResults: true,
        gameResult: {
          ...result,
          coinsEarned: completionData.coinsEarned,
          leaderboardPosition: completionData.leaderboardPosition
        }
      }));

    } catch (error) {
      console.error('Failed to complete game:', error);
      setPlayState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to complete game'
      }));
    }
  }, [playState.sessionId, playState.game, playState.timeRemaining, user]);

  const handleGameError = useCallback((error: Error) => {
    console.error('Game error:', error);
    setPlayState(prev => ({
      ...prev,
      error: error.message
    }));
  }, []);

  const handleGameTimeout = useCallback(() => {
    if (playState.gameEngine) {
      playState.gameEngine.forceComplete();
    }
  }, [playState.gameEngine]);

  const handlePauseToggle = useCallback(() => {
    setPlayState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleQuitGame = useCallback(() => {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
      router.push('/games');
    }
  }, [router]);

  const handlePlayAgain = useCallback(() => {
    setPlayState(prev => ({
      ...prev,
      showResults: false,
      gameResult: null,
      timeRemaining: prev.game?.estimatedTime || 0
    }));
    initializeGame();
  }, [initializeGame]);

  const handleReturnToGames = useCallback(() => {
    router.push('/games');
  }, [router]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!playState.gameState) return 0;
    return (playState.gameState.currentStep / playState.gameState.totalSteps) * 100;
  };

  // Loading state
  if (playState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Game...</h2>
          <p className="text-gray-600">Preparing your sustainability challenge</p>
        </div>
      </div>
    );
  }

  // Error state
  if (playState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Game Error</h2>
          <p className="text-gray-600 mb-6">{playState.error}</p>
          <div className="space-y-3">
            <button
              onClick={initializeGame}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleReturnToGames}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Return to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (playState.showResults && playState.gameResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Complete!</h2>
            <p className="text-gray-600 mb-6">Great job on completing the challenge!</p>
            
            {/* Results */}
            <div className="space-y-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {playState.gameResult.score} / {playState.gameResult.maxScore}
                </div>
                <div className="text-sm text-green-700">Final Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-semibold text-blue-600">
                    {playState.gameResult.coinsEarned || 0}
                  </div>
                  <div className="text-xs text-blue-700">HealCoins Earned</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-semibold text-purple-600">
                    #{playState.gameResult.leaderboardPosition || 'N/A'}
                  </div>
                  <div className="text-xs text-purple-700">Leaderboard</div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handlePlayAgain}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleReturnToGames}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game UI
  if (!playState.game || !playState.gameState || !playState.gameEngine) {
    return null;
  }

  const renderGameUI = () => {
    switch (playState.game!.type) {
      case 'quiz':
        return (
          <QuizGameUI
            gameEngine={playState.gameEngine}
            gameState={playState.gameState}
            onStateChange={handleGameStateChange}
          />
        );
      case 'dragdrop':
        return (
          <DragDropGameUI
            gameEngine={playState.gameEngine}
            gameState={playState.gameState}
            onStateChange={handleGameStateChange}
          />
        );
      case 'simulation':
        return (
          <SimulationGameUI
            gameEngine={playState.gameEngine}
            gameState={playState.gameState}
            onStateChange={handleGameStateChange}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Game Type Not Supported</h3>
            <p className="text-gray-600">This game type is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Game Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Game Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleQuitGame}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {playState.game.title}
                </h1>
                <div className="text-sm text-gray-600">
                  Score: {playState.gameState.score} / {playState.gameState.maxScore}
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="text-sm font-medium text-gray-700">
                ⏱️ {formatTime(playState.timeRemaining)}
              </div>

              {/* Pause Button */}
              <button
                onClick={handlePauseToggle}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {playState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>

              {/* Quit Button */}
              <button
                onClick={handleQuitGame}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Step {playState.gameState.currentStep} of {playState.gameState.totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="container mx-auto px-4 py-6">
        {playState.isPaused ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏸️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Game Paused</h3>
            <p className="text-gray-600 mb-6">Take a break and resume when you're ready!</p>
            <button
              onClick={handlePauseToggle}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Resume Game
            </button>
          </div>
        ) : (
          renderGameUI()
        )}
      </div>
    </div>
  );
}