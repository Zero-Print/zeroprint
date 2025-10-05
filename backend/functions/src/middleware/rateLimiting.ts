/**
 * Rate Limiting Middleware
 * Implements comprehensive rate limiting for API protection
 */

import {Request, Response, NextFunction} from "express";

// Rate limit configurations
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

// Default rate limit configurations
const defaultConfig: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === "true",
  skipFailedRequests: false,
  message: "Too many requests, please try again later.",
};

// Rate limit configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Authentication endpoints - stricter limits
  "/api/auth": {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    message: "Too many authentication attempts, please try again later.",
  },

  // Payment endpoints - very strict limits
  "/api/subscriptions": {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    message: "Too many payment requests, please try again later.",
  },

  // Game completion endpoints - moderate limits
  "/api/games": {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    message: "Too many game requests, please slow down.",
  },

  // Coin earning endpoints - strict limits
  "/api/earnCoins": {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    message: "Too many coin earning requests, please slow down.",
  },

  // Webhook endpoints - very strict limits
  "/api/webhooks": {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    message: "Too many webhook requests.",
  },

  // Admin endpoints - moderate limits
  "/api/admin": {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    message: "Too many admin requests, please slow down.",
  },

  // Default for all other endpoints
  "default": defaultConfig,
};

// In-memory store for rate limiting (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// Key generator function
const generateKey = (req: Request): string => {
  // Use IP address as primary key
  const ip = req.ip || req.connection.remoteAddress || "unknown";

  // Add user ID if authenticated
  const userId = (req as any).user?.uid;
  if (userId) {
    return `${ip}:${userId}`;
  }

  return ip;
};

// Get rate limit configuration for endpoint
const getRateLimitConfig = (path: string): RateLimitConfig => {
  // Find matching configuration
  for (const [endpoint, config] of Object.entries(rateLimitConfigs)) {
    if (path.startsWith(endpoint)) {
      return {...defaultConfig, ...config};
    }
  }

  return defaultConfig;
};

// Rate limiting middleware
export const rateLimitingMiddleware = (customConfig?: Partial<RateLimitConfig>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = {...defaultConfig, ...getRateLimitConfig(req.path), ...customConfig};
      const key = (config.keyGenerator || generateKey)(req);
      const now = Date.now();

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);

      if (!entry || entry.resetTime < now) {
        // Create new entry
        entry = {
          count: 0,
          resetTime: now + config.windowMs,
          blocked: false,
        };
        rateLimitStore.set(key, entry);
      }

      // Check if user is blocked
      if (entry.blocked && entry.resetTime > now) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        res.setHeader("Retry-After", retryAfter.toString());
        res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", entry.resetTime.toString());

        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded",
          message: config.message,
          retryAfter: retryAfter,
        });
      }

      // Increment request count
      entry.count++;

      // Check if limit exceeded
      if (entry.count > config.maxRequests) {
        entry.blocked = true;
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        res.setHeader("Retry-After", retryAfter.toString());
        res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", entry.resetTime.toString());

        // Log rate limit violation
        console.warn("Rate limit exceeded:", {
          key,
          path: req.path,
          method: req.method,
          count: entry.count,
          limit: config.maxRequests,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          timestamp: new Date().toISOString(),
        });

        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded",
          message: config.message,
          retryAfter: retryAfter,
        });
      }

      // Add rate limit headers
      const remaining = Math.max(0, config.maxRequests - entry.count);
      const resetTime = Math.ceil(entry.resetTime / 1000);

      res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", resetTime.toString());

      // Override res.end to handle successful/failed requests
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any, cb?: any) {
        const statusCode = res.statusCode;

        // Update count based on success/failure
        if (config.skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) {
          entry!.count = Math.max(0, entry!.count - 1);
        } else if (config.skipFailedRequests && statusCode >= 400) {
          entry!.count = Math.max(0, entry!.count - 1);
        }

        return originalEnd.call(this, chunk, encoding, cb);
      };

      return next();
    } catch (error) {
      console.error("Rate limiting middleware error:", error);
      return next();
    }
  };
};

// Specific rate limiting middlewares
export const authRateLimit = rateLimitingMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many authentication attempts, please try again later.",
});

export const paymentRateLimit = rateLimitingMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: "Too many payment requests, please try again later.",
});

export const gameRateLimit = rateLimitingMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: "Too many game requests, please slow down.",
});

export const coinRateLimit = rateLimitingMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: "Too many coin earning requests, please slow down.",
});

export const webhookRateLimit = rateLimitingMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50,
  message: "Too many webhook requests.",
});

// IP-based rate limiting for suspicious IPs
export const suspiciousIPRateLimit = rateLimitingMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: "IP temporarily blocked due to suspicious activity.",
});

// Rate limit bypass for trusted IPs (admin, monitoring)
const trustedIPs = [
  "127.0.0.1",
  "::1",
  "localhost",
];

export const bypassRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || "";

  if (trustedIPs.includes(ip) || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    // Skip rate limiting for trusted IPs
    return next();
  } else {
    // Apply normal rate limiting
    return rateLimitingMiddleware()(req, res, next);
  }
};

// Export rate limiting utilities
export const rateLimiting = {
  middleware: rateLimitingMiddleware,
  auth: authRateLimit,
  payment: paymentRateLimit,
  game: gameRateLimit,
  coin: coinRateLimit,
  webhook: webhookRateLimit,
  suspiciousIP: suspiciousIPRateLimit,
  bypass: bypassRateLimit,
  configs: rateLimitConfigs,
};
