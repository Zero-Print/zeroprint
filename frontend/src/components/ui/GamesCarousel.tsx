'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { 
  Play, 
  Trophy, 
  Clock, 
  Users, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Target,
  Zap,
  Gift,
  TrendingUp,
  Award,
  Gamepad2
} from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  category: 'carbon' | 'mental-health' | 'animal-welfare' | 'recycling' | 'quiz' | 'simulation';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: number; // in minutes
  maxPlayers: number;
  currentPlayers: number;
  rating: number;
  totalRatings: number;
  rewards: {
    coins: number;
    xp: number;
    badges?: string[];
  };
  progress?: {
    completed: boolean;
    bestScore: number;
    lastPlayed: Date;
    timesPlayed: number;
  };
  thumbnail: string;
  tags: string[];
  featured: boolean;
  isNew: boolean;
  isPopular: boolean;
}

interface GamesCarouselProps {
  title?: string;
  showFeatured?: boolean;
  showProgress?: boolean;
  maxGames?: number;
  autoPlay?: boolean;
  className?: string;
}

export function GamesCarousel({ 
  title = "Featured Games",
  showFeatured = true,
  showProgress = true,
  maxGames = 8,
  autoPlay = false,
  className 
}: GamesCarouselProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const router = useRouter();

  // Mock games data
  const mockGames: Game[] = [
    {
      id: 'recycling-master',
      title: 'Recycling Master',
      description: 'Sort waste items into correct bins and learn about recycling',
      category: 'recycling',
      difficulty: 'easy',
      estimatedTime: 10,
      maxPlayers: 1,
      currentPlayers: 1,
      rating: 4.8,
      totalRatings: 1250,
      rewards: { coins: 100, xp: 50, badges: ['Recycling Pro'] },
      progress: { completed: true, bestScore: 950, lastPlayed: new Date(), timesPlayed: 15 },
      thumbnail: '♻️',
      tags: ['educational', 'environment', 'sorting'],
      featured: true,
      isNew: false,
      isPopular: true
    },
    {
      id: 'carbon-calculator',
      title: 'Carbon Footprint Challenge',
      description: 'Calculate and reduce your daily carbon emissions',
      category: 'carbon',
      difficulty: 'medium',
      estimatedTime: 15,
      maxPlayers: 1,
      currentPlayers: 1,
      rating: 4.6,
      totalRatings: 890,
      rewards: { coins: 150, xp: 75 },
      progress: { completed: false, bestScore: 0, lastPlayed: new Date(), timesPlayed: 3 },
      thumbnail: '🌱',
      tags: ['calculation', 'lifestyle', 'carbon'],
      featured: true,
      isNew: false,
      isPopular: false
    },
    {
      id: 'mindfulness-quest',
      title: 'Mindfulness Quest',
      description: 'Practice meditation and mindfulness techniques',
      category: 'mental-health',
      difficulty: 'easy',
      estimatedTime: 20,
      maxPlayers: 1,
      currentPlayers: 1,
      rating: 4.9,
      totalRatings: 2100,
      rewards: { coins: 80, xp: 60, badges: ['Zen Master'] },
      progress: { completed: true, bestScore: 100, lastPlayed: new Date(), timesPlayed: 25 },
      thumbnail: '🧘',
      tags: ['meditation', 'wellness', 'relaxation'],
      featured: true,
      isNew: false,
      isPopular: true
    },
    {
      id: 'animal-rescue',
      title: 'Animal Rescue Mission',
      description: 'Help rescue and care for animals in need',
      category: 'animal-welfare',
      difficulty: 'medium',
      estimatedTime: 25,
      maxPlayers: 4,
      currentPlayers: 2,
      rating: 4.7,
      totalRatings: 650,
      rewards: { coins: 200, xp: 100, badges: ['Animal Hero'] },
      progress: { completed: false, bestScore: 750, lastPlayed: new Date(), timesPlayed: 8 },
      thumbnail: '🐾',
      tags: ['rescue', 'care', 'compassion'],
      featured: true,
      isNew: true,
      isPopular: false
    },
    {
      id: 'eco-quiz',
      title: 'Eco Knowledge Quiz',
      description: 'Test your environmental knowledge with fun quizzes',
      category: 'quiz',
      difficulty: 'hard',
      estimatedTime: 12,
      maxPlayers: 10,
      currentPlayers: 7,
      rating: 4.5,
      totalRatings: 1800,
      rewards: { coins: 120, xp: 80 },
      progress: { completed: true, bestScore: 85, lastPlayed: new Date(), timesPlayed: 12 },
      thumbnail: '🧠',
      tags: ['knowledge', 'quiz', 'learning'],
      featured: false,
      isNew: false,
      isPopular: true
    },
    {
      id: 'city-planner',
      title: 'Sustainable City Planner',
      description: 'Design and build an eco-friendly smart city',
      category: 'simulation',
      difficulty: 'expert',
      estimatedTime: 45,
      maxPlayers: 1,
      currentPlayers: 1,
      rating: 4.8,
      totalRatings: 420,
      rewards: { coins: 500, xp: 250, badges: ['City Architect', 'Sustainability Expert'] },
      progress: { completed: false, bestScore: 0, lastPlayed: new Date(), timesPlayed: 1 },
      thumbnail: '🏙️',
      tags: ['strategy', 'planning', 'simulation'],
      featured: true,
      isNew: true,
      isPopular: false
    }
  ];

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (autoPlay && games.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.ceil(games.length / 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, games.length]);

  const loadGames = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredGames = showFeatured 
        ? mockGames.filter(game => game.featured)
        : mockGames;
      
      setGames(filteredGames.slice(0, maxGames));
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId: string) => {
    router.push(`/games/play/${gameId}`);
  };

  const handleViewGame = (gameId: string) => {
    router.push(`/games/${gameId}`);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % Math.ceil(games.length / 3));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + Math.ceil(games.length / 3)) % Math.ceil(games.length / 3));
  };

  const getDifficultyColor = (difficulty: Game['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: Game['category']) => {
    switch (category) {
      case 'carbon': return '🌱';
      case 'mental-health': return '🧘';
      case 'animal-welfare': return '🐾';
      case 'recycling': return '♻️';
      case 'quiz': return '🧠';
      case 'simulation': return '🏙️';
      default: return '🎮';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (loading) {
    return (
      <ZPCard className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </ZPCard>
    );
  }

  const visibleGames = games.slice(currentIndex * 3, (currentIndex + 1) * 3);

  return (
    <ZPCard className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Gamepad2 className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <ZPBadge variant="secondary">{games.length}</ZPBadge>
        </div>
        
        <div className="flex items-center space-x-2">
          <ZPButton
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={games.length <= 3}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </ZPButton>
          
          <ZPButton
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={games.length <= 3}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </ZPButton>
          
          <ZPButton
            variant="primary"
            size="sm"
            onClick={() => router.push('/games')}
            className="ml-2"
          >
            View All
          </ZPButton>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleGames.map((game) => (
          <div
            key={game.id}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredGame(game.id)}
            onMouseLeave={() => setHoveredGame(null)}
            onClick={() => handleViewGame(game.id)}
          >
            <ZPCard className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {/* Game Thumbnail */}
              <div className="relative h-32 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                <div className="text-4xl">{game.thumbnail}</div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {game.isNew && (
                    <ZPBadge variant="success" className="text-xs bg-green-500 text-white">
                      NEW
                    </ZPBadge>
                  )}
                  {game.isPopular && (
                    <ZPBadge variant="warning" className="text-xs bg-orange-500 text-white">
                      🔥 HOT
                    </ZPBadge>
                  )}
                </div>

                {/* Play Button Overlay */}
                {hoveredGame === game.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <ZPButton
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayGame(game.id);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Play Now</span>
                    </ZPButton>
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">{game.title}</h4>
                  <div className="flex items-center space-x-1 ml-2">
                    {renderStars(game.rating)}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{game.description}</p>

                {/* Game Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{game.estimatedTime}m</span>
                    </span>
                    
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{game.currentPlayers}/{game.maxPlayers}</span>
                    </span>
                  </div>
                  
                  <ZPBadge variant="secondary" className={`text-xs ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </ZPBadge>
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-yellow-600">
                      <Gift className="w-3 h-3" />
                      <span>{game.rewards.coins} HC</span>
                    </span>
                    
                    <span className="flex items-center space-x-1 text-blue-600">
                      <Zap className="w-3 h-3" />
                      <span>{game.rewards.xp} XP</span>
                    </span>
                  </div>
                  
                  <span className="text-gray-500">{getCategoryIcon(game.category)}</span>
                </div>

                {/* Progress */}
                {showProgress && game.progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-600">
                        {game.progress.completed ? 'Completed' : `Best: ${game.progress.bestScore}`}
                      </span>
                    </div>
                    
                    {game.progress.completed ? (
                      <div className="flex items-center space-x-2 text-xs text-green-600">
                        <Trophy className="w-3 h-3" />
                        <span>Played {game.progress.timesPlayed} times</span>
                      </div>
                    ) : (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((game.progress.bestScore / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <ZPButton
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayGame(game.id);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Play</span>
                  </ZPButton>
                  
                  <ZPButton
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewGame(game.id);
                    }}
                    className="px-3"
                  >
                    <TrendingUp className="w-3 h-3" />
                  </ZPButton>
                </div>
              </div>
            </ZPCard>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {games.length > 3 && (
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(Math.ceil(games.length / 3))].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </ZPCard>
  );
}