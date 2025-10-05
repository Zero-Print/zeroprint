'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LeaderboardFilter, 
  LeaderboardResult, 
  LeaderboardEntry,
  EntityType, 
  LeaderboardScope, 
  MetricCategory, 
  TimeFrame
} from '../lib/leaderboards/LeaderboardEngine';
import { getRankingService, RankingRequest } from '../lib/leaderboards/RankingService';

// ============================================================================
// INTERFACES
// ============================================================================

interface UseLeaderboardOptions {
  scope?: LeaderboardScope;
  entityTypes?: EntityType[];
  category?: MetricCategory;
  timeFrame?: TimeFrame;
  wardId?: string;
  districtId?: string;
  maxEntries?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  enableOptimisticUpdates?: boolean;
  cacheKey?: string;
}

interface UseLeaderboardReturn {
  data: LeaderboardResult | null;
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  isRefreshing: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  updateEntry: (entryId: string, updates: Partial<LeaderboardEntry>) => void;
  addOptimisticEntry: (entry: Omit<LeaderboardEntry, 'rank'>) => void;
  removeOptimisticEntry: (entryId: string) => void;
  
  // Controls
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  
  // Metadata
  totalEntries: number;
  averageScore: number;
  topScore: number;
  participationRate: number;
}

interface CacheEntry {
  data: LeaderboardResult;
  timestamp: Date;
  expiresAt: Date;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

class LeaderboardCache {
  private static instance: LeaderboardCache;
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): LeaderboardCache {
    if (!LeaderboardCache.instance) {
      LeaderboardCache.instance = new LeaderboardCache();
    }
    return LeaderboardCache.instance;
  }

  generateKey(filter: LeaderboardFilter): string {
    return JSON.stringify({
      scope: filter.scope,
      entityTypes: filter.entityTypes?.sort(),
      category: filter.metricCategory,
      timeFrame: filter.timeFrame,
      wardId: filter.wardId,
      districtId: filter.districtId,
      maxEntries: filter.maxEntries
    });
  }

