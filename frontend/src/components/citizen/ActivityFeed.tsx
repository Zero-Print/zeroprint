'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { Activity, Leaf, Brain, Heart, Gamepad, Clock, Filter } from 'lucide-react';

type ActivityType = 'carbon' | 'mental_health' | 'animal_welfare' | 'game' | 'all';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  points: number;
  carbonSaved?: number;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onFilterChange?: (type: ActivityType) => void;
  activeFilter?: ActivityType;
}

export function ActivityFeed({
  activities = [],
  onFilterChange,
  activeFilter = 'all',
}: ActivityFeedProps) {
  // Get activity icon based on type
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'carbon':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'mental_health':
        return <Brain className="h-4 w-4 text-purple-600" />;
      case 'animal_welfare':
        return <Heart className="h-4 w-4 text-amber-600" />;
      case 'game':
        return <Gamepad className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get background color based on activity type
  const getActivityBgColor = (type: ActivityType) => {
    switch (type) {
      case 'carbon':
        return 'bg-green-100';
      case 'mental_health':
        return 'bg-purple-100';
      case 'animal_welfare':
        return 'bg-amber-100';
      case 'game':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <ZPCard className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Recent Activities</h3>
          </div>
          
          {onFilterChange && (
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <div className="flex space-x-1 text-xs">
                {(['all', 'carbon', 'mental_health', 'animal_welfare', 'game'] as ActivityType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => onFilterChange(type)}
                    className={`px-2 py-1 rounded-md ${
                      activeFilter === type
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All' : 
                     type === 'carbon' ? 'Carbon' : 
                     type === 'mental_health' ? 'Mental' : 
                     type === 'animal_welfare' ? 'Animal' : 'Games'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getActivityBgColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <span className="text-xs text-green-600 font-medium">+{activity.points} points</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  {activity.carbonSaved && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      {activity.carbonSaved.toFixed(2)} kg CO₂ saved
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p>No recent activities to display</p>
            <p className="text-sm mt-1">Complete eco-actions to see them here</p>
          </div>
        )}
      </div>
    </ZPCard>
  );
}