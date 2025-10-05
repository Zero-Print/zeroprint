'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Award, 
  Leaf, 
  Users, 
  Clock, 
  TrendingUp,
  Target,
  Gift,
  ChevronDown,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'achievement' | 'tracker_update' | 'challenge_complete' | 'social' | 'milestone' | 'reward';
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  content: {
    title: string;
    description: string;
    metadata?: Record<string, any>;
  };
  timestamp: Date;
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  category: 'carbon' | 'mental-health' | 'animal-welfare' | 'community' | 'general';
  visibility: 'public' | 'friends' | 'private';
}

interface ActivityFeedProps {
  userId?: string;
  feedType?: 'personal' | 'community' | 'friends';
  maxItems?: number;
  showFilters?: boolean;
  showInteractions?: boolean;
  className?: string;
}

export function ActivityFeed({ 
  userId, 
  feedType = 'community', 
  maxItems = 10,
  showFilters = true,
  showInteractions = true,
  className 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Real-time updates with polling
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // In a real implementation, this would call an API
        const api = {
          getRecentActivities: async () => {
            // Simulate API call to get latest activities
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockActivities.sort(() => Math.random() - 0.5).slice(0, 5);
          }
        };
        
        const newActivities = await api.getRecentActivities();
        setActivities(prev => {
          // Merge new activities with existing ones, avoiding duplicates
          const existingIds = new Set(prev.map(a => a.id));
          const uniqueNewActivities = newActivities.filter(a => !existingIds.has(a.id));
          
          return [...uniqueNewActivities, ...prev].slice(0, maxItems);
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    // Initial load
    fetchRecentActivities();
    
    // Set up polling interval (30 seconds)
    const interval = setInterval(fetchRecentActivities, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [maxItems, feedType]);

  // Mock data for demonstration
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'achievement',
      user: { id: 'user1', name: 'Eco Warrior', avatar: '🌱', level: 15 },
      content: {
        title: 'Carbon Footprint Champion!',
        description: 'Reduced carbon footprint by 50kg this month',
        metadata: { co2Saved: 50, streak: 30 }
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      interactions: { likes: 24, comments: 5, shares: 3, isLiked: false, isBookmarked: false },
      category: 'carbon',
      visibility: 'public'
    },
    {
      id: '2',
      type: 'challenge_complete',
      user: { id: 'user2', name: 'Green Thumb', avatar: '🌿', level: 12 },
      content: {
        title: 'Zero Waste Week Complete!',
        description: 'Successfully completed the zero waste challenge',
        metadata: { challenge: 'zero-waste-week', reward: 500 }
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      interactions: { likes: 18, comments: 8, shares: 2, isLiked: true, isBookmarked: false },
      category: 'community',
      visibility: 'public'
    },
    {
      id: '3',
      type: 'tracker_update',
      user: { id: 'user3', name: 'Mindful Maya', avatar: '🧘', level: 8 },
      content: {
        title: 'Mental Health Check-in',
        description: 'Feeling great after morning meditation session',
        metadata: { mood: 'excellent', activity: 'meditation', duration: 20 }
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      interactions: { likes: 12, comments: 3, shares: 1, isLiked: false, isBookmarked: true },
      category: 'mental-health',
      visibility: 'public'
    },
    {
      id: '4',
      type: 'milestone',
      user: { id: 'user4', name: 'Animal Friend', avatar: '🐾', level: 20 },
      content: {
        title: '1000 Animals Helped!',
        description: 'Reached milestone of helping 1000 animals through various welfare activities',
        metadata: { milestone: 1000, category: 'animal-welfare' }
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      interactions: { likes: 45, comments: 12, shares: 8, isLiked: true, isBookmarked: true },
      category: 'animal-welfare',
      visibility: 'public'
    },
    {
      id: '5',
      type: 'social',
      user: { id: 'user5', name: 'Community Leader', avatar: '👥', level: 25 },
      content: {
        title: 'New Community Garden Project',
        description: 'Starting a new community garden in Ward 12. Join us this weekend!',
        metadata: { event: 'community-garden', location: 'Ward 12', date: '2024-01-20' }
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      interactions: { likes: 32, comments: 15, shares: 6, isLiked: false, isBookmarked: false },
      category: 'community',
      visibility: 'public'
    }
  ];

  useEffect(() => {
    loadActivities();
}, [feedType, filter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredActivities = mockActivities;
      if (filter !== 'all') {
        filteredActivities = mockActivities.filter(activity => activity.category === filter);
      }
      
      setActivities(filteredActivities.slice(0, maxItems));
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleLike = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? {
            ...activity,
            interactions: {
              ...activity.interactions,
              likes: activity.interactions.isLiked 
                ? activity.interactions.likes - 1 
                : activity.interactions.likes + 1,
              isLiked: !activity.interactions.isLiked
            }
          }
        : activity
    ));
  };

  const handleBookmark = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? {
            ...activity,
            interactions: {
              ...activity.interactions,
              isBookmarked: !activity.interactions.isBookmarked
            }
          }
        : activity
    ));
  };

  const toggleExpanded = (activityId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'achievement': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'tracker_update': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'challenge_complete': return <Target className="w-5 h-5 text-green-500" />;
      case 'social': return <Users className="w-5 h-5 text-purple-500" />;
      case 'milestone': return <Gift className="w-5 h-5 text-orange-500" />;
      case 'reward': return <Gift className="w-5 h-5 text-pink-500" />;
      default: return <Leaf className="w-5 h-5 text-green-500" />;
    }
  };

  const getCategoryColor = (category: ActivityItem['category']) => {
    switch (category) {
      case 'carbon': return 'bg-green-100 text-green-800';
      case 'mental-health': return 'bg-blue-100 text-blue-800';
      case 'animal-welfare': return 'bg-orange-100 text-orange-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <ZPCard className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </ZPCard>
    );
  }

  return (
    <ZPCard className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
          <ZPBadge variant="secondary">{activities.length}</ZPBadge>
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Updated {formatTimeAgo(lastUpdated)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showFilters && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Activities</option>
              <option value="carbon">Carbon</option>
              <option value="mental-health">Mental Health</option>
              <option value="animal-welfare">Animal Welfare</option>
              <option value="community">Community</option>
            </select>
          )}
          
          <ZPButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </ZPButton>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            {/* Activity Header */}
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {activity.user.avatar || activity.user.name.charAt(0)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{activity.user.name}</span>
                  <ZPBadge variant="secondary" className="text-xs">
                    Level {activity.user.level}
                  </ZPBadge>
                  <ZPBadge variant="secondary" className={`text-xs ${getCategoryColor(activity.category)}`}>
                    {activity.category.replace('-', ' ')}
                  </ZPBadge>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {getActivityIcon(activity.type)}
                  <span>{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Activity Content */}
            <div className="ml-13">
              <h4 className="font-medium text-gray-900 mb-1">{activity.content.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{activity.content.description}</p>

              {/* Metadata */}
              {activity.content.metadata && (
                <div className="mb-3">
                  {activity.type === 'achievement' && activity.content.metadata.co2Saved && (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1 text-green-600">
                        <Leaf className="w-4 h-4" />
                        <span>{activity.content.metadata.co2Saved}kg CO₂ saved</span>
                      </span>
                      {activity.content.metadata.streak && (
                        <span className="flex items-center space-x-1 text-orange-600">
                          <Target className="w-4 h-4" />
                          <span>{activity.content.metadata.streak} day streak</span>
                        </span>
                      )}
                    </div>
                  )}
                  
                  {activity.type === 'challenge_complete' && activity.content.metadata.reward && (
                    <div className="flex items-center space-x-1 text-sm text-yellow-600">
                      <Gift className="w-4 h-4" />
                      <span>Earned {activity.content.metadata.reward} HealCoins</span>
                    </div>
                  )}
                </div>
              )}

              {/* Interactions */}
              {showInteractions && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(activity.id)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        activity.interactions.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${activity.interactions.isLiked ? 'fill-current' : ''}`} />
                      <span>{activity.interactions.likes}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{activity.interactions.comments}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>{activity.interactions.shares}</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleBookmark(activity.id)}
                    className={`text-sm transition-colors ${
                      activity.interactions.isBookmarked 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    ⭐
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {activities.length >= maxItems && (
        <div className="mt-6 text-center">
          <ZPButton variant="outline" onClick={() => {}}>
            Load More Activities
          </ZPButton>
        </div>
      )}
    </ZPCard>
  );
}