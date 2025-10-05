
import { 
  EntityType, 
  LeaderboardScope, 
  TimeFrame, 
  LeaderboardEntry,
  LeaderboardEngine
} from './LeaderboardEngine';
import { 
  RankingCache, 
  getRankingCache, 
  invalidateEntityCache,
  warmUpCache,
  getCacheMetrics,
  RankingStats
} from './RankingCache';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RankingRequest {
  scope: LeaderboardScope;
  entityTypes: EntityType[];
  category: string;
  timeFrame: TimeFrame;
  maxEntries?: number;
  region?: string;
  ward?: string;
  forceRefresh?: boolean;
}

export interface RankingResponse {
  data: LeaderboardEntry[];
  metadata: {
    totalEntities: number;
    computationTime: number;
    fromCache: boolean;
    lastUpdated: Date;
    nextUpdate?: Date;
  };
}

export interface EntityUpdate {
  entityId: string;
  entityType: EntityType;
  metrics: Record<string, number>;
  timestamp: Date;
}

export interface RankingServiceConfig {
  enableCache: boolean;
  enableRealTimeUpdates: boolean;
  updateInterval: number; // milliseconds
  batchUpdateSize: number;
  maxRetries: number;
  retryDelay: number;
}

// ============================================================================
// RANKING SERVICE CLASS
// ============================================================================

