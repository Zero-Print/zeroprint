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
      if (response.success && response.data) {
        setGames(response.data);
      } else {
        setError(response.error || 'Failed to load games');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load games');
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
        setGameConfig(response.data.config);
        setSelectedGame(response.data);
      } else {
        setError(response.error || 'Failed to load game configuration');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load game configuration');
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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading games...</span>
      </div>
    );
  }

  if (selectedGame && gameConfig) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button 
            onClick={() => {
              setSelectedGame(null);
              setGameConfig(null);
              setError(null);
            }}
            variant="outline"
          >
            ← Back to Games
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <GameEngine
          gameId={selectedGame.id}
          config={gameConfig}
          onComplete={handleGameComplete}
          onError={handleGameError}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Games & Challenges</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Play fun games, earn HealCoins, and learn about sustainability
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{games.length}</div>
                <div className="text-sm text-muted-foreground">Available Games</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{wallet?.healCoins || 0}</div>
                <div className="text-sm text-muted-foreground">Your HealCoins</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-sm text-muted-foreground">Games Played Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">5.2m</div>
                <div className="text-sm text-muted-foreground">Avg Play Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getGameTypeIcon(game.type)}
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(game.difficulty)}>
                  {game.difficulty}
                </Badge>
              </div>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">{game.maxScore}</div>
                  <div className="text-muted-foreground">Max Score</div>
                </div>
                <div>
                  <div className="font-semibold">{game.rewards?.baseCoins || 10}</div>
                  <div className="text-muted-foreground">Base Coins</div>
                </div>
              </div>

              {/* Game Features */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Features:</div>
                <div className="flex flex-wrap gap-1">
                  {game.type === 'quiz' && <Badge variant="outline">Questions</Badge>}
                  {game.type === 'drag-drop' && <Badge variant="outline">Interactive</Badge>}
                  {game.type === 'simulation' && <Badge variant="outline">Realistic</Badge>}
                  {game.type === 'memory' && <Badge variant="outline">Memory Test</Badge>}
                  {game.type === 'puzzle' && <Badge variant="outline">Problem Solving</Badge>}
                  {game.timeLimit && <Badge variant="outline">Timed</Badge>}
                </div>
              </div>

              {/* Play Button */}
              <Button
                onClick={() => loadGameConfig(game.id)}
                disabled={gameLoading}
                className="w-full"
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
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {games.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No games available</h3>
          <p className="text-muted-foreground">
            Check back later for new games and challenges
          </p>
        </div>
      )}

      {/* Call to Action */}
      {!isAuthenticated && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Start Playing Today!</h2>
            <p className="text-blue-100 mb-6">
              Join thousands of players earning HealCoins through fun games and challenges.
            </p>
            <Button size="lg" variant="secondary">
              Sign Up Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}