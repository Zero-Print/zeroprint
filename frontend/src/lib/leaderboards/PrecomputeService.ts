/**
 * PrecomputeService - Background service for precomputing rankings
 * Handles scheduled precomputation, cache warming, and performance optimization
 */

import { getRankingService } from './RankingService';
import { getRankingCache } from './RankingCache';
import { EntityType, LeaderboardScope, LeaderboardCategory, TimeFrame } from './LeaderboardEngine';

// ============================================================================
// INTERFACES
// ============================================================================

interface PrecomputeJob {
  id: string;
  priority: 'high' | 'medium' | 'low';
  scope: LeaderboardScope;
  entityTypes: EntityType[];
  category: LeaderboardCategory;
  timeFrame: TimeFrame;
  maxEntries: number;
  region?: string;
  ward?: string;
  scheduledAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
}

interface PrecomputeConfig {
  enabled: boolean;
  batchSize: number;
  maxConcurrent: number;
  retryLimit: number;
  scheduleInterval: number; // minutes
  priorityConfigs: PriorityConfig[];
}

interface PriorityConfig {
  priority: 'high' | 'medium' | 'low';
  scope: LeaderboardScope;
  entityTypes: EntityType[];
  categories: LeaderboardCategory[];
  timeFrames: TimeFrame[];
  regions?: string[];
  wards?: string[];
}

interface PrecomputeStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageExecutionTime: number;
  cacheHitRate: number;
  lastRunTime: Date;
  nextRunTime: Date;
}

// ============================================================================
// PRECOMPUTE SERVICE
// ============================================================================

export class PrecomputeService {
  private jobs: Map<string, PrecomputeJob> = new Map();
  private runningJobs: Set<string> = new Set();
  private config: PrecomputeConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private stats: PrecomputeStats;

  constructor(config?: Partial<PrecomputeConfig>) {
    this.config = {
      enabled: true,
      batchSize: 10,
      maxConcurrent: 3,
      retryLimit: 3,
      scheduleInterval: 30, // 30 minutes
      priorityConfigs: this.getDefaultPriorityConfigs(),
      ...config
    };

    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageExecutionTime: 0,
      cacheHitRate: 0,
      lastRunTime: new Date(),
      nextRunTime: new Date(Date.now() + this.config.scheduleInterval * 60 * 1000)
    };
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Start the precompute service
   */
  start(): void {
    if (!this.config.enabled || this.intervalId) return;

    console.log('Starting PrecomputeService...');
    
    // Schedule initial jobs
    this.scheduleJobs();
    
    // Set up recurring schedule
    this.intervalId = setInterval(() => {
      this.scheduleJobs();
    }, this.config.scheduleInterval * 60 * 1000);
  }

  /**
   * Stop the precompute service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Cancel running jobs
    this.runningJobs.clear();
    console.log('PrecomputeService stopped');
  }

  /**
   * Schedule a specific job
   */
  scheduleJob(
    scope: LeaderboardScope,
    entityTypes: EntityType[],
    category: LeaderboardCategory,
    timeFrame: TimeFrame,
    priority: 'high' | 'medium' | 'low' = 'medium',
    options?: {
      maxEntries?: number;
      region?: string;
      ward?: string;
    }
  ): string {
    const jobId = this.generateJobId(scope, entityTypes, category, timeFrame, options);
    
    const job: PrecomputeJob = {
      id: jobId,
      priority,
      scope,
      entityTypes,
      category,
      timeFrame,
      maxEntries: options?.maxEntries || 100,
      region: options?.region,
      ward: options?.ward,
      scheduledAt: new Date(),
      status: 'pending',
      retryCount: 0
    };

    this.jobs.set(jobId, job);
    this.stats.totalJobs++;

    // Process immediately if high priority
    if (priority === 'high') {
      this.processJob(job);
    }

    return jobId;
  }

  /**
   * Get precompute statistics
   */
  getStats(): PrecomputeStats {
    return { ...this.stats };
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): PrecomputeJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed') return false;

    if (job.status === 'running') {
      this.runningJobs.delete(jobId);
    }

    this.jobs.delete(jobId);
    return true;
  }

  /**
   * Force precompute for popular combinations
   */
  async precomputePopular(): Promise<void> {
    const popularCombinations = [
      // Overall leaderboards
      { scope: 'global' as LeaderboardScope, entityTypes: ['individual'] as EntityType[], category: 'overall' as LeaderboardCategory, timeFrame: 'week' as TimeFrame },
      { scope: 'global' as LeaderboardScope, entityTypes: ['individual'] as EntityType[], category: 'overall' as LeaderboardCategory, timeFrame: 'month' as TimeFrame },
      { scope: 'global' as LeaderboardScope, entityTypes: ['organization'] as EntityType[], category: 'overall' as LeaderboardCategory, timeFrame: 'week' as TimeFrame },
      
      // Environmental leaderboards
      { scope: 'global' as LeaderboardScope, entityTypes: ['individual'] as EntityType[], category: 'environmental' as LeaderboardCategory, timeFrame: 'week' as TimeFrame },
      { scope: 'global' as LeaderboardScope, entityTypes: ['organization'] as EntityType[], category: 'environmental' as LeaderboardCategory, timeFrame: 'month' as TimeFrame },
      
      // Social leaderboards
      { scope: 'regional' as LeaderboardScope, entityTypes: ['individual'] as EntityType[], category: 'social' as LeaderboardCategory, timeFrame: 'week' as TimeFrame },
    ];

    for (const combo of popularCombinations) {
      this.scheduleJob(
        combo.scope,
        combo.entityTypes,
        combo.category,
        combo.timeFrame,
        'high'
      );
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private scheduleJobs(): void {
    console.log('Scheduling precompute jobs...');
    
    for (const priorityConfig of this.config.priorityConfigs) {
      this.scheduleJobsForPriority(priorityConfig);
    }

    this.processJobs();
    this.updateStats();
  }

  private scheduleJobsForPriority(config: PriorityConfig): void {
    for (const category of config.categories) {
      for (const timeFrame of config.timeFrames) {
        const jobId = this.generateJobId(
          config.scope,
          config.entityTypes,
          category,
          timeFrame
        );

        // Skip if job already exists and is recent
        const existingJob = this.jobs.get(jobId);
        if (existingJob && this.isJobRecent(existingJob)) {
          continue;
        }

        this.scheduleJob(
          config.scope,
          config.entityTypes,
          category,
          timeFrame,
          config.priority
        );
      }
    }
  }

  private async processJobs(): Promise<void> {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority));

    const availableSlots = this.config.maxConcurrent - this.runningJobs.size;
    const jobsToProcess = pendingJobs.slice(0, Math.min(availableSlots, this.config.batchSize));

    for (const job of jobsToProcess) {
      this.processJob(job);
    }
  }

  private async processJob(job: PrecomputeJob): Promise<void> {
    if (this.runningJobs.has(job.id)) return;

    this.runningJobs.add(job.id);
    job.status = 'running';

    const startTime = Date.now();

    try {
      const rankingService = getRankingService();
      
      await rankingService.getRankings({
        scope: job.scope,
        entityTypes: job.entityTypes,
        category: job.category,
        timeFrame: job.timeFrame,
        maxEntries: job.maxEntries,
        region: job.region,
        ward: job.ward
      });

      job.status = 'completed';
      this.stats.completedJobs++;
      
      console.log(`Precompute job ${job.id} completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      job.lastError = error instanceof Error ? error.message : 'Unknown error';
      job.retryCount++;

      if (job.retryCount >= this.config.retryLimit) {
        job.status = 'failed';
        this.stats.failedJobs++;
        console.error(`Precompute job ${job.id} failed permanently:`, job.lastError);
      } else {
        job.status = 'pending';
        console.warn(`Precompute job ${job.id} failed, retrying (${job.retryCount}/${this.config.retryLimit}):`, job.lastError);
      }
    } finally {
      this.runningJobs.delete(job.id);
      
      // Update average execution time
      const executionTime = Date.now() - startTime;
      this.stats.averageExecutionTime = 
        (this.stats.averageExecutionTime * (this.stats.completedJobs - 1) + executionTime) / this.stats.completedJobs;
    }
  }

  private generateJobId(
    scope: LeaderboardScope,
    entityTypes: EntityType[],
    category: LeaderboardCategory,
    timeFrame: TimeFrame,
    options?: { region?: string; ward?: string }
  ): string {
    const parts = [
      scope,
      entityTypes.join(','),
      category,
      timeFrame,
      options?.region || 'all',
      options?.ward || 'all'
    ];
    
    return parts.join('|');
  }

  private isJobRecent(job: PrecomputeJob): boolean {
    const ageMinutes = (Date.now() - job.scheduledAt.getTime()) / (1000 * 60);
    return ageMinutes < this.config.scheduleInterval;
  }

  private getPriorityWeight(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: return 2;
    }
  }

  private updateStats(): void {
    this.stats.lastRunTime = new Date();
    this.stats.nextRunTime = new Date(Date.now() + this.config.scheduleInterval * 60 * 1000);
    
    // Update cache hit rate from RankingCache
    const cache = getRankingCache();
    const cacheStats = cache.getStats();
    this.stats.cacheHitRate = cacheStats.hitRate;
  }

  private getDefaultPriorityConfigs(): PriorityConfig[] {
    return [
      // High priority - most viewed combinations
      {
        priority: 'high',
        scope: 'global',
        entityTypes: ['individual'],
        categories: ['overall', 'environmental'],
        timeFrames: ['week', 'month']
      },
      {
        priority: 'high',
        scope: 'regional',
        entityTypes: ['individual'],
        categories: ['overall'],
        timeFrames: ['week']
      },
      
      // Medium priority - common combinations
      {
        priority: 'medium',
        scope: 'global',
        entityTypes: ['organization'],
        categories: ['overall', 'environmental', 'social'],
        timeFrames: ['week', 'month']
      },
      {
        priority: 'medium',
        scope: 'regional',
        entityTypes: ['individual', 'organization'],
        categories: ['environmental', 'social'],
        timeFrames: ['week']
      },
      
      // Low priority - less common combinations
      {
        priority: 'low',
        scope: 'local',
        entityTypes: ['individual', 'organization'],
        categories: ['governance', 'activity'],
        timeFrames: ['day', 'week']
      }
    ];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let precomputeServiceInstance: PrecomputeService | null = null;

export function getPrecomputeService(config?: Partial<PrecomputeConfig>): PrecomputeService {
  if (!precomputeServiceInstance) {
    precomputeServiceInstance = new PrecomputeService(config);
  }
  return precomputeServiceInstance;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize and start the precompute service
 */
export function initializePrecomputeService(config?: Partial<PrecomputeConfig>): void {
  const service = getPrecomputeService(config);
  service.start();
  
  // Precompute popular combinations on startup
  service.precomputePopular();
}

/**
 * Stop the precompute service
 */
export function stopPrecomputeService(): void {
  if (precomputeServiceInstance) {
    precomputeServiceInstance.stop();
  }
}