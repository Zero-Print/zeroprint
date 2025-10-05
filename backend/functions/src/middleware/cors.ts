/**
 * CORS Middleware
 * Enables CORS for all routes with proper configuration
 */

import {Request, Response, NextFunction} from "express";
import cors from "cors";

const parseOriginList = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const normalizeOrigin = (value: string): string => value.replace(/\/$/, "").toLowerCase();

const defaultOrigins = [
  "https://zeroprint.in",
  "https://www.zeroprint.in",
  "https://staging.zeroprint.in",
  "https://admin.zeroprint.in",
];

const defaultLocalOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

export const isLocalhostAllowed = (): boolean => {
  const flag = (process.env.ALLOW_LOCALHOST_ORIGINS ?? "true").toLowerCase();
  return flag !== "false";
};

// Get allowed origins from environment variables and defaults
export const getAllowedOrigins = (): string[] => {
  const envOrigins = parseOriginList(process.env.ALLOWED_ORIGINS);
  const extraLocalOrigins = parseOriginList(process.env.LOCAL_DEV_ORIGINS);
  const allowLocalOrigins = isLocalhostAllowed();
  const combinedOrigins = new Set<string>([...defaultOrigins, ...envOrigins]);

  if (allowLocalOrigins) {
    [...defaultLocalOrigins, ...extraLocalOrigins].forEach((origin) => combinedOrigins.add(origin));
  } else {
    extraLocalOrigins.forEach((origin) => combinedOrigins.add(origin));
  }

  return Array.from(combinedOrigins);
};

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    const allowedOriginsSet = new Set(allowedOrigins.map(normalizeOrigin));
    const allowLocalOrigins = isLocalhostAllowed();

    // Allow requests with no origin (mobile apps, curl, etc.) in non-production scenarios
    if (!origin) {
      if (process.env.NODE_ENV === "development" || allowLocalOrigins) {
        return callback(null, true);
      }
      return callback(new Error("Origin header required in production"), false);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    // Check if origin is allowed
    if (allowedOriginsSet.has(normalizedOrigin)) {
      return callback(null, true);
    }

    // Log blocked origins for security monitoring
    console.warn("CORS blocked origin:", {
      origin,
      allowedOrigins,
      timestamp: new Date().toISOString(),
    });

    callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Request-ID",
    "X-Requested-With",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: [
    "X-Request-ID",
    "X-Total-Count",
    "X-Page-Count",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false,
};

// CORS middleware
export const corsMiddleware = cors(corsOptions);

// Preflight handler
export const handlePreflight = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
};