/**
 * Drag and Drop Game Component
 * Renders drag-drop game from JSON configuration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { DragDropConfig } from '@/types';

interface DragDropGameProps {
  config: DragDropConfig;
  onScoreUpdate: (score: number, clientData: any) => void;
  onComplete: () => void;
  timeLimit?: number;
  isPaused: boolean;
}

interface DragItem {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  isDragging: boolean;
  isCorrect: boolean;
}

export function DragDropGame({ config, onScoreUpdate, onComplete, timeLimit, isPaused }: DragDropGameProps) {
  const [items, setItems] = useState<DragItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Initialize items
  useEffect(() => {
    const initialItems = config.items.map(item => ({
      ...item,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      isDragging: false,
      isCorrect: false,
    }));
    setItems(initialItems);
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

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    if (showResults) return;
    
    e.preventDefault();
    setDraggedItem(itemId);
    
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isDragging: true } : item
    ));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || showResults) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setItems(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, x: Math.max(0, Math.min(x, rect.width - 50)), y: Math.max(0, Math.min(y, rect.height - 50)) }
        : item
    ));
  };

  const handleMouseUp = () => {
    if (!draggedItem || showResults) return;

    setItems(prev => prev.map(item => 
      item.id === draggedItem ? { ...item, isDragging: false } : item
    ));
    setDraggedItem(null);
  };

  const checkItemPosition = (item: DragItem) => {
    const category = config.categories.find(cat => cat.id === item.category);
    if (!category) return false;

    const tolerance = 30;
    return (
      item.x >= category.position.x - tolerance &&
      item.x <= category.position.x + category.position.width + tolerance &&
      item.y >= category.position.y - tolerance &&
      item.y <= category.position.y + category.position.height + tolerance
    );
  };

  const calculateScore = () => {
    let totalScore = 0;
    items.forEach(item => {
      if (checkItemPosition(item)) {
        totalScore += 25; // 25 points per correct placement
      }
    });
    return totalScore;
  };

  const handleComplete = () => {
    const newScore = calculateScore();
    setScore(newScore);
    setShowResults(true);
    
    // Mark correct items
    setItems(prev => prev.map(item => ({
      ...item,
      isCorrect: checkItemPosition(item)
    })));

    onScoreUpdate(newScore, { positions: items.reduce((acc, item) => ({
      ...acc,
      [item.id]: { x: item.x, y: item.y }
    }), {}) });
    onComplete();
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({
      ...item,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      isCorrect: false,
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
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">
              {score === config.items.length * 25 ? '🏆' : '🎉'}
            </div>
            <h3 className="text-2xl font-bold">
              {score === config.items.length * 25 ? 'Perfect Score!' : 'Game Complete!'}
            </h3>
            <div className="text-3xl font-bold text-green-600">{score}</div>
            <div className="text-muted-foreground">
              out of {config.items.length * 25} points
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
          <CardTitle>Drag and Drop Game</CardTitle>
          {timeLimit && (
            <Badge variant={timeLeft < 30 ? 'destructive' : 'secondary'}>
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <CardDescription>
          Drag the items to their correct categories
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Categories */}
            {config.categories.map(category => (
              <div
                key={category.id}
                className="absolute border-2 border-blue-300 bg-blue-100 rounded-lg p-2 text-center"
                style={{
                  left: category.position.x,
                  top: category.position.y,
                  width: category.position.width,
                  height: category.position.height,
                }}
              >
                <div className="font-semibold text-blue-800">{category.label}</div>
              </div>
            ))}

            {/* Draggable Items */}
            {items.map(item => (
              <div
                key={item.id}
                className={`absolute w-20 h-20 border-2 rounded-lg cursor-move select-none flex items-center justify-center text-center text-xs font-medium transition-all ${
                  item.isDragging 
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105' 
                    : item.isCorrect
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-400 bg-white hover:bg-gray-50'
                }`}
                style={{
                  left: item.x,
                  top: item.y,
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
              >
                <div className="p-2">
                  {item.label}
                  {item.isCorrect && (
                    <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground">
            <p>• Drag items to their correct categories</p>
            <p>• Items will snap to the nearest category when dropped</p>
            <p>• Each correct placement earns 25 points</p>
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <Button onClick={handleComplete} size="lg">
              Complete Game
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