export class RankingService {
  private engine: LeaderboardEngine;
  private cache: RankingCache;
  private updateQueue: EntityUpdate[] = [];
  private updateTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: LeaderboardEntry[]) => void> = new Map();

  constructor(private config: RankingServiceConfig = {
    enableCache: true,
    enableRealTimeUpdates: true,
    updateInterval: 30000, // 30 seconds
    batchUpdateSize: 50,
    maxRetries: 3,
    retryDelay: 1000
  }) {
    // LeaderboardEngine constructor is private, so use the static getInstance() method
    this.engine = LeaderboardEngine.getInstance();
    this.cache = getRankingCache();
    
    if (this.config.enableRealTimeUpdates) {
      this.startUpdateProcessor();
    }
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Get rankings with intelligent caching
   */
  async getRankings(request: RankingRequest): Promise<RankingResponse> {
    const startTime = performance.now();
    
    try {
      let data: LeaderboardEntry[];
      let fromCache = false;

      if (this.config.enableCache && !request.forceRefresh) {
        // Try cache first
        data = await this.cache.getRankings(
          request.scope,
          request.entityTypes,
          request.category,
          request.timeFrame,
          request.region,
          request.ward,
          request.maxEntries
        );
        fromCache = true;
      } else {
        // Direct computation using filter object
        const result = await this.engine.generateLeaderboard({
          scope: request.scope,
          entityTypes: request.entityTypes,
          metricCategory: request.category as any,
          timeFrame: request.timeFrame,
          maxEntries: request.maxEntries || 100,
          wardId: request.ward,
          districtId: request.region
        });
        data = result.entries;
        fromCache = false;
      }

      const computationTime = performance.now() - startTime;

      return {
        data,
        metadata: {
          totalEntities: data.length,
          computationTime,
          fromCache,
          lastUpdated: new Date(),
          nextUpdate: this.getNextUpdateTime()
        }
      };
    } catch (error) {
      console.error('Error getting rankings:', error);
      throw new Error(`Failed to get rankings: ${error.message}`);
    }
  }

  /**
   * Subscribe to real-time ranking updates
   */
  subscribe(
    subscriptionId: string,
    request: RankingRequest,
    callback: (data: LeaderboardEntry[]) => void
  ): void {
    this.subscribers.set(subscriptionId, callback);
    
    // Send initial data
    this.getRankings(request)
      .then(response => callback(response.data))
      .catch(error => console.error('Subscription error:', error));
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);
  }

  /**
   * Update entity metrics (triggers cache invalidation and real-time updates)
   */
  async updateEntity(update: EntityUpdate): Promise<void> {
    // Add to update queue for batch processing
    this.updateQueue.push(update);

    // Invalidate relevant cache entries
    invalidateEntityCache(update.entityId, update.entityType);

    // Trigger immediate update for subscribers if queue is small
    if (this.updateQueue.length < 10) {
      await this.processUpdates();
    }
  }

  /**
   * Batch update multiple entities
   */
  async updateEntities(updates: EntityUpdate[]): Promise<void> {
    this.updateQueue.push(...updates);

    // Invalidate cache for all affected entity types
    const affectedTypes = new Set(updates.map(u => u.entityType));
    for (const entityType of affectedTypes) {
      invalidateEntityCache('', entityType);
    }

    await this.processUpdates();
  }

  /**
   * Force refresh of specific rankings
   */
  async refreshRankings(request: RankingRequest): Promise<RankingResponse> {
    return this.getRankings({ ...request, forceRefresh: true });
  }

  /**
   * Get cache performance statistics
   */
  getCacheStats(): RankingStats {
    return getCacheMetrics();
  }

  /**
   * Warm up cache with popular rankings
   */
  async warmUpCache(): Promise<void> {
    await warmUpCache();
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.reset();
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    cacheStats: RankingStats;
    updateQueueSize: number;
    subscriberCount: number;
    lastUpdate: Date | null;
  } {
    const cacheStats = this.getCacheStats();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    // Determine health based on cache hit rate and queue size
    if (cacheStats.hitRate < 50 || this.updateQueue.length > 1000) {
      status = 'degraded';
    }
    if (cacheStats.hitRate < 20 || this.updateQueue.length > 5000) {
      status = 'unhealthy';
    }

    return {
      status,
      cacheStats,
      updateQueueSize: this.updateQueue.length,
      subscriberCount: this.subscribers.size,
      lastUpdate: cacheStats.newestEntry
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    this.subscribers.clear();
    this.updateQueue = [];
    this.cache.destroy();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private startUpdateProcessor(): void {
    this.updateTimer = setInterval(() => {
      this.processUpdates().catch(console.error);
    }, this.config.updateInterval);
  }

  private async processUpdates(): Promise<void> {
    if (this.updateQueue.length === 0) return;

    const batch = this.updateQueue.splice(0, this.config.batchUpdateSize);
    
    try {
      // Process batch updates
      await this.processBatchUpdates(batch);
      
      // Notify subscribers
      await this.notifySubscribers();
    } catch (error) {
      console.error('Error processing updates:', error);
      // Re-queue failed updates for retry
      this.updateQueue.unshift(...batch);
    }
  }

  private async processBatchUpdates(updates: EntityUpdate[]): Promise<void> {
    // Group updates by entity type for efficient processing
    const updatesByType = new Map<EntityType, EntityUpdate[]>();
    
    for (const update of updates) {
      if (!updatesByType.has(update.entityType)) {
        updatesByType.set(update.entityType, []);
      }
      updatesByType.get(update.entityType)!.push(update);
    }

    // Process each entity type
    for (const [entityType, typeUpdates] of updatesByType) {
      await this.processEntityTypeUpdates(entityType, typeUpdates);
    }
  }

  private async processEntityTypeUpdates(
    entityType: EntityType,
    updates: EntityUpdate[]
  ): Promise<void> {
    // In a real implementation, this would update your database
    // For now, we'll just invalidate the cache
    invalidateEntityCache('', entityType);
    
    console.log(`Processed ${updates.length} updates for ${entityType}`);
  }

  private async notifySubscribers(): Promise<void> {
    // In a real implementation, you would determine which subscribers
    // are affected by the updates and send them fresh data
    // For now, we'll just log the notification
    if (this.subscribers.size > 0) {
      console.log(`Notifying ${this.subscribers.size} subscribers of updates`);
    }
  }

  private getNextUpdateTime(): Date {
    return new Date(Date.now() + this.config.updateInterval);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalRankingService: RankingService | null = null;

export function getRankingService(): RankingService {
  if (!globalRankingService) {
    globalRankingService = new RankingService();
  }
  return globalRankingService;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================


export async function getQuickRankings(
  scope: LeaderboardScope,
  entityTypes: EntityType[],
  category: LeaderboardCategory = 'overall',
  timeFrame: TimeFrame = 'monthly',
  maxEntries: number = 50
): Promise<LeaderboardEntry[]> {
  const service = getRankingService();
  const response = await service.getRankings({
    scope,
    entityTypes,
    category,
    timeFrame,
    maxEntries
  });
  return response.data;
}

/**
 * Get top performers across all categories
 */
export async function getTopPerformers(
  entityType: EntityType,
  timeFrame: TimeFrame = 'monthly',
  limit: number = 10
): Promise<{
  overall: LeaderboardEntry[];
  environmental: LeaderboardEntry[];
  social: LeaderboardEntry[];
  governance: LeaderboardEntry[];
}> {
  const service = getRankingService();
  
  const [overall, environmental, social, governance] = await Promise.all([
    service.getRankings({
      scope: 'global',
      entityTypes: [entityType],
      category: 'overall',
      timeFrame,
      maxEntries: limit
    }),
    service.getRankings({
      scope: 'global',
      entityTypes: [entityType],
      category: 'environmental',
      timeFrame,
      maxEntries: limit
    }),
    service.getRankings({
      scope: 'global',
      entityTypes: [entityType],
      category: 'social',
      timeFrame,
      maxEntries: limit
    }),
    service.getRankings({
      scope: 'global',
      entityTypes: [entityType],
      category: 'governance',
      timeFrame,
      maxEntries: limit
    })
  ]);

  return {
    overall: overall.data,
    environmental: environmental.data,
    social: social.data,
    governance: governance.data
  };
}

/**
 * Get entity's current rank
 */
export async function getEntityRank(
  entityId: string,
  entityType: EntityType,
  category: LeaderboardCategory = 'overall',
  scope: LeaderboardScope = 'global',
  timeFrame: TimeFrame = 'monthly'
): Promise<{
  rank: number;
  totalEntities: number;
  percentile: number;
  score: number;
} | null> {
  const service = getRankingService();
  const response = await service.getRankings({
    scope,
    entityTypes: [entityType],
    category,
    timeFrame,
    maxEntries: 1000 // Get enough entries to find the entity
  });

  const entityIndex = response.data.findIndex(entry => entry.id === entityId);
  if (entityIndex === -1) return null;

  const rank = entityIndex + 1;
  const totalEntities = response.metadata.totalEntities;
  const percentile = ((totalEntities - rank) / totalEntities) * 100;
  const score = response.data[entityIndex].score;

  return {
    rank,
    totalEntities,
    percentile,
    score
  };
}