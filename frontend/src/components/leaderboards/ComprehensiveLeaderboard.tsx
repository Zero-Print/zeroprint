'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, 
  Filter, Search, RefreshCw, Users, Building, School, 
  Factory, MapPin, Calendar, BarChart3, Eye, Download,
  ChevronUp, ChevronDown, Clock, Star, Zap, Bell
} from 'lucide-react';
import { ZPCard } from '../ui/ZPCard';
import { ZPButton } from '../ui/ZPButton';
import { ZPBadge } from '../ui/ZPBadge';
import { 
  LeaderboardFilter, 
  LeaderboardResult, 
  LeaderboardEntry,
  EntityType, 
  LeaderboardScope, 
  MetricCategory, 
  TimeFrame,
  createLeaderboardFilter 
} from '../../lib/leaderboards/LeaderboardEngine';
import { getRankingService, RankingRequest, RankingResponse } from '../../lib/leaderboards/RankingService';
import { useRealtimeLeaderboard } from '../../hooks/useRealtimeLeaderboard';
import { getPrecomputeService } from '../../lib/leaderboards/PrecomputeService';

// ============================================================================
// INTERFACES
// ============================================================================

interface ComprehensiveLeaderboardProps {
  defaultScope?: LeaderboardScope;
  defaultEntityTypes?: EntityType[];
  defaultCategory?: MetricCategory;
  defaultTimeFrame?: TimeFrame;
  wardId?: string;
  districtId?: string;
  maxEntries?: number;
  showFilters?: boolean;
  showExport?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  className?: string;
}

interface FilterState {
  scope: LeaderboardScope;
  entityTypes: EntityType[];
  category: MetricCategory;
  timeFrame: TimeFrame;
  searchTerm: string;
  minScore: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ComprehensiveLeaderboard: React.FC<ComprehensiveLeaderboardProps> = ({
  defaultScope = 'global',
  defaultEntityTypes = ['citizen', 'school', 'msme'],
  defaultCategory = 'overall',
  defaultTimeFrame = 'monthly',
  wardId,
  districtId,
  maxEntries = 50,
  showFilters = true,
  showExport = true,
  autoRefresh = true,
  refreshInterval = 60,
  className = ''
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [filters, setFilters] = useState<FilterState>({
    scope: defaultScope,
    entityTypes: defaultEntityTypes,
    category: defaultCategory,
    timeFrame: defaultTimeFrame,
    searchTerm: '',
    minScore: 0
  });

  // Real-time leaderboard data
  const {
    data,
    loading,
    error,
    lastUpdated,
    isLive,
    updates,
    optimisticUpdates,
    refresh,
    predictScoreIncrease,
    clearUpdates,
    hasOptimisticUpdates
  } = useRealtimeLeaderboard(
    {
      scope: filters.scope,
      entityTypes: filters.entityTypes,
      category: filters.category,
      timeFrame: filters.timeFrame,
      maxEntries,
      ward: wardId,
      region: districtId
    },
    {
      autoRefresh: true,
      refreshInterval: 30000,
      enableOptimisticUpdates: true,
      onError: (errorMsg) => console.error('Leaderboard error:', errorMsg)
    }
  );

  // Alias for clarity in JSX/helpers
  const leaderboardData = data;

  // Additional state
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);


  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'change' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Do not instantiate engine directly in component to avoid SSR timing issues

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchLeaderboardData = useCallback(() => {
    // Use precomputed data for better performance
    const precomputeService = getPrecomputeService();
    
    // Schedule precomputation for this specific leaderboard configuration
    precomputeService.scheduleJob(
      filters.scope,
      filters.entityTypes,
      filters.category,
      filters.timeFrame,
      'high', // High priority for visible leaderboards
      {
        maxEntries
      }
    );
    
    refresh();
  }, [filters, maxEntries, refresh]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    refresh();
    setLastRefresh(new Date());
  }, [refresh]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchLeaderboardData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval, fetchLeaderboardData]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEntityTypeToggle = (entityType: EntityType) => {
    setFilters(prev => ({
      ...prev,
      entityTypes: prev.entityTypes.includes(entityType)
        ? prev.entityTypes.filter(t => t !== entityType)
        : [...prev.entityTypes, entityType]
    }));
  };

