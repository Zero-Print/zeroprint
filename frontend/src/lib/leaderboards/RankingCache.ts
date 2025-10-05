/**
 * Precomputed Ranking System with Caching
 * 
 * This module provides a high-performance ranking system that:
 * 1. Precomputes rankings for different scopes and categories
 * 2. Implements intelligent caching with TTL
 * 3. Provides real-time updates with optimistic updates
 * 4. Handles large datasets efficiently
 */

import { 
  EntityType, 
  LeaderboardScope, 
  LeaderboardCategory, 
  TimeFrame, 
  LeaderboardEntry,
  EntityMetrics,
  BaseEntity
} from './LeaderboardEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CacheKey {
  scope: LeaderboardScope;
  entityTypes: EntityType[];
  category: LeaderboardCategory;
  timeFrame: TimeFrame;
  region?: string;
  ward?: string;
}

export interface CachedRanking {
  key: string;
  data: LeaderboardEntry[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  computationTime: number;
  totalEntities: number;
  lastUpdated: Date;
}

export interface RankingStats {
  totalCacheEntries: number;
  hitRate: number;
  missRate: number;
  averageComputationTime: number;
  cacheSize: number; // in bytes
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export interface PrecomputeConfig {
  scopes: LeaderboardScope[];
  entityTypes: EntityType[][];
  categories: LeaderboardCategory[];
  timeFrames: TimeFrame[];
  regions?: string[];
  wards?: string[];
  maxCacheSize: number; // Maximum cache entries
  defaultTTL: number; // Default TTL in milliseconds
  precomputeInterval: number; // Precompute interval in milliseconds
}

// ============================================================================
// RANKING CACHE CLASS
// ============================================================================

export class RankingCache {
  private cache: Map<string, CachedRanking> = new Map();
  private stats: RankingStats = {
    totalCacheEntries: 0,
    hitRate: 0,
    missRate: 0,
    averageComputationTime: 0,
    cacheSize: 0,
    oldestEntry: null,
    newestEntry: null
  };
  private hitCount = 0;
  private missCount = 0;
  private totalComputationTime = 0;
  private computationCount = 0;
  private precomputeTimer: NodeJS.Timeout | null = null;

