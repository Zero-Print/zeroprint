/**
 * Puzzle Game Component
 * Renders jigsaw puzzle game from JSON configuration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { PuzzleConfig, PuzzlePiece } from '@/types';

interface PuzzleGameProps {
  config: PuzzleConfig;
  onScoreUpdate: (score: number, clientData: any) => void;
  onComplete: () => void;
  timeLimit?: number;
  isPaused: boolean;
}

export function PuzzleGame({ config, onScoreUpdate, onComplete, timeLimit, isPaused }: PuzzleGameProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const puzzleAreaRef = useRef<HTMLDivElement>(null);

  // Initialize pieces
  useEffect(() => {
    const initialPieces = config.pieces.map(piece => ({
      ...piece,
      currentPosition: {
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
      },
      isPlaced: false,
      isDragging: false,
      isInCorrectPosition: false,
    }));
    setPieces(initialPieces);
  }, [config]);

  // Timer effect
  useEffect(() => {
    if (!timeLimit || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, isPaused]);

  const handleMouseDown = (e: React.MouseEvent, pieceId: string) => {
    if (showResults) return;
    
    e.preventDefault();
    setDraggedPiece(pieceId);
    
    setPieces(prev => prev.map(piece => 
      piece.id === pieceId ? { ...piece, isDragging: true } : piece
    ));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPiece || showResults) return;

    const rect = puzzleAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPieces(prev => prev.map(piece => 
      piece.id === draggedPiece 
        ? { ...piece, currentPosition: { x: Math.max(0, Math.min(x, rect.width - 50)), y: Math.max(0, Math.min(y, rect.height - 50)) } }
        : piece
    ));
  };

  const handleMouseUp = () => {
    if (!draggedPiece || showResults) return;

    const piece = pieces.find(p => p.id === draggedPiece);
    if (piece) {
      const isCorrect = checkPiecePosition(piece);
      
      setPieces(prev => prev.map(p => 
        p.id === draggedPiece 
          ? { 
              ...p, 
              isDragging: false,
              isPlaced: isCorrect,
              currentPosition: isCorrect ? p.correctPosition : p.currentPosition
            }
          : p
      ));

      if (isCorrect) {
        setScore(prev => prev + 100 / config.pieces.length);
      }
    }

    setDraggedPiece(null);
  };

  const checkPiecePosition = (piece: PuzzlePiece) => {
    const tolerance = 20;
    return (
      Math.abs(piece.currentPosition.x - piece.correctPosition.x) <= tolerance &&
      Math.abs(piece.currentPosition.y - piece.correctPosition.y) <= tolerance
    );
  };

  const calculateScore = () => {
    const placedPieces = pieces.filter(piece => piece.isPlaced).length;
    return Math.round((placedPieces / config.pieces.length) * 100);
  };

  const handleComplete = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    
    onScoreUpdate(finalScore, { 
      positions: pieces.reduce((acc, piece) => ({
        ...acc,
        [piece.id]: piece.currentPosition
      }), {})
    });
    onComplete();
  };

  const handleReset = () => {
    setPieces(prev => prev.map(piece => ({
      ...piece,
      currentPosition: {
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
      },
      isPlaced: false,
      isDragging: false,
    })));
    setScore(0);
    setShowResults(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const placedPieces = pieces.filter(piece => piece.isPlaced).length;
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">
              {placedPieces === config.pieces.length ? '🏆' : '🎉'}
            </div>
            <h3 className="text-2xl font-bold">
              {placedPieces === config.pieces.length ? 'Perfect Puzzle!' : 'Puzzle Complete!'}
            </h3>
            <div className="text-3xl font-bold text-green-600">{score}</div>
            <div className="text-muted-foreground">
              {placedPieces} of {config.pieces.length} pieces placed
            </div>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Jigsaw Puzzle</CardTitle>
          {timeLimit && (
            <Badge variant={timeLeft < 30 ? 'destructive' : 'secondary'}>
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <CardDescription>
          Arrange the pieces to complete the puzzle
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Puzzle Area */}
          <div
            ref={puzzleAreaRef}
            className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Target positions (faded) */}
            {pieces.map(piece => (
              <div
                key={`target-${piece.id}`}
                className="absolute w-12 h-12 border-2 border-dashed border-gray-400 bg-gray-200 rounded opacity-50"
                style={{
                  left: piece.correctPosition.x,
                  top: piece.correctPosition.y,
                }}
              />
            ))}

            {/* Puzzle pieces */}
            {pieces.map(piece => (
              <div
                key={piece.id}
                className={`absolute w-12 h-12 border-2 rounded cursor-move select-none flex items-center justify-center text-xs font-medium transition-all ${
                  piece.isDragging 
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105' 
                    : piece.isPlaced
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-400 bg-white hover:bg-gray-50'
                }`}
                style={{
                  left: piece.currentPosition.x,
                  top: piece.currentPosition.y,
                }}
                onMouseDown={(e) => handleMouseDown(e, piece.id)}
              >
                <div className="p-1">
                  {piece.shape}
                  {piece.isPlaced && (
                    <CheckCircle className="h-3 w-3 text-green-600 mx-auto mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="text-center">
            <div className="text-lg font-semibold">
              {pieces.filter(p => p.isPlaced).length} / {config.pieces.length} pieces placed
            </div>
            <div className="text-sm text-muted-foreground">
              Score: {Math.round(score)}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground">
            <p>• Drag pieces to their correct positions</p>
            <p>• Pieces will snap when placed correctly</p>
            <p>• Each correct placement earns points</p>
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <Button onClick={handleComplete} size="lg">
              Complete Puzzle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
