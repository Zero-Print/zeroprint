'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '@/lib/api';

export interface Game {
  id: string;
  name: string;
  description: string;
  points: number;
  completed: boolean;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: number; // in minutes
}

export interface GameProgress {
  gameId: string;
  userId: string;
  progress: number; // 0-100
  score: number;
  startedAt: string;
  completedAt?: string;
}

export function useGame() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [userProgress, setUserProgress] = useState<GameProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchGames = async () => {
      try {
        setLoading(true);
        // Mock data until backend is implemented
        const mockGames: Game[] = [
          {
            id: 'game1',
            name: 'Carbon Footprint Quiz',
            description: 'Test your knowledge about carbon footprints',
            points: 100,
            completed: false,
            category: 'education',
            difficulty: 'easy',
            timeEstimate: 5
          },
          {
            id: 'game2',
            name: 'Recycling Challenge',
            description: 'Sort waste items into correct recycling categories',
            points: 150,
            completed: false,
            category: 'challenge',
            difficulty: 'medium',
            timeEstimate: 10
          },
          {
            id: 'game3',
            name: 'Sustainable City Builder',
            description: 'Build a sustainable city while managing resources',
            points: 300,
            completed: false,
            category: 'simulation',
            difficulty: 'hard',
            timeEstimate: 20
          }
        ];
        
        const mockProgress: GameProgress[] = [
          {
            gameId: 'game1',
            userId: user.id,
            progress: 75,
            score: 75,
            startedAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        
        setGames(mockGames);
        setUserProgress(mockProgress);
      } catch (err) {
        setError('Failed to load games');
        console.error('Error loading games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [user]);

  const startGame = async (gameId: string) => {
    if (!user) return null;
    
    try {
      // Mock implementation
      const newProgress: GameProgress = {
        gameId,
        userId: user.id,
        progress: 0,
        score: 0,
        startedAt: new Date().toISOString()
      };
      
      setUserProgress([...userProgress, newProgress]);
      return newProgress;
    } catch (err) {
      setError('Failed to start game');
      console.error('Error starting game:', err);
      return null;
    }
  };

  const updateProgress = async (gameId: string, progress: number, score: number) => {
    if (!user) return false;
    
    try {
      const updatedProgress = userProgress.map(p => 
        p.gameId === gameId && p.userId === user.id
          ? { 
              ...p, 
              progress, 
              score,
              completedAt: progress === 100 ? new Date().toISOString() : p.completedAt 
            }
          : p
      );
      
      setUserProgress(updatedProgress);
      return true;
    } catch (err) {
      setError('Failed to update game progress');
      console.error('Error updating game progress:', err);
      return false;
    }
  };

  const completeGame = async (gameId: string, finalScore: number) => {
    if (!user) return false;
    
    try {
      const updatedProgress = userProgress.map(p => 
        p.gameId === gameId && p.userId === user.id
          ? { 
              ...p, 
              progress: 100, 
              score: finalScore,
              completedAt: new Date().toISOString() 
            }
          : p
      );
      
      setUserProgress(updatedProgress);
      
      // Update games list to mark as completed
      const updatedGames = games.map(g => 
        g.id === gameId ? { ...g, completed: true } : g
      );
      
      setGames(updatedGames);
      return true;
    } catch (err) {
      setError('Failed to complete game');
      console.error('Error completing game:', err);
      return false;
    }
  };

  return {
    games,
    userProgress,
    loading,
    error,
    startGame,
    updateProgress,
    completeGame,
    getUserGameProgress: (gameId: string) => 
      userProgress.find(p => p.gameId === gameId && p.userId === user?.userId)
  };
}

export default useGame;