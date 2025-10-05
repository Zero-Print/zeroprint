/**
 * Rate Limiting Service
 * 
 * Provides rate limiting functionality for API endpoints and user actions.
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimitService {
  private static instance: RateLimitService;
  private limits: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {}

  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  /**
   * Check if a request is within rate limits
   */
  public checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): RateLimitResult {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean up expired entries
    this.cleanupExpiredEntries(windowStart);
    
    const current = this.limits.get(key);
    
    if (!current || current.resetTime <= now) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      };
    }
    
    // Increment count
    current.count++;
    this.limits.set(key, current);
    
    return {
      allowed: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  /**
   * Increment rate limit counter
   */
  public incrementRateLimit(key: string, config: RateLimitConfig): void {
    const now = Date.now();
    const current = this.limits.get(key);
    
    if (!current || current.resetTime <= now) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
    } else {
      current.count++;
      this.limits.set(key, current);
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  public resetRateLimit(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Get current rate limit status
   */
  public getRateLimitStatus(key: string): { count: number; resetTime: number } | null {
    const current = this.limits.get(key);
    if (!current || current.resetTime <= Date.now()) {
      return null;
    }
    return current;
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpiredEntries(windowStart: number): void {
    for (const [key, value] of this.limits.entries()) {
      if (value.resetTime <= windowStart) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  public clearAll(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimitService = RateLimitService.getInstance();

// Default rate limit configurations
export const DEFAULT_RATE_LIMITS = {
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  WALLET: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  GAME: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
} as const;
