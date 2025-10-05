/**
 * Games Page
 * Displays available games and game engine
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gamepad2, 
  Trophy, 
  Clock, 
  Star, 
  Play, 
  Loader2,
  AlertTriangle,
  Target,
  Brain,
  Puzzle,
  Zap
} from 'lucide-react';
import { GameEngine } from '@/components/games/GameEngine';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/apiClient';
import { Game } from '@/types';

export default function GamesPage() {
  const { isAuthenticated } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameConfig, setGameConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameLoading, setGameLoading] = useState(false);

  // Load games
  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.games.getGames();
      if (response.success && response.data && Array.isArray(response.data)) {
        setGames(response.data);
      } else {
        setError(response.error || 'Failed to load games');
        setGames([]); // Set empty array as fallback
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load games');
      setGames([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  // Load game configuration
  const loadGameConfig = async (gameId: string) => {
    setGameLoading(true);
    setError(null);
    try {
      const response = await api.games.getGame(gameId);
      if (response.success && response.data) {
        setGameConfig(response.data.config || null);
        setSelectedGame(response.data);
      } else {
        setError(response.error || 'Failed to load game configuration');
        setGameConfig(null);
        setSelectedGame(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load game configuration');
      setGameConfig(null);
      setSelectedGame(null);
    } finally {
      setGameLoading(false);
    }
  };

  // Handle game completion
  const handleGameComplete = async (score: number, clientData: any, playTime: number) => {
    if (!selectedGame) return;

    try {
      const response = await api.games.completeGame(selectedGame.id, {
        score,
        clientData,
        playTime,
      });

      if (response.success) {
        // Refresh wallet to show new coins
        await refreshWallet();
        
        // Show success message
        setError(null);
      } else {
        setError(response.error || 'Failed to complete game');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete game');
    }
  };

  // Handle game error
  const handleGameError = (error: string) => {
    setError(error);
  };

  // Get game type icon
  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <Brain className="h-6 w-6" />;
      case 'drag-drop': return <Target className="h-6 w-6" />;
      case 'simulation': return <Zap className="h-6 w-6" />;
      case 'memory': return <Brain className="h-6 w-6" />;
      case 'puzzle': return <Puzzle className="h-6 w-6" />;
      default: return <Gamepad2 className="h-6 w-6" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <span className="text-gray-700 text-lg font-medium">Loading games...</span>
        </div>
      </div>
    );
  }

  if (selectedGame && gameConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <button 
              onClick={() => {
                setSelectedGame(null);
                setGameConfig(null);
                setError(null);
              }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Games</span>
            </button>
          </div>
          
          {error && (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-4 mb-6 shadow-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3" />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <GameEngine
              gameId={selectedGame.id}
              config={gameConfig}
              onComplete={handleGameComplete}
              onError={handleGameError}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full shadow-lg">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                Games & Challenges
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-2">
                Play fun games, earn HealCoins, and learn about sustainability
              </p>
            </div>
          </div>
        </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{games.length}</div>
              <div className="text-blue-100 text-sm">Available Games</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{wallet?.healCoins || 0}</div>
              <div className="text-yellow-100 text-sm">Your HealCoins</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">1,234</div>
              <div className="text-green-100 text-sm">Games Played Today</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">5.2m</div>
              <div className="text-purple-100 text-sm">Avg Play Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Error Alert */}
      {error && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Enhanced Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game, index) => {
          const cardColors = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500', 
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-indigo-500 to-purple-500',
            'from-teal-500 to-blue-500'
          ];
          const cardColor = cardColors[index % cardColors.length];
          
          return (
            <div key={game.id} className={`bg-gradient-to-br ${cardColor} text-white rounded-2xl shadow-xl relative transform hover:scale-105 transition-all duration-300 overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {getGameTypeIcon(game.type)}
                    </div>
                    <h3 className="text-lg font-semibold">{game.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(game.difficulty)} shadow-lg`}>
                    {game.difficulty}
                  </span>
                </div>
                <p className="text-white/90 mb-6 text-sm leading-relaxed">{game.description}</p>
                
                <div className="space-y-4">
                  {/* Game Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">{game.maxScore}</div>
                      <div className="text-white/80 text-xs">Max Score</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">{game.rewards?.baseCoins || 10}</div>
                      <div className="text-white/80 text-xs">Base Coins</div>
                    </div>
                  </div>

                  {/* Game Features */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-white/90">Features:</div>
                    <div className="flex flex-wrap gap-2">
                      {game.type === 'quiz' && <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">Questions</span>}
                      {game.type === 'drag-drop' && <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">Interactive</span>}
                      {game.type === 'simulation' && <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">Realistic</span>}
                      {game.type === 'memory' && <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">Memory Test</span>}
                      {game.type === 'puzzle' && <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">Problem Solving</span>}
                      {game.timeLimit && <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">Timed</span>}
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => loadGameConfig(game.id)}
                    disabled={gameLoading}
                    className="w-full bg-white text-gray-800 py-3 px-4 rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {gameLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Empty State */}
      {games.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-r from-gray-400 to-gray-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Gamepad2 className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">No games available</h3>
          <p className="text-gray-600 text-lg">
            Check back later for new games and challenges
          </p>
        </div>
      )}

      {/* Enhanced Call to Action */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-10 text-center relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Start Playing Today!</h2>
              <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
                Join thousands of players earning HealCoins through fun games and challenges. 
                Make a difference while having fun!
              </p>
              <button className="bg-white text-purple-600 py-3 px-8 rounded-xl font-semibold hover:bg-white/90 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}