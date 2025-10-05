/**
 * useGames Hook
 * Manages game state and provides game operations
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/apiClient';
import { ApiError } from '@/lib/apiClient';
import { Game, GameScore } from '@/types';

export interface GameState {
  games: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
}

export interface CompleteGameData {
  score: number;
}

export function useGames() {
  const [state, setState] = useState<GameState>({
    games: [],
    currentGame: null,
    loading: false,
    error: null,
  });

  // Load all games
  const loadGames = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.games.getGames();
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load games');
      }

      setState(prev => ({
        ...prev,
        games: response.data || [],
        loading: false,
        error: null,
      }));

      return { success: true, games: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load games';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Load specific game
  const loadGame = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.games.getGame(id);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to load game');
      }

      setState(prev => ({
        ...prev,
        currentGame: response.data || null,
        loading: false,
        error: null,
      }));

      return { success: true, game: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load game';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Complete game
  const completeGame = useCallback(async (id: string, data: CompleteGameData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.games.completeGame(id, data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to complete game');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, score: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to complete game';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get game by ID from loaded games
  const getGameById = useCallback((id: string) => {
    return state.games.find(game => game.id === id) || null;
  }, [state.games]);

  // Get games by category
  const getGamesByCategory = useCallback((category: string) => {
    return state.games.filter(game => game.category === category);
  }, [state.games]);

  // Get games by difficulty
  const getGamesByDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    return state.games.filter(game => game.difficulty === difficulty);
  }, [state.games]);

  // Get active games only
  const getActiveGames = useCallback(() => {
    return state.games.filter(game => game.isActive);
  }, [state.games]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return {
    // State
    games: state.games,
    currentGame: state.currentGame,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadGames,
    loadGame,
    completeGame,
    clearError,
    
    // Utilities
    getGameById,
    getGamesByCategory,
    getGamesByDifficulty,
    getActiveGames,
  };
}
