/**
 * Security Headers Middleware
 * Implements comprehensive security headers for API protection
 */

import {Request, Response, NextFunction} from "express";
import {getAllowedOrigins, isLocalhostAllowed} from "./cors";

const normalizeOrigin = (value: string): string => value.replace(/\/$/, "").toLowerCase();

// Security headers configuration
const securityHeaders = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent clickjacking attacks
  "X-Frame-Options": "DENY",

  // XSS protection
  "X-XSS-Protection": "1; mode=block",

  // Strict Transport Security (HTTPS only)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://* http://127.0.0.1:5000 http://localhost:5000 ws://127.0.0.1:5000 ws://localhost:5000",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; "),

  // Permissions Policy (formerly Feature Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=(self)",
    "payment=(self)",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", "),

  // Cross-Origin policies
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",

  // Additional security headers
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Permitted-Cross-Domain-Policies": "none",

  // Cache control for sensitive endpoints
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

// Environment-specific security headers
const getEnvironmentHeaders = (nodeEnv: string) => {
  const headers = {...securityHeaders};

  if (nodeEnv === "development") {
    // Relax some headers for development
    headers["Strict-Transport-Security"] = "max-age=0";
    headers["Content-Security-Policy"] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://* http://* ws://*",
      "frame-ancestors 'self'",
      "base-uri 'self'",
    ].join("; ");
  }

  return headers;
};

// Rate limiting headers
export const addRateLimitHeaders = (res: Response, remaining: number, resetTime: number) => {
  res.setHeader("X-RateLimit-Limit", "100");
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", resetTime.toString());
};

// Security headers middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const nodeEnv = process.env.NODE_ENV || "development";
    const headers = getEnvironmentHeaders(nodeEnv);

    // Apply all security headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Add request ID for tracking
    const requestId = req.headers["x-request-id"] || generateRequestId();
    res.setHeader("X-Request-ID", requestId as string);

    // Ensure downstream caches respect origin checks
    res.setHeader("Vary", "Origin");

    // Add CORS headers for API endpoints
    if (req.path.startsWith("/api")) {
      const origin = req.headers.origin;
      const allowLocalOrigins = isLocalhostAllowed();
      const allowedOrigins = getAllowedOrigins();
      const allowedOriginSet = new Set(allowedOrigins.map(normalizeOrigin));

      if (origin && allowedOriginSet.has(normalizeOrigin(origin))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      } else if (!origin && (nodeEnv === "development" || allowLocalOrigins)) {
        res.setHeader("Access-Control-Allow-Origin", "*");
      } else if (origin && (nodeEnv === "development" || allowLocalOrigins)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }

      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Max-Age", "86400");
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return next();
  } catch (error) {
    console.error("Security headers middleware error:", error);
    return next();
  }
};

// HTTPS redirect middleware
export const httpsRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "production" && req.header("x-forwarded-proto") !== "https") {
    const httpsUrl = `https://${req.header("host")}${req.url}`;
    return res.redirect(301, httpsUrl);
  }
  next();
};

// Request ID generator
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Security audit middleware
export const securityAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /onload=/i, // Event handler injection
  ];

  const requestString = `${req.method} ${req.url} ${JSON.stringify(req.body)}`;
  const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(requestString));

  if (isSuspicious) {
    console.warn("Suspicious request detected:", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      method: req.method,
      url: req.url,
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    // Add security warning header
    res.setHeader("X-Security-Warning", "Suspicious request pattern detected");
  }

  // Override res.end to log response times
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - startTime;
    res.setHeader("X-Response-Time", `${responseTime}ms`);

    // Log slow requests
    if (responseTime > 5000) {
      console.warn("Slow request detected:", {
        method: req.method,
        url: req.url,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Export security middleware collection
export const securityMiddleware = {
  securityHeaders: securityHeadersMiddleware,
  httpsRedirect: httpsRedirectMiddleware,
  audit: securityAuditMiddleware,
  addRateLimitHeaders,
};