  constructor(
    private config: PrecomputeConfig,
    private dataSource: () => Promise<BaseEntity[]>
  ) {
    this.startPrecomputation();
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Get rankings with caching
   */
  async getRankings(
    scope: LeaderboardScope,
    entityTypes: EntityType[],
    category: LeaderboardCategory,
    timeFrame: TimeFrame,
    region?: string,
    ward?: string,
    maxEntries?: number
  ): Promise<LeaderboardEntry[]> {
    const cacheKey = this.generateCacheKey({
      scope,
      entityTypes: entityTypes || [],
      category,
      timeFrame,
      region,
      ward
    });

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      this.hitCount++;
      this.updateStats();
      return maxEntries ? cached.data.slice(0, maxEntries) : cached.data;
    }

    // Cache miss - compute rankings
    this.missCount++;
    const startTime = performance.now();
    
    try {
      const rankings = await this.computeRankings(
        scope,
        entityTypes,
        category,
        timeFrame,
        region,
        ward
      );

      const computationTime = performance.now() - startTime;
      this.totalComputationTime += computationTime;
      this.computationCount++;

      // Cache the result
      await this.setCacheEntry(cacheKey, rankings, computationTime);
      this.updateStats();

      return maxEntries ? rankings.slice(0, maxEntries) : rankings;
    } catch (error) {
      console.error('Error computing rankings:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Invalidate cache entries
   */
  invalidateCache(pattern?: Partial<CacheKey>): void {
    if (!pattern) {
      // Clear all cache
      this.cache.clear();
      return;
    }

    // Invalidate matching entries
    const keysToDelete: string[] = [];
    for (const [key, cached] of this.cache.entries()) {
      if (this.matchesCachePattern(cached, pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.updateStats();
  }

  /**
   * Precompute popular rankings
   */
  async precomputeRankings(): Promise<void> {
    const { scopes, entityTypes, categories, timeFrames, regions, wards } = this.config;

    const tasks: Promise<void>[] = [];

    for (const scope of scopes) {
      for (const entityTypeSet of entityTypes) {
        for (const category of categories) {
          for (const timeFrame of timeFrames) {
            // Global rankings
            tasks.push(
              this.getRankings(scope, entityTypeSet, category, timeFrame)
                .then(() => {}) // Ignore result, just cache
                .catch(error => console.warn('Precompute error:', error))
            );

            // Regional rankings
            if (regions && scope !== 'global') {
              for (const region of regions) {
                tasks.push(
                  this.getRankings(scope, entityTypeSet, category, timeFrame, region)
                    .then(() => {})
                    .catch(error => console.warn('Precompute error:', error))
                );
              }
            }

            // Ward rankings
            if (wards && scope === 'ward') {
              for (const ward of wards) {
                tasks.push(
                  this.getRankings(scope, entityTypeSet, category, timeFrame, undefined, ward)
                    .then(() => {})
                    .catch(error => console.warn('Precompute error:', error))
                );
              }
            }
          }
        }
      }
    }

    // Execute precomputation in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      await Promise.allSettled(batch);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Precomputed ${tasks.length} ranking combinations`);
  }

  /**
   * Get cache statistics
   */
  getStats(): RankingStats {
    return { ...this.stats };
  }

  /**
   * Clear cache and reset stats
   */
  reset(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.totalComputationTime = 0;
    this.computationCount = 0;
    this.updateStats();
  }

  /**
   * Cleanup and stop precomputation
   */
  destroy(): void {
    if (this.precomputeTimer) {
      clearInterval(this.precomputeTimer);
      this.precomputeTimer = null;
    }
    this.cache.clear();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateCacheKey(key: CacheKey): string {
    const parts = [
      key.scope,
      key.entityTypes ? (Array.isArray(key.entityTypes) && key.entityTypes.length > 0 ? key.entityTypes.sort().join(',') : 'all') : 'all',
      key.category,
      key.timeFrame,
      key.region || 'global',
      key.ward || 'all'
    ];
    return parts.join('|');
  }

  private isCacheValid(cached: CachedRanking): boolean {
    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  }

  private async setCacheEntry(
    key: string,
    data: LeaderboardEntry[],
    computationTime: number
  ): Promise<void> {
    const now = Date.now();
    const cached: CachedRanking = {
      key,
      data,
      timestamp: now,
      ttl: this.config.defaultTTL,
      computationTime,
      totalEntities: data.length,
      lastUpdated: new Date()
    };

    this.cache.set(key, cached);

    // Enforce cache size limit
    if (this.cache.size > this.config.maxCacheSize) {
      this.evictOldestEntries();
    }
  }

  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private matchesCachePattern(cached: CachedRanking, pattern: Partial<CacheKey>): boolean {
    const keyParts = cached.key.split('|');
    const [scope, entityTypes, category, timeFrame, region, ward] = keyParts;

    if (pattern.scope && pattern.scope !== scope) return false;
    if (pattern.category && pattern.category !== category) return false;
    if (pattern.timeFrame && pattern.timeFrame !== timeFrame) return false;
    if (pattern.region && pattern.region !== region) return false;
    if (pattern.ward && pattern.ward !== ward) return false;
    if (pattern.entityTypes) {
      const cachedTypes = entityTypes.split(',').sort();
      const patternTypes = pattern.entityTypes.sort();
      if (JSON.stringify(cachedTypes) !== JSON.stringify(patternTypes)) return false;
    }

    return true;
  }

  private updateStats(): void {
    const totalRequests = this.hitCount + this.missCount;
    this.stats = {
      totalCacheEntries: this.cache.size,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.missCount / totalRequests) * 100 : 0,
      averageComputationTime: this.computationCount > 0 
        ? this.totalComputationTime / this.computationCount 
        : 0,
      cacheSize: this.estimateCacheSize(),
      oldestEntry: this.getOldestEntry(),
      newestEntry: this.getNewestEntry()
    };
  }

  private estimateCacheSize(): number {
    let size = 0;
    for (const cached of this.cache.values()) {
      // Rough estimation of memory usage
      size += JSON.stringify(cached).length * 2; // UTF-16 encoding
    }
    return size;
  }

  private getOldestEntry(): Date | null {
    let oldest: Date | null = null;
    for (const cached of this.cache.values()) {
      if (!oldest || cached.lastUpdated < oldest) {
        oldest = cached.lastUpdated;
      }
    }
    return oldest;
  }

  private getNewestEntry(): Date | null {
    let newest: Date | null = null;
    for (const cached of this.cache.values()) {
      if (!newest || cached.lastUpdated > newest) {
        newest = cached.lastUpdated;
      }
    }
    return newest;
  }

  private startPrecomputation(): void {
    // Initial precomputation
    setTimeout(() => {
      this.precomputeRankings().catch(console.error);
    }, 1000);

    // Periodic precomputation
    this.precomputeTimer = setInterval(() => {
      this.precomputeRankings().catch(console.error);
    }, this.config.precomputeInterval);
  }

  private async computeRankings(
    scope: LeaderboardScope,
    entityTypes: EntityType[],
    category: LeaderboardCategory,
    timeFrame: TimeFrame,
    region?: string,
    ward?: string
  ): Promise<LeaderboardEntry[]> {
    // This would typically fetch from your actual data source
    // For now, we'll use the LeaderboardEngine's mock data generation
    const { LeaderboardEngine } = await import('./LeaderboardEngine');
    const engine = new LeaderboardEngine();
    
    return engine.generateLeaderboard(
      scope,
      entityTypes,
      category,
      timeFrame,
      100, // maxEntries
      region,
      ward
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalRankingCache: RankingCache | null = null;

export function getRankingCache(): RankingCache {
  if (!globalRankingCache) {
    const config: PrecomputeConfig = {
      scopes: ['global', 'regional', 'ward', 'district'],
      entityTypes: [
        ['citizen'],
        ['school'],
        ['msme'],
        ['ward'],
        ['citizen', 'school'],
        ['citizen', 'school', 'msme'],
        ['citizen', 'school', 'msme', 'ward']
      ],
      categories: ['overall', 'environmental', 'social', 'governance', 'activity'],
      timeFrames: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all-time'],
      maxCacheSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      precomputeInterval: 10 * 60 * 1000 // 10 minutes
    };

    // Mock data source - in real implementation, this would fetch from your API
    const dataSource = async (): Promise<BaseEntity[]> => {
      const { LeaderboardEngine } = await import('./LeaderboardEngine');
      const engine = new LeaderboardEngine();
      return engine.generateMockEntities(1000);
    };

    globalRankingCache = new RankingCache(config, dataSource);
  }

  return globalRankingCache;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Invalidate cache when entity data changes
 */
export function invalidateEntityCache(
  entityId: string,
  entityType: EntityType,
  scope?: LeaderboardScope
): void {
  const cache = getRankingCache();
  
  // Invalidate all relevant cache entries
  cache.invalidateCache({
    entityTypes: [entityType],
    scope
  });
}

/**
 * Warm up cache with popular combinations
 */
export async function warmUpCache(): Promise<void> {
  const cache = getRankingCache();
  await cache.precomputeRankings();
}

/**
 * Get cache performance metrics
 */
export function getCacheMetrics(): RankingStats {
  const cache = getRankingCache();
  return cache.getStats();
}