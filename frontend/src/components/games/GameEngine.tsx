/**
 * Game Engine Component
 * Renders different game types from JSON configurations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trophy,
  Coins,
  Loader2
} from 'lucide-react';
import { GameConfig, QuizQuestion, DragDropConfig, SimulationConfig, MemoryConfig, PuzzleConfig } from '@/types';
import { QuizGame } from './QuizGame';
import { DragDropGame } from './DragDropGame';
import { SimulationGame } from './SimulationGame';
import { MemoryGame } from './MemoryGame';
import { PuzzleGame } from './PuzzleGame';

interface GameEngineProps {
  gameId: string;
  config: GameConfig;
  onComplete: (score: number, clientData: any, playTime: number) => void;
  onError: (error: string) => void;
}

export function GameEngine({ gameId, config, onComplete, onError }: GameEngineProps) {
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'error'>('loading');
  const [score, setScore] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const [clientData, setClientData] = useState<any>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'playing' && !isPaused) {
      interval = setInterval(() => {
        setPlayTime(prev => {
          const newTime = prev + 1;
          
          // Check time limit
          if ((config as any).timeLimit && newTime >= (config as any).timeLimit) {
            handleTimeUp();
            return newTime;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, isPaused, (config as any).timeLimit]);

  // Time remaining effect
  useEffect(() => {
    if ((config as any).timeLimit && gameState === 'playing') {
      setTimeRemaining((config as any).timeLimit - playTime);
    } else {
      setTimeRemaining(null);
    }
  }, [(config as any).timeLimit, playTime, gameState]);

  const handleTimeUp = useCallback(() => {
    setGameState('completed');
    onComplete(score, clientData, playTime);
  }, [score, clientData, playTime, onComplete]);

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
    setPlayTime(0);
    setClientData({});
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setGameState('ready');
    setScore(0);
    setPlayTime(0);
    setClientData({});
    setIsPaused(false);
  };

  const handleScoreUpdate = (newScore: number, newClientData: any) => {
    setScore(newScore);
    setClientData(newClientData);
  };

  const handleComplete = () => {
    setGameState('completed');
    onComplete(score, clientData, playTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScorePercentage = () => {
    return Math.round((score / (config as any).maxScore) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading game...</span>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load game. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{(config as any).title}</span>
                <Badge className={getDifficultyColor((config as any).difficulty)}>
                  {(config as any).difficulty}
                </Badge>
              </CardTitle>
              <CardDescription>{(config as any).description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">/ {(config as any).maxScore}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{getScorePercentage()}%</span>
              </div>
              <Progress value={getScorePercentage()} className="h-2" />
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{formatTime(playTime)}</div>
                <div className="text-xs text-muted-foreground">Play Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{(config as any).maxScore}</div>
                <div className="text-xs text-muted-foreground">Max Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {timeRemaining !== null ? formatTime(timeRemaining) : '∞'}
                </div>
                <div className="text-xs text-muted-foreground">Time Left</div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex justify-center space-x-2">
              {gameState === 'ready' && (
                <Button onClick={handleStart} size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              )}
              
              {gameState === 'playing' && (
                <>
                  <Button onClick={handlePause} variant="outline">
                    {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
              
              {gameState === 'completed' && (
                <Button onClick={handleReset} size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Play Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Content */}
      {gameState === 'ready' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🎮</div>
              <h3 className="text-2xl font-bold">Ready to Play?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {(config as any).type === 'quiz' && 'Answer questions correctly to earn points.'}
                {(config as any).type === 'drag-drop' && 'Drag items to their correct categories.'}
                {(config as any).type === 'simulation' && 'Complete objectives in the simulation.'}
                {(config as any).type === 'memory' && 'Match pairs of cards to test your memory.'}
                {(config as any).type === 'puzzle' && 'Solve the puzzle by arranging pieces correctly.'}
              </p>
              <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>Max Score: {(config as any).maxScore}</span>
                </div>
                {(config as any).timeLimit && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Time Limit: {formatTime((config as any).timeLimit)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4" />
                  <span>Reward: {(config as any).rewards?.baseCoins || 0} coins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Components */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {(config as any).type === 'quiz' && (config as any).questions && (
            <QuizGame
              questions={(config as any).questions}
              onScoreUpdate={handleScoreUpdate}
              onComplete={handleComplete}
              timeLimit={(config as any).timeLimit}
              isPaused={isPaused}
            />
          )}
          
          {(config as any).type === 'drag-drop' && (config as any).dragDropConfig && (
            <DragDropGame
              config={(config as any).dragDropConfig}
              onScoreUpdate={handleScoreUpdate}
              onComplete={handleComplete}
              timeLimit={(config as any).timeLimit}
              isPaused={isPaused}
            />
          )}
          
          {(config as any).type === 'simulation' && (config as any).simulationConfig && (
            <SimulationGame
              config={(config as any).simulationConfig}
              onScoreUpdate={handleScoreUpdate}
              onComplete={handleComplete}
              timeLimit={(config as any).timeLimit}
              isPaused={isPaused}
            />
          )}
          
          {(config as any).type === 'memory' && (config as any).memoryConfig && (
            <MemoryGame
              config={(config as any).memoryConfig}
              onScoreUpdate={handleScoreUpdate}
              onComplete={handleComplete}
              timeLimit={(config as any).timeLimit}
              isPaused={isPaused}
            />
          )}
          
          {(config as any).type === 'puzzle' && (config as any).puzzleConfig && (
            <PuzzleGame
              config={(config as any).puzzleConfig}
              onScoreUpdate={handleScoreUpdate}
              onComplete={handleComplete}
              timeLimit={(config as any).timeLimit}
              isPaused={isPaused}
            />
          )}
        </div>
      )}

      {/* Completion Screen */}
      {gameState === 'completed' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">
                {score === (config as any).maxScore ? '🏆' : score > (config as any).maxScore * 0.8 ? '🥇' : '🎉'}
              </div>
              <h3 className="text-2xl font-bold">
                {score === (config as any).maxScore ? 'Perfect Score!' : 'Game Complete!'}
              </h3>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">{score}</div>
                <div className="text-muted-foreground">out of {(config as any).maxScore} points</div>
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Time: {formatTime(playTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4" />
                  <span>+{Math.floor(((config as any).rewards?.baseCoins || 0) * (score / (config as any).maxScore))} coins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