  const handleExport = async () => {
    if (!leaderboardData) return;

    const csvContent = generateCSV(leaderboardData.entries);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${filters.scope}-${filters.category}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600 bg-gray-100 rounded-full">
            {rank}
          </div>
        );
    }
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getEntityIcon = (entityType: EntityType) => {
    switch (entityType) {
      case 'citizen': return <Users className="w-4 h-4" />;
      case 'school': return <School className="w-4 h-4" />;
      case 'msme': return <Factory className="w-4 h-4" />;
      case 'ward': return <Building className="w-4 h-4" />;
      case 'district': return <MapPin className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
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
        return `${metrics.animalSightings || 0} sightings`;
      default:
        return metrics.overallScore.toFixed(0);
    }
  };

  const generateCSV = (entries: LeaderboardEntry[]) => {
    const headers = ['Rank', 'Name', 'Type', 'Score', 'Location', 'Badge', 'Streak Days'];
    const rows = entries.map(entry => [
      entry.rank,
      entry.name,
      entry.entityType,
      formatMetricValue(entry, filters.category),
      `${entry.location.wardName}, ${entry.location.districtName}`,
      entry.badge,
      entry.metrics.streakDays
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const filteredAndSortedEntries = leaderboardData?.entries
    .filter(entry => 
      entry.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      entry.location.wardName.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'score':
          aValue = a.metrics.overallScore;
          bValue = b.metrics.overallScore;
          break;
        case 'change':
          aValue = a.rankChange;
          bValue = b.rankChange;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.rank;
          bValue = b.rank;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }) || [];

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFiltersPanel = () => (
    <ZPCard className="mb-6">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <ZPButton
            variant="ghost"
            size="sm"
            onClick={() => setShowFiltersPanel(false)}
          >
            ×
          </ZPButton>
        </div>

        {/* Scope Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Scope</label>
          <div className="flex flex-wrap gap-2">
            {(['global', 'ward', 'district', 'regional' ] as LeaderboardScope[]).map(scope => (
              <ZPButton
                key={scope}
                variant={filters.scope === scope ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('scope', scope)}
              >
                {scope.charAt(0).toUpperCase() + scope.slice(1)}
              </ZPButton>
            ))}
          </div>
        </div>

        {/* Entity Types */}
        <div>
          <label className="block text-sm font-medium mb-2">Entity Types</label>
          <div className="flex flex-wrap gap-2">
            {(['citizen', 'school', 'msme', 'ward'] as EntityType[]).map(type => (
              <ZPButton
                key={type}
                variant={filters.entityTypes.includes(type) ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleEntityTypeToggle(type)}
                className="flex items-center gap-1"
              >
                {getEntityIcon(type)}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </ZPButton>
            ))}
          </div>
        </div>

        {/* Metric Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Metric Category</label>
          <div className="flex flex-wrap gap-2">
            {(['overall', 'environmental', 'social', 'governance', 'carbon', 'wellness'] as MetricCategory[]).map(category => (
              <ZPButton
                key={category}
                variant={filters.category === category ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('category', category)}
              >
                {getMetricLabel(category)}
              </ZPButton>
            ))}
          </div>
        </div>

        {/* Time Frame */}
        <div>
          <label className="block text-sm font-medium mb-2">Time Frame</label>
          <div className="flex flex-wrap gap-2">
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as TimeFrame[]).map(timeFrame => (
              <ZPButton
                key={timeFrame}
                variant={filters.timeFrame === timeFrame ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('timeFrame', timeFrame)}
              >
                {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
              </ZPButton>
            ))}
          </div>
        </div>
      </div>
    </ZPCard>
  );

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {getMetricLabel(filters.category)} Leaderboard
          </h2>
          {data && (
            <ZPBadge variant="secondary">
              {data.entries.length} entries
            </ZPBadge>
          )}
          
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-500">
              {isLive ? 'Live' : 'Offline'}
            </span>
          </div>
          
          {/* Optimistic updates indicator */}
          {hasOptimisticUpdates && (
            <ZPBadge variant="warning" className="animate-pulse">
              Updating...
            </ZPBadge>
          )}
        </div>
        <p className="text-gray-600">
          {filters.scope.charAt(0).toUpperCase() + filters.scope.slice(1)} rankings for {filters.timeFrame} period
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Update notifications */}
        {updates.length > 0 && (
          <ZPButton
            variant="outline"
            size="sm"
            onClick={clearUpdates}
            className="flex items-center gap-1 animate-pulse"
          >
            <Star className="w-4 h-4" />
            {updates.length}
          </ZPButton>
        )}
        
        {/* Auto-refresh toggle */}
        <ZPButton
          variant={autoRefreshEnabled ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          className="flex items-center gap-1"
        >
          <Zap className="w-4 h-4" />
          Auto
        </ZPButton>

        {/* Manual refresh */}
        <ZPButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </ZPButton>

        {/* Filters toggle */}
        {showFilters && (
          <ZPButton
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="flex items-center gap-1"
          >
            <Filter className="w-4 h-4" />
            Filters
          </ZPButton>
        )}

        {/* Export */}
        {showExport && (
          <ZPButton
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!data}
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Export
          </ZPButton>
        )}
      </div>
    </div>
  );

  const renderSearchAndSort = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or location..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Sort by:</span>
        {(['rank', 'score', 'change', 'name'] as const).map(option => (
          <ZPButton
            key={option}
            variant={sortBy === option ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleSort(option)}
            className="flex items-center gap-1"
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
            {sortBy === option && (
              sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
            )}
          </ZPButton>
        ))}
      </div>
    </div>
  );

  const renderMetadata = () => {
    if (!leaderboardData) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ZPCard className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{leaderboardData.totalEntries}</div>
          <div className="text-sm text-gray-600">Total Entries</div>
        </ZPCard>
        <ZPCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{leaderboardData.metadata.averageScore.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </ZPCard>
        <ZPCard className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{leaderboardData.metadata.topScore.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Top Score</div>
        </ZPCard>
        <ZPCard className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{leaderboardData.metadata.participationRate.toFixed(0)}%</div>
          <div className="text-sm text-gray-600">Active Rate</div>
        </ZPCard>
      </div>
    );
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => (
    <div
      key={entry.id}
      className={`flex items-center p-4 bg-white rounded-lg border transition-all duration-200 hover:shadow-md ${
        entry.rank <= 3 ? 'ring-2 ring-yellow-200 bg-gradient-to-r from-yellow-50 to-white' : ''
      }`}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-12 mr-4">
        {getRankIcon(entry.rank)}
      </div>

      {/* Entity Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {getEntityIcon(entry.entityType)}
          <h4 className="font-semibold text-gray-900 truncate">{entry.name}</h4>
          <ZPBadge variant="secondary" className="text-xs">
            {entry.entityType}
          </ZPBadge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {entry.location.wardName}
          </span>
          {entry.metrics.streakDays > 0 && (
            <span className="flex items-center gap-1 text-orange-600">
              🔥 {entry.metrics.streakDays} days
            </span>
          )}
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {entry.badge}
          </span>
        </div>
      </div>

      {/* Score and Change */}
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">
          {formatMetricValue(entry, filters.category)}
        </div>
        <div className="flex items-center justify-end gap-1 text-sm">
          {getRankChangeIcon(entry.rankChange)}
          <span className={`${
            entry.rankChange > 0 ? 'text-green-600' : 
            entry.rankChange < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {entry.rankChange === 0 ? '—' : Math.abs(entry.rankChange)}
          </span>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading && !leaderboardData) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ZPCard className={`p-6 text-center ${className}`}>
        <div className="text-red-600 mb-2">Error loading leaderboard</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <ZPButton onClick={fetchLeaderboardData}>Try Again</ZPButton>
      </ZPCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {renderHeader()}
      {showFiltersPanel && renderFiltersPanel()}
      {renderMetadata()}
      {renderSearchAndSort()}

      {/* Last updated info */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Last updated: {lastRefresh.toLocaleTimeString()}
        </span>
        {autoRefreshEnabled && (
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Auto-refresh every {refreshInterval}s
          </span>
        )}
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-3">
        {filteredAndSortedEntries.length > 0 ? (
          filteredAndSortedEntries.map((entry, index) => renderLeaderboardEntry(entry, index))
        ) : (
          <ZPCard className="p-8 text-center">
            <div className="text-gray-500">No entries found matching your criteria</div>
          </ZPCard>
        )}
      </div>

      {/* Load more button */}
      {leaderboardData && filteredAndSortedEntries.length < leaderboardData.totalEntries && (
        <div className="text-center">
          <ZPButton variant="outline" onClick={() => {/* Implement load more */}}>
            Load More ({leaderboardData.totalEntries - filteredAndSortedEntries.length} remaining)
          </ZPButton>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveLeaderboard;