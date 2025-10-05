/**
 * Comprehensive Leaderboard Engine
 * Handles ranking algorithms, data models, and caching for different entity types
 */

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export type EntityType = 'citizen' | 'school' | 'msme' | 'ward' | 'district' | 'government';
export type LeaderboardScope = 'global' | 'ward' | 'district' | 'regional' | 'national';
export type MetricCategory = 'overall' | 'environmental' | 'social' | 'governance' | 'carbon' | 'wellness' | 'animal_welfare';
export type LeaderboardCategory = MetricCategory; // Alias for MetricCategory
export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';

export interface BaseEntity {
  id: string;
  name: string;
  entityType: EntityType;
  avatar?: string;
  location: {
    wardId: string;
    wardName: string;
    districtId: string;
    districtName: string;
    state: string;
    country: string;
  };
  joinedDate: Date;
  isActive: boolean;
}

export interface EntityMetrics {
  // Environmental Metrics
  carbonSaved: number; // kg CO2
  energyEfficiency: number; // percentage
  wasteReduction: number; // kg
  waterConservation: number; // liters
  renewableEnergyUsage: number; // percentage
  
  // Social Metrics
  wellnessScore: number; // 0-100
  communityEngagement: number; // participation score
  diversityIndex: number; // 0-100
  activityScore?: number; // Activity participation score
  employeeSatisfaction?: number; // for MSMEs
  studentWellbeing?: number; // for schools
  
  // Governance Metrics
  transparencyScore: number; // 0-100
  complianceRate: number; // percentage
  ethicalPractices: number; // 0-100
  
  // Activity Metrics
  totalPoints: number;
  streakDays: number;
  activitiesCompleted: number;
  challengesWon: number;
  
  // Specific Metrics
  animalSightings?: number;
  sustainableTrips?: number;
  healCoinsEarned: number;
  
  // Calculated Scores
  esgScore: number; // 0-100
  overallScore: number; // weighted composite
  activityScore?: number; // Activity-based score
}

export interface LeaderboardEntry extends BaseEntity {
  metrics: EntityMetrics;
  rank: number;
  previousRank?: number;
  rankChange: number; // positive = moved up, negative = moved down
  percentile: number; // 0-100
  badge: string;
  achievements: string[];
  lastUpdated: Date;
  score?: number; // Overall score for compatibility
  displayName?: string; // Alias for name
  category?: string; // Entry category
  change?: number; // Alias for rankChange
  name: string; // Required name property
}

export interface LeaderboardFilter {
  scope: LeaderboardScope;
  entityTypes: EntityType[];
  metricCategory: MetricCategory;
  timeFrame: TimeFrame;
  wardId?: string;
  districtId?: string;
  minScore?: number;
  maxEntries?: number;
}

export interface RankingWeights {
  environmental: number;
  social: number;
  governance: number;
  activity: number;
  consistency: number; // streak bonus
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  totalEntries: number;
  scope: LeaderboardScope;
  category: MetricCategory;
  timeFrame: TimeFrame;
  lastUpdated: Date;
  nextUpdate: Date;
  metadata: {
    averageScore: number;
    topScore: number;
    participationRate: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
}

// ============================================================================
// LEADERBOARD ENGINE CLASS
// ============================================================================

export class LeaderboardEngine {
  private static instance: LeaderboardEngine;
  private cache: Map<string, LeaderboardResult> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): LeaderboardEngine {
    if (!LeaderboardEngine.instance) {
      LeaderboardEngine.instance = new LeaderboardEngine();
    }
    return LeaderboardEngine.instance;
  }

  // ============================================================================
  // RANKING ALGORITHMS
  // ============================================================================

  /**
   * Calculate overall score using weighted metrics
   */
  private calculateOverallScore(metrics: EntityMetrics, weights: RankingWeights): number {
    const environmentalScore = this.calculateEnvironmentalScore(metrics);
    const socialScore = this.calculateSocialScore(metrics);
    const governanceScore = this.calculateGovernanceScore(metrics);
    const activityScore = this.calculateActivityScore(metrics);
    const consistencyBonus = this.calculateConsistencyBonus(metrics.streakDays);

    return (
      environmentalScore * weights.environmental +
      socialScore * weights.social +
      governanceScore * weights.governance +
      activityScore * weights.activity +
      consistencyBonus * weights.consistency
    );
  }

  private calculateEnvironmentalScore(metrics: EntityMetrics): number {
    const carbonScore = Math.min(metrics.carbonSaved / 100, 1) * 25; // Max 25 points
    const energyScore = metrics.energyEfficiency * 0.25; // Max 25 points
    const wasteScore = Math.min(metrics.wasteReduction / 50, 1) * 25; // Max 25 points
    const waterScore = Math.min(metrics.waterConservation / 1000, 1) * 25; // Max 25 points
    
    return carbonScore + energyScore + wasteScore + waterScore;
  }

  private calculateSocialScore(metrics: EntityMetrics): number {
    const wellnessScore = metrics.wellnessScore * 0.4; // Max 40 points
    const engagementScore = metrics.communityEngagement * 0.3; // Max 30 points
    const diversityScore = metrics.diversityIndex * 0.3; // Max 30 points
    
    return wellnessScore + engagementScore + diversityScore;
  }

  private calculateGovernanceScore(metrics: EntityMetrics): number {
    const transparencyScore = metrics.transparencyScore * 0.4; // Max 40 points
    const complianceScore = metrics.complianceRate * 0.3; // Max 30 points
    const ethicsScore = metrics.ethicalPractices * 0.3; // Max 30 points
    
    return transparencyScore + complianceScore + ethicsScore;
  }

  private calculateActivityScore(metrics: EntityMetrics): number {
    const pointsScore = Math.min(metrics.totalPoints / 1000, 1) * 40; // Max 40 points
    const challengesScore = Math.min(metrics.challengesWon * 5, 30); // Max 30 points
    const activitiesScore = Math.min(metrics.activitiesCompleted * 2, 30); // Max 30 points
    
    return pointsScore + challengesScore + activitiesScore;
  }

  private calculateConsistencyBonus(streakDays: number): number {
    if (streakDays >= 30) return 20; // 30+ days = 20 bonus points
    if (streakDays >= 14) return 15; // 14+ days = 15 bonus points
    if (streakDays >= 7) return 10;  // 7+ days = 10 bonus points
    if (streakDays >= 3) return 5;   // 3+ days = 5 bonus points
    return 0;
  }

  /**
   * Get default ranking weights for different entity types
   */
  private getDefaultWeights(entityType: EntityType): RankingWeights {
    switch (entityType) {
      case 'school':
        return {
          environmental: 0.3,
          social: 0.4, // Higher weight on social for schools
          governance: 0.2,
          activity: 0.05,
          consistency: 0.05
        };
      case 'msme':
        return {
          environmental: 0.35,
          social: 0.25,
          governance: 0.3, // Higher weight on governance for businesses
          activity: 0.05,
          consistency: 0.05
        };
      case 'citizen':
        return {
          environmental: 0.25,
          social: 0.25,
          governance: 0.15,
          activity: 0.25, // Higher weight on activity for citizens
          consistency: 0.1
        };
      default:
        return {
          environmental: 0.3,
          social: 0.3,
          governance: 0.25,
          activity: 0.1,
          consistency: 0.05
        };
    }
  }

  // ============================================================================
  // LEADERBOARD GENERATION
  // ============================================================================

  /**
   * Generate leaderboard based on filters
   */
  public async generateLeaderboard(filter: LeaderboardFilter): Promise<LeaderboardResult> {
    const cacheKey = this.getCacheKey(filter);
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    // Generate new leaderboard
    const entities = await this.fetchEntities(filter);
    const rankedEntries = this.rankEntities(entities, filter);
    
    const result: LeaderboardResult = {
      entries: rankedEntries,
      totalEntries: rankedEntries.length,
      scope: filter.scope,
      category: filter.metricCategory,
      timeFrame: filter.timeFrame,
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + this.CACHE_DURATION),
      metadata: this.calculateMetadata(rankedEntries)
    };

    // Cache the result
    this.cache.set(cacheKey, result);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

    return result;
  }

  /**
   * Rank entities based on selected metric category
   */
  private rankEntities(entities: LeaderboardEntry[], filter: LeaderboardFilter): LeaderboardEntry[] {
    const sortedEntities = [...entities].sort((a, b) => {
      const scoreA = this.getMetricValue(a, filter.metricCategory);
      const scoreB = this.getMetricValue(b, filter.metricCategory);
      return scoreB - scoreA; // Descending order
    });

    // Assign ranks and calculate changes
    return sortedEntities.map((entity, index) => {
      const rank = index + 1;
      const rankChange = entity.previousRank ? entity.previousRank - rank : 0;
      const percentile = ((sortedEntities.length - index) / sortedEntities.length) * 100;

      return {
        ...entity,
        rank,
        rankChange,
        percentile,
        badge: this.assignBadge(rank, percentile, entity.metrics),
        lastUpdated: new Date()
      };
    });
  }

  /**
   * Get metric value based on category
   */
  private getMetricValue(entity: LeaderboardEntry, category: MetricCategory): number {
    const metrics = entity.metrics;
    
    switch (category) {
      case 'overall':
        return metrics.overallScore;
      case 'environmental':
        return this.calculateEnvironmentalScore(metrics);
      case 'social':
        return this.calculateSocialScore(metrics);
      case 'governance':
        return this.calculateGovernanceScore(metrics);
      case 'carbon':
        return metrics.carbonSaved;
      case 'wellness':
        return metrics.wellnessScore;
      case 'animal_welfare':
        return metrics.animalSightings || 0;
      default:
        return metrics.totalPoints;
    }
  }

  /**
   * Assign badge based on performance
   */
  private assignBadge(rank: number, percentile: number, metrics: EntityMetrics): string {
    if (rank === 1) return '🏆 Champion';
    if (rank <= 3) return '🥇 Elite Performer';
    if (rank <= 10) return '🌟 Top Performer';
    if (percentile >= 90) return '⭐ High Achiever';
    if (percentile >= 75) return '🎯 Strong Performer';
    if (percentile >= 50) return '📈 Rising Star';
    if (metrics.streakDays >= 30) return '🔥 Consistency Master';
    if (metrics.streakDays >= 7) return '💪 Dedicated';
    return '🌱 Growing';
  }

  // ============================================================================
  // DATA FETCHING & CACHING
  // ============================================================================

  /**
   * Fetch entities based on filter (mock implementation)
   */
  private async fetchEntities(filter: LeaderboardFilter): Promise<LeaderboardEntry[]> {
    // This would typically fetch from API/database
    // For now, return mock data
    return this.generateMockData(filter);
  }

  /**
   * Generate mock data for testing
   */
  private generateMockData(filter: LeaderboardFilter): LeaderboardEntry[] {
    const mockEntities: LeaderboardEntry[] = [];
    const entityCount = Math.min(filter.maxEntries || 100, 100);

    for (let i = 0; i < entityCount; i++) {
      const entityType = filter.entityTypes[i % filter.entityTypes.length];
      const entity: LeaderboardEntry = {
        id: `entity-${i + 1}`,
        name: this.generateEntityName(entityType, i),
        entityType,
        location: {
          wardId: `ward-${(i % 5) + 1}`,
          wardName: `Ward ${(i % 5) + 1}`,
          districtId: 'district-1',
          districtName: 'Central District',
          state: 'Delhi',
          country: 'India'
        },
        joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        isActive: Math.random() > 0.1,
        metrics: this.generateMockMetrics(entityType),
        rank: 0, // Will be calculated
        rankChange: Math.floor(Math.random() * 10) - 5,
        percentile: 0, // Will be calculated
        badge: '',
        achievements: this.generateMockAchievements(),
        lastUpdated: new Date()
      };

      // Calculate overall score
      const weights = this.getDefaultWeights(entityType);
      entity.metrics.overallScore = this.calculateOverallScore(entity.metrics, weights);

      mockEntities.push(entity);
    }

    return mockEntities;
  }

  private generateEntityName(entityType: EntityType, index: number): string {
    const names = {
      citizen: ['EcoWarrior', 'GreenCommuter', 'NatureExplorer', 'MindfulLiving', 'SustainableLife'],
      school: ['Green Valley School', 'Eco Academy', 'Sustainable Learning Center', 'Nature School', 'Future Leaders Academy'],
      msme: ['EcoTech Solutions', 'Green Manufacturing Co.', 'Sustainable Services Ltd.', 'Clean Energy Corp.', 'Eco-Friendly Products'],
      ward: ['North Ward', 'South Ward', 'East Ward', 'West Ward', 'Central Ward'],
      district: ['Central District', 'Northern District', 'Southern District'],
      government: ['Municipal Corporation', 'District Administration', 'State Government']
    };
    
    const nameList = names[entityType] || names.citizen;
    return `${nameList[index % nameList.length]} ${index + 1}`;
  }

  private generateMockMetrics(entityType: EntityType): EntityMetrics {
    const base = {
      carbonSaved: Math.random() * 200,
      energyEfficiency: Math.random() * 100,
      wasteReduction: Math.random() * 100,
      waterConservation: Math.random() * 2000,
      renewableEnergyUsage: Math.random() * 100,
      wellnessScore: Math.random() * 100,
      communityEngagement: Math.random() * 100,
      diversityIndex: Math.random() * 100,
      transparencyScore: Math.random() * 100,
      complianceRate: Math.random() * 100,
      ethicalPractices: Math.random() * 100,
      totalPoints: Math.random() * 5000,
      streakDays: Math.floor(Math.random() * 60),
      activitiesCompleted: Math.floor(Math.random() * 100),
      challengesWon: Math.floor(Math.random() * 20),
      healCoinsEarned: Math.random() * 1000,
      esgScore: Math.random() * 100,
      overallScore: 0 // Will be calculated
    };

    // Add entity-specific metrics
    if (entityType === 'school') {
      base.studentWellbeing = Math.random() * 100;
    } else if (entityType === 'msme') {
      base.employeeSatisfaction = Math.random() * 100;
    } else if (entityType === 'citizen') {
      base.animalSightings = Math.floor(Math.random() * 50);
      base.sustainableTrips = Math.floor(Math.random() * 100);
    }

    return base;
  }

  private generateMockAchievements(): string[] {
    const achievements = [
      'Carbon Saver', 'Wellness Champion', 'Community Leader', 'Eco Innovator',
      'Sustainability Expert', 'Green Warrior', 'Environmental Steward'
    ];
    
    const count = Math.floor(Math.random() * 4) + 1;
    return achievements.slice(0, count);
  }

  private calculateMetadata(entries: LeaderboardEntry[]) {
    const scores = entries.map(e => e.metrics.overallScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const topScore = Math.max(...scores);
    
    return {
      averageScore,
      topScore,
      participationRate: entries.filter(e => e.isActive).length / entries.length * 100,
      trendDirection: 'up' as const // Would be calculated based on historical data
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getCacheKey(filter: LeaderboardFilter): string {
    return `${filter.scope}-${filter.entityTypes.join(',')}-${filter.metricCategory}-${filter.timeFrame}-${filter.wardId || 'all'}-${filter.districtId || 'all'}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  public getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createLeaderboardFilter = (
  scope: LeaderboardScope = 'global',
  entityTypes: EntityType[] = ['citizen', 'school', 'msme'],
  metricCategory: MetricCategory = 'overall',
  timeFrame: TimeFrame = 'monthly'
): LeaderboardFilter => ({
  scope,
  entityTypes,
  metricCategory,
  timeFrame,
  maxEntries: 100
});

export const getLeaderboardEngine = () => LeaderboardEngine.getInstance();