'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, Medal, Award, TrendingUp, Users, Eye, 
  RefreshCw, ChevronRight, Star, Zap, Clock
} from 'lucide-react';
import { ZPCard } from '../ui/ZPCard';
import { ZPButton } from '../ui/ZPButton';
import { ZPBadge } from '../ui/ZPBadge';
import { EntityType, LeaderboardScope, LeaderboardCategory, TimeFrame, LeaderboardEntry, MetricCategory } from '@/lib/leaderboards/LeaderboardEngine';
import { getRankingService, RankingRequest } from '@/lib/leaderboards/RankingService';
import { useRealtimeLeaderboard } from '@/hooks/useRealtimeLeaderboard';
import { getPrecomputeService } from '@/lib/leaderboards/PrecomputeService';

// ============================================================================
// INTERFACES
// ============================================================================

interface LeaderboardWidgetProps {
  title?: string;
  scope?: LeaderboardScope;
  entityTypes?: EntityType[];
  category?: MetricCategory;
  timeFrame?: TimeFrame;
  wardId?: string;
  districtId?: string;
  maxEntries?: number;
  showViewAll?: boolean;
  showRefresh?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  onViewAll?: () => void;
  onEntryClick?: (entry: LeaderboardEntry) => void;
  className?: string;
  compact?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  title,
  scope = 'global',
  entityTypes = ['citizen', 'school', 'msme'],
  category = 'overall',
  timeFrame = 'monthly',
  wardId,
  districtId,
  maxEntries = 5,
  showViewAll = true,
  showRefresh = true,
  autoRefresh = false,
  refreshInterval = 60,
  onViewAll,
  onEntryClick,
  className = '',
  compact = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Real-time leaderboard data
  const {
    data: leaderboardData,
    loading,
    error,
    lastUpdated,
    isLive,
    refresh,
    hasOptimisticUpdates
  } = useRealtimeLeaderboard(
    {
      scope,
      entityTypes,
      category,
      timeFrame,
      maxEntries
    },
    {
      autoRefresh: true,
      refreshInterval: 45000, // 45 seconds for widget
      enableOptimisticUpdates: false // Disable for widget to keep it simple
    }
  );

  // Extract entries from leaderboard data
  const data = leaderboardData?.entries || [];
  
  // Additional state
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Avoid direct engine usage here; rely on services/hooks

  // ============================================================================
  // DATA FETCHING
  
  // Use precomputed data for better performance
  useEffect(() => {
    const precomputeService = getPrecomputeService();
    
    // Schedule precomputation for this specific leaderboard configuration
    precomputeService.scheduleJob(
      scope,
      entityTypes,
      category,
      timeFrame,
      'high', // High priority for visible widgets
      {
        maxEntries: maxEntries,
        ward: wardId,
        region: districtId
      }
    );
    
    // This ensures the data is precomputed and cached for faster retrieval
    console.log('Precompute job scheduled for leaderboard widget');
  }, [scope, entityTypes, category, timeFrame, maxEntries, wardId, districtId]);
  // ============================================================================

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    refresh();
    setLastRefresh(new Date());
  }, [refresh]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    refresh();
  }, [scope, entityTypes, category, timeFrame, wardId, districtId, maxEntries, refresh]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getRankIcon = (rank: number) => {
    if (compact) {
      return (
        <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600 bg-gray-100 rounded-full">
          {rank}
        </div>
      );
    }

    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-600 bg-gray-100 rounded-full">
            {rank}
          </div>
        );
    }
  };

  const getEntityIcon = (entityType: EntityType) => {
    const iconClass = compact ? "w-3 h-3" : "w-4 h-4";
    switch (entityType) {
      case 'citizen': return <Users className={iconClass} />;
      case 'school': return <Star className={iconClass} />;
      case 'msme': return <Zap className={iconClass} />;
      default: return <Users className={iconClass} />;
    }
  };

  const getMetricLabel = (category: MetricCategory) => {
    const labels = {
      overall: 'Overall Score',
      environmental: 'Environmental',
      social: 'Social Impact',
      governance: 'Governance',
      carbon: 'Carbon Saved',
      wellness: 'Wellness Score',
      animal_welfare: 'Animal Welfare'
    };
    return labels[category] || 'Score';
  };

  const formatMetricValue = (entry: LeaderboardEntry, category: MetricCategory) => {
    const metrics = entry.metrics;
    
    switch (category) {
      case 'carbon':
        return `${metrics.carbonSaved.toFixed(1)} kg`;
      case 'wellness':
        return `${metrics.wellnessScore.toFixed(0)}/100`;
      case 'animal_welfare':
        return `${metrics.animalSightings || 0}`;
      default:
        return metrics.overallScore.toFixed(0);
    }
  };

  const getDisplayTitle = () => {
    if (title) return title;
    
    const scopeLabel = scope.charAt(0).toUpperCase() + scope.slice(1);
    const categoryLabel = getMetricLabel(category);
    return `${scopeLabel} ${categoryLabel}`;
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
            {getDisplayTitle()}
          </h3>
          
          {/* Real-time status indicator */}
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
          
          {/* Optimistic updates indicator */}
          {hasOptimisticUpdates && (
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
          )}
        </div>
        {!compact && (
          <p className="text-xs text-gray-500">
            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} rankings
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {showRefresh && (
          <ZPButton
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="p-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </ZPButton>
        )}
        
        {showViewAll && onViewAll && (
          <ZPButton
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="p-1"
          >
            <Eye className="w-4 h-4" />
          </ZPButton>
        )}
      </div>
    </div>
  );

  const renderEntry = (entry: LeaderboardEntry, index: number) => {
    const isClickable = !!onEntryClick;
    
    return (
      <div
        key={entry.id}
        onClick={() => onEntryClick?.(entry)}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
          isClickable ? 'cursor-pointer hover:bg-gray-50' : ''
        } ${entry.rank <= 3 && !compact ? 'bg-gradient-to-r from-yellow-50 to-white' : ''}`}
      >
        {/* Rank */}
        <div className="flex-shrink-0">
          {getRankIcon(entry.rank)}
        </div>

        {/* Entity Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getEntityIcon(entry.entityType)}
            <span className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>
              {entry.name}
            </span>
            {!compact && (
              <ZPBadge variant="secondary" className="text-xs">
                {entry.entityType}
              </ZPBadge>
            )}
          </div>
          
          {!compact && (
            <div className="text-xs text-gray-500 truncate">
              {entry.location.wardName}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <div className={`font-bold text-gray-900 ${compact ? 'text-sm' : ''}`}>
            {formatMetricValue(entry, category)}
          </div>
          {!compact && entry.rankChange !== 0 && (
            <div className="flex items-center justify-end gap-1 text-xs">
              <TrendingUp className={`w-3 h-3 ${
                entry.rankChange > 0 ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={
                entry.rankChange > 0 ? 'text-green-600' : 'text-red-600'
              }>
                {Math.abs(entry.rankChange)}
              </span>
            </div>
          )}
        </div>

        {/* Arrow for clickable entries */}
        {isClickable && (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </div>
    );
  };

  const renderFooter = () => {
    if (compact) return null;

    return (
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastRefresh.toLocaleTimeString()}
          </span>
          
          {showViewAll && onViewAll && (
            <ZPButton
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-xs h-auto p-1"
            >
              View All
              <ChevronRight className="w-3 h-3 ml-1" />
            </ZPButton>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading && data.length === 0) {
    return (
      <ZPCard className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </ZPCard>
    );
  }

  if (error) {
    return (
      <ZPCard className={`p-4 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-sm mb-2">Error loading leaderboard</div>
          <ZPButton size="sm" onClick={refresh}>
            Retry
          </ZPButton>
        </div>
      </ZPCard>
    );
  }

  return (
    <ZPCard className={`${compact ? 'p-3' : 'p-4'} ${className}`}>
      {renderHeader()}
      
      <div className="space-y-2">
        {data.length > 0 ? (
          data.map((entry, index) => renderEntry(entry, index))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            No entries available
          </div>
        )}
      </div>

      {renderFooter()}
    </ZPCard>
  );
};

export default LeaderboardWidget;