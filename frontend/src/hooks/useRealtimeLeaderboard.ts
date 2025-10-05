/**
 * useRealtimeLeaderboard - Real-time leaderboard hook with optimistic updates
 * Provides live leaderboard data with automatic refresh and optimistic UI updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getRealtimeService, RealtimeEvent } from '@/lib/realtime/RealtimeService';
import { getRankingService, RankingRequest, RankingResponse } from '@/lib/leaderboards/RankingService';
import { LeaderboardResult, LeaderboardEntry, EntityType, LeaderboardScope, LeaderboardCategory, TimeFrame } from '@/lib/leaderboards/LeaderboardEngine';

// ============================================================================
// INTERFACES
// ============================================================================

export interface RealtimeLeaderboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enableOptimisticUpdates?: boolean;
  maxRetries?: number;
  onError?: (error: string) => void;
  onUpdate?: (data: LeaderboardResult) => void;
}

export interface LeaderboardUpdate {
  type: 'entry_update' | 'rank_change' | 'new_entry' | 'entry_removed';
  entityId: string;
  oldRank?: number;
  newRank?: number;
  entry?: LeaderboardEntry;
  timestamp: Date;
}

export interface OptimisticLeaderboardUpdate {
  id: string;
  type: 'score_increase' | 'rank_prediction' | 'new_activity';
  entityId: string;
  predictedChange: number;
  originalEntry?: LeaderboardEntry;
  timestamp: Date;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useRealtimeLeaderboard(
  request: RankingRequest,
  options: RealtimeLeaderboardOptions = {}
) {
  // State
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [updates, setUpdates] = useState<LeaderboardUpdate[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticLeaderboardUpdate>>(new Map());

  // Refs
  const mountedRef = useRef(true);
  const previousDataRef = useRef<LeaderboardResult | null>(null);
  const realtimeService = getRealtimeService();
  const rankingService = getRankingService();

  // Configuration
  const config = {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    enableOptimisticUpdates: true,
    maxRetries: 3,
    ...options
  };

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchData = useCallback(async (showLoading = true) => {
    if (!mountedRef.current) return;

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response: RankingResponse = await rankingService.getRankings(request);
      
      if (!mountedRef.current) return;

      const newData = response.data;
      const previousData = previousDataRef.current;

      // Detect changes and generate updates
      if (previousData) {
        const detectedUpdates = detectLeaderboardChanges(previousData, newData);
        setUpdates(prev => [...detectedUpdates, ...prev.slice(0, 9)]); // Keep last 10 updates
      }

      setData(newData);
      setLastUpdated(response.metadata.lastUpdated);
      setIsLive(true);
      previousDataRef.current = newData;

      // Call update callback
      if (config.onUpdate) {
        config.onUpdate(newData);
      }

    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard data';
      setError(errorMessage);
      setIsLive(false);

      if (config.onError) {
        config.onError(errorMessage);
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, [request, rankingService, config]);

  // ============================================================================
  // OPTIMISTIC UPDATES
  // ============================================================================

  const applyOptimisticUpdate = useCallback((
    entityId: string,
    type: OptimisticLeaderboardUpdate['type'],
    predictedChange: number
  ): string => {
    if (!config.enableOptimisticUpdates || !data) return '';

    const updateId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const originalEntry = data.entries.find(entry => entry.id === entityId);

    const optimisticUpdate: OptimisticLeaderboardUpdate = {
      id: updateId,
      type,
      entityId,
      predictedChange,
      originalEntry,
      timestamp: new Date()
    };

    // Apply optimistic change to data
    const updatedData = applyOptimisticChangeToData(data, optimisticUpdate);
    setData(updatedData);

    // Store optimistic update
    setOptimisticUpdates(prev => new Map(prev).set(updateId, optimisticUpdate));

    // Use realtime service for timeout management
    realtimeService.applyOptimisticUpdate(
      `leaderboard_${request.scope}_${request.category}`,
      updatedData,
      data
    );

    // Auto-revert after timeout
    setTimeout(() => {
      revertOptimisticUpdate(updateId);
    }, 5000);

    return updateId;
  }, [data, config.enableOptimisticUpdates, realtimeService, request]);

  const revertOptimisticUpdate = useCallback((updateId: string) => {
    const update = optimisticUpdates.get(updateId);
    if (!update || !data) return;

    // Revert to original data
    if (update.originalEntry) {
      const revertedData = revertOptimisticChangeFromData(data, update);
      setData(revertedData);
    }

    // Remove from optimistic updates
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(updateId);
      return newMap;
    });
  }, [optimisticUpdates, data]);

  const confirmOptimisticUpdate = useCallback((updateId: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(updateId);
      return newMap;
    });
  }, []);

  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================

  useEffect(() => {
    if (!config.autoRefresh) return;

    const dataType = `leaderboard_${request.scope}_${request.category}`;
    
    const unsubscribe = realtimeService.subscribe(
      dataType,
      (event: RealtimeEvent<LeaderboardResult>) => {
        if (!mountedRef.current) return;

        setData(event.data);
        setLastUpdated(event.timestamp);
        setIsLive(true);

        // Detect changes
        if (previousDataRef.current) {
          const detectedUpdates = detectLeaderboardChanges(previousDataRef.current, event.data);
          setUpdates(prev => [...detectedUpdates, ...prev.slice(0, 9)]);
        }

        previousDataRef.current = event.data;

        // Confirm any matching optimistic updates
        optimisticUpdates.forEach((update, updateId) => {
          if (update.entityId && event.data.entries.some(entry => entry.id === update.entityId)) {
            confirmOptimisticUpdate(updateId);
          }
        });

        if (config.onUpdate) {
          config.onUpdate(event.data);
        }
      },
      {
        immediate: false,
        interval: config.refreshInterval
      }
    );

    return unsubscribe;
  }, [request, config, realtimeService, optimisticUpdates, confirmOptimisticUpdate]);

  // ============================================================================
  // INITIAL DATA LOAD
  // ============================================================================

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // PUBLIC INTERFACE
  // ============================================================================

  const refresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  const predictScoreIncrease = useCallback((entityId: string, points: number) => {
    return applyOptimisticUpdate(entityId, 'score_increase', points);
  }, [applyOptimisticUpdate]);

  const predictNewActivity = useCallback((entityId: string) => {
    return applyOptimisticUpdate(entityId, 'new_activity', 1);
  }, [applyOptimisticUpdate]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    // Data
    data,
    loading,
    error,
    lastUpdated,
    isLive,
    
    // Updates
    updates,
    optimisticUpdates: Array.from(optimisticUpdates.values()),
    
    // Actions
    refresh,
    predictScoreIncrease,
    predictNewActivity,
    revertOptimisticUpdate,
    clearUpdates,
    
    // Status
    hasOptimisticUpdates: optimisticUpdates.size > 0,
    updateCount: updates.length
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function detectLeaderboardChanges(
  oldData: LeaderboardResult,
  newData: LeaderboardResult
): LeaderboardUpdate[] {
  const updates: LeaderboardUpdate[] = [];
  const oldEntries = new Map(oldData.entries.map(entry => [entry.id, entry]));
  const newEntries = new Map(newData.entries.map(entry => [entry.id, entry]));

  // Check for rank changes and updates
  for (const [entityId, newEntry] of newEntries) {
    const oldEntry = oldEntries.get(entityId);
    
    if (!oldEntry) {
      // New entry
      updates.push({
        type: 'new_entry',
        entityId,
        newRank: newEntry.rank,
        entry: newEntry,
        timestamp: new Date()
      });
    } else if (oldEntry.rank !== newEntry.rank) {
      // Rank change
      updates.push({
        type: 'rank_change',
        entityId,
        oldRank: oldEntry.rank,
        newRank: newEntry.rank,
        entry: newEntry,
        timestamp: new Date()
      });
    } else if (oldEntry.score !== newEntry.score) {
      // Score update
      updates.push({
        type: 'entry_update',
        entityId,
        oldRank: oldEntry.rank,
        newRank: newEntry.rank,
        entry: newEntry,
        timestamp: new Date()
      });
    }
  }

  // Check for removed entries
  for (const [entityId, oldEntry] of oldEntries) {
    if (!newEntries.has(entityId)) {
      updates.push({
        type: 'entry_removed',
        entityId,
        oldRank: oldEntry.rank,
        entry: oldEntry,
        timestamp: new Date()
      });
    }
  }

  return updates;
}

function applyOptimisticChangeToData(
  data: LeaderboardResult,
  update: OptimisticLeaderboardUpdate
): LeaderboardResult {
  const entries = [...data.entries];
  const entryIndex = entries.findIndex(entry => entry.id === update.entityId);
  
  if (entryIndex === -1) return data;

  const entry = { ...entries[entryIndex] };
  
  switch (update.type) {
    case 'score_increase':
      entry.score += update.predictedChange;
      break;
    case 'new_activity':
      entry.metrics.activityScore += update.predictedChange;
      break;
  }

  entries[entryIndex] = entry;

  // Re-sort entries by score
  entries.sort((a, b) => b.score - a.score);

  // Update ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return {
    ...data,
    entries,
    metadata: {
      ...data.metadata,
      lastUpdated: new Date()
    }
  };
}

function revertOptimisticChangeFromData(
  data: LeaderboardResult,
  update: OptimisticLeaderboardUpdate
): LeaderboardResult {
  if (!update.originalEntry) return data;

  const entries = [...data.entries];
  const entryIndex = entries.findIndex(entry => entry.id === update.entityId);
  
  if (entryIndex === -1) return data;

  entries[entryIndex] = { ...update.originalEntry };

  // Re-sort entries by score
  entries.sort((a, b) => b.score - a.score);

  // Update ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return {
    ...data,
    entries,
    metadata: {
      ...data.metadata,
      lastUpdated: new Date()
    }
  };
}