  get(key: string): LeaderboardResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: LeaderboardResult, ttl: number = this.DEFAULT_TTL): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useLeaderboard = (options: UseLeaderboardOptions = {}): UseLeaderboardReturn => {
  const {
    scope = 'global',
    entityTypes = ['citizen', 'school', 'msme'],
    category = 'overall',
    timeFrame = 'monthly',
    wardId,
    districtId,
    maxEntries = 50,
    autoRefresh = false,
    refreshInterval = 60,
    enableOptimisticUpdates = true,
    cacheKey
  } = options;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval);
  
  // Optimistic updates
  const [optimisticEntries, setOptimisticEntries] = useState<Map<string, LeaderboardEntry>>(new Map());
  const [removedEntries, setRemovedEntries] = useState<Set<string>>(new Set());

  // Refs
  // Avoid direct singleton usage here to prevent SSR issues; RankingService handles engine access
  const cache = useRef(LeaderboardCache.getInstance());
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filter: LeaderboardFilter = {
    scope,
    entityTypes,
    metricCategory: category,
    timeFrame,
    wardId,
    districtId,
    maxEntries
  };

  const cacheKeyValue = cacheKey || cache.current.generateKey(filter);

  const entries = data ? 
    data.entries
      .filter(entry => !removedEntries.has(entry.id))
      .map(entry => optimisticEntries.get(entry.id) || entry)
      .concat(Array.from(optimisticEntries.values()).filter(entry => 
        !data.entries.some(e => e.id === entry.id)
      ))
      .sort((a, b) => a.rank - b.rank)
    : [];

  const totalEntries = data?.totalEntries || 0;
  const averageScore = data?.metadata.averageScore || 0;
  const topScore = data?.metadata.topScore || 0;
  const participationRate = data?.metadata.participationRate || 0;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchData = useCallback(async (useCache: boolean = true): Promise<void> => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setError(null);
      
      // Check cache first
      if (useCache) {
        const cachedData = cache.current.get(cacheKeyValue);
        if (cachedData) {
          setData(cachedData);
          setLastRefresh(new Date());
          setLoading(false);
          return;
        }
      }

      setIsRefreshing(true);

      const rankingService = getRankingService();
      const request: RankingRequest = {
        scope: filter.scope,
        entityTypes: filter.entityTypes,
        category: filter.metricCategory,
        timeFrame: filter.timeFrame,
        maxEntries: filter.maxEntries,
        wardId: filter.wardId,
        districtId: filter.districtId
      };
      
      const response = await rankingService.getRankings(request);
      const result = response.data;
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setData(result);
      setLastRefresh(new Date());
      
      // Cache the result
      cache.current.set(cacheKeyValue, result);
      
      // Clear optimistic updates on successful fetch
      if (enableOptimisticUpdates) {
        setOptimisticEntries(new Map());
        setRemovedEntries(new Set());
      }
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filter, cacheKeyValue, enableOptimisticUpdates]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchData(false); // Force refresh, bypass cache
  }, [fetchData]);

  // ============================================================================
  // OPTIMISTIC UPDATES
  // ============================================================================

  const updateEntry = useCallback((entryId: string, updates: Partial<LeaderboardEntry>) => {
    if (!enableOptimisticUpdates) return;

    setOptimisticEntries(prev => {
      const newMap = new Map(prev);
      const existingEntry = data?.entries.find(e => e.id === entryId) || prev.get(entryId);
      
      if (existingEntry) {
        newMap.set(entryId, { ...existingEntry, ...updates });
      }
      
      return newMap;
    });

    // Invalidate cache to ensure fresh data on next fetch
    cache.current.invalidate(cacheKeyValue);
  }, [enableOptimisticUpdates, data, cacheKeyValue]);

  const addOptimisticEntry = useCallback((entry: Omit<LeaderboardEntry, 'rank'>) => {
    if (!enableOptimisticUpdates) return;

    const newEntry: LeaderboardEntry = {
      ...entry,
      rank: (data?.entries.length || 0) + 1 // Temporary rank
    };

    setOptimisticEntries(prev => {
      const newMap = new Map(prev);
      newMap.set(entry.id, newEntry);
      return newMap;
    });

    // Invalidate cache
    cache.current.invalidate(cacheKeyValue);
  }, [enableOptimisticUpdates, data, cacheKeyValue]);

  const removeOptimisticEntry = useCallback((entryId: string) => {
    if (!enableOptimisticUpdates) return;

    setRemovedEntries(prev => new Set(prev).add(entryId));
    setOptimisticEntries(prev => {
      const newMap = new Map(prev);
      newMap.delete(entryId);
      return newMap;
    });

    // Invalidate cache
    cache.current.invalidate(cacheKeyValue);
  }, [enableOptimisticUpdates, cacheKeyValue]);

  // ============================================================================
  // AUTO-REFRESH MANAGEMENT
  // ============================================================================

  const setAutoRefresh = useCallback((enabled: boolean) => {
    setAutoRefreshEnabled(enabled);
  }, []);

  const setRefreshInterval = useCallback((interval: number) => {
    setCurrentRefreshInterval(interval);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      return;
    }

    const scheduleRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        fetchData(false).then(scheduleRefresh);
      }, currentRefreshInterval * 1000);
    };

    scheduleRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefreshEnabled, currentRefreshInterval, fetchData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN VALUE
  // ============================================================================

  return {
    data,
    entries,
    loading,
    error,
    lastRefresh,
    isRefreshing,
    
    // Actions
    refresh,
    updateEntry,
    addOptimisticEntry,
    removeOptimisticEntry,
    
    // Controls
    setAutoRefresh,
    setRefreshInterval,
    
    // Metadata
    totalEntries,
    averageScore,
    topScore,
    participationRate
  };
};

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

export const useLeaderboardEntry = (entryId: string, options: UseLeaderboardOptions = {}) => {
  const { entries, updateEntry, removeOptimisticEntry } = useLeaderboard(options);
  
  const entry = entries.find(e => e.id === entryId);
  
  const updateThisEntry = useCallback((updates: Partial<LeaderboardEntry>) => {
    updateEntry(entryId, updates);
  }, [entryId, updateEntry]);
  
  const removeThisEntry = useCallback(() => {
    removeOptimisticEntry(entryId);
  }, [entryId, removeOptimisticEntry]);
  
  return {
    entry,
    updateEntry: updateThisEntry,
    removeEntry: removeThisEntry
  };
};

export const useLeaderboardStats = (options: UseLeaderboardOptions = {}) => {
  const { totalEntries, averageScore, topScore, participationRate, data } = useLeaderboard(options);
  
  return {
    totalEntries,
    averageScore,
    topScore,
    participationRate,
    metadata: data?.metadata
  };
};

export default useLeaderboard;