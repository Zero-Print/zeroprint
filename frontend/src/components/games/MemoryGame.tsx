/**
 * Memory Game Component
 * Renders memory card game from JSON configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { MemoryConfig, MemoryCard } from '@/types';

interface MemoryGameProps {
  config: MemoryConfig;
  onScoreUpdate: (score: number, clientData: any) => void;
  onComplete: () => void;
  onTimeLimit?: () => void;
  timeLimit?: number;
  isPaused: boolean;
}

export function MemoryGame({ config, onScoreUpdate, onComplete, onTimeLimit, timeLimit, isPaused }: MemoryGameProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);

  // Initialize cards
  useEffect(() => {
    const shuffledCards = [...config.cards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        position: index,
        isFlipped: false,
        isMatched: false,
        isSelected: false,
      }));
    setCards(shuffledCards);
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

  const handleCardClick = (cardId: string) => {
    if (showResults || selectedCards.length >= 2) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true, isSelected: true } : c
    ));

    setSelectedCards(prev => [...prev, cardId]);
  };

  // Check for matches
  useEffect(() => {
    if (selectedCards.length === 2) {
      const [card1Id, card2Id] = selectedCards;
      const card1 = cards.find(c => c.id === card1Id);
      const card2 = cards.find(c => c.id === card2Id);

      if (card1 && card2) {
        setMoves(prev => prev + 1);

        if (card1.content === card2.content) {
          // Match found
          setCards(prev => prev.map(c => 
            c.id === card1Id || c.id === card2Id 
              ? { ...c, isMatched: true, isSelected: false }
              : c
          ));
          setMatches(prev => prev + 1);
          setScore(prev => prev + 50); // 50 points per match
        } else {
          // No match, flip cards back after delay
          setTimeout(() => {
            setCards(prev => prev.map(c => 
              c.id === card1Id || c.id === card2Id 
                ? { ...c, isFlipped: false, isSelected: false }
                : c
            ));
          }, 1000);
        }

        setSelectedCards([]);
      }
    }
  }, [selectedCards, cards]);

  // Check if game is complete
  useEffect(() => {
    if (matches === config.cards.length / 2) {
      handleComplete();
    }
  }, [matches, config.cards.length]);

  const handleComplete = () => {
    const finalScore = score + (config.cards.length / 2 - moves) * 10; // Bonus for fewer moves
    setScore(finalScore);
    setShowResults(true);
    
    onScoreUpdate(finalScore, { 
      matches: matches,
      moves: moves,
      timeUsed: (timeLimit || 0) - timeLeft
    });
    onComplete();
  };

  const handleReset = () => {
    const shuffledCards = [...config.cards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        position: index,
        isFlipped: false,
        isMatched: false,
        isSelected: false,
      }));
    setCards(shuffledCards);
    setSelectedCards([]);
    setMatches(0);
    setMoves(0);
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
              {matches === config.cards.length / 2 ? '🏆' : '🎉'}
            </div>
            <h3 className="text-2xl font-bold">
              {matches === config.cards.length / 2 ? 'Perfect Memory!' : 'Game Complete!'}
            </h3>
            <div className="text-3xl font-bold text-green-600">{score}</div>
            <div className="text-muted-foreground">
              {matches} matches in {moves} moves
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
          <CardTitle>Memory Game</CardTitle>
          {timeLimit && (
            <Badge variant={timeLeft < 30 ? 'destructive' : 'secondary'}>
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <CardDescription>
          Match pairs of cards to test your memory
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Game Stats */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold">{matches}</div>
              <div className="text-muted-foreground">Matches</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{moves}</div>
              <div className="text-muted-foreground">Moves</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{score}</div>
              <div className="text-muted-foreground">Score</div>
            </div>
          </div>

          {/* Game Grid */}
          <div 
            className="grid gap-2 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
              width: 'fit-content'
            }}
          >
            {cards.map(card => (
              <div
                key={card.id}
                className={`w-16 h-16 border-2 rounded-lg cursor-pointer flex items-center justify-center text-2xl transition-all duration-300 ${
                  card.isFlipped || card.isMatched
                    ? 'bg-blue-100 border-blue-400'
                    : 'bg-gray-200 border-gray-400 hover:bg-gray-300'
                } ${
                  card.isSelected ? 'ring-2 ring-blue-500' : ''
                } ${
                  card.isMatched ? 'bg-green-100 border-green-400' : ''
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                {card.isFlipped || card.isMatched ? (
                  <div className="flex items-center justify-center">
                    {card.content}
                    {card.isMatched && (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-1" />
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">?</div>
                )}
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground text-center">
            <p>Click cards to flip them and find matching pairs</p>
            <p>Each match earns 50 points, bonus points for fewer moves</p>
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <Button onClick={handleComplete} variant="outline">
              Complete Game
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
