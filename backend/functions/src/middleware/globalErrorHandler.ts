/**
 * Global Error Handler
 * Captures and logs all unhandled errors
 */

import {Request, Response, NextFunction} from "express";
import {loggingService} from "../services/loggingService";
import {ApiResponse} from "../lib/apiResponse";

// Error types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  context?: any;
}

// Create custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public context?: any;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string, context?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export function globalErrorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error asynchronously
  setImmediate(async () => {
    try {
      const userId = req.user?.uid;
      const severity = determineSeverity(error);

      await loggingService.logError(
        "http",
        error.code || error.name || "UnknownError",
        error.message,
        error.stack,
        userId,
        severity,
        {
          url: req.url,
          method: req.method,
          userAgent: req.get("User-Agent"),
          ip: req.ip,
          context: error.context,
        }
      );
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  });

  // Determine response status code
  const statusCode = error.statusCode || 500;

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment ? error.message : "Internal server error";

  // Send error response
  res.status(statusCode).json(ApiResponse.error(
    message,
    error.code || "INTERNAL_ERROR"
  ));
}

// Determine error severity based on status code and error type
function determineSeverity(error: AppError): "low" | "medium" | "high" | "critical" {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    return "critical";
  } else if (statusCode >= 400) {
    return "high";
  } else if (statusCode >= 300) {
    return "medium";
  } else {
    return "low";
  }
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Handle unhandled promise rejections
export function handleUnhandledRejection() {
  process.on("unhandledRejection", async (reason: any, promise: Promise<any>) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);

    try {
      await loggingService.logError(
        "process",
        "UnhandledRejection",
        reason?.message || "Unhandled promise rejection",
        reason?.stack,
        undefined,
        "critical",
        {reason: reason?.toString(), promise: promise.toString()}
      );
    } catch (logError) {
      console.error("Failed to log unhandled rejection:", logError);
    }
  });
}

// Handle uncaught exceptions
export function handleUncaughtException() {
  process.on("uncaughtException", async (error: Error) => {
    console.error("Uncaught Exception:", error);

    try {
      await loggingService.logError(
        "process",
        "UncaughtException",
        error.message,
        error.stack,
        undefined,
        "critical",
        {name: error.name}
      );
    } catch (logError) {
      console.error("Failed to log uncaught exception:", logError);
    }

    // Exit process after logging
    process.exit(1);
  });
}

// Validation error handler
export function handleValidationError(error: any): CustomError {
  const message = error.details?.map((detail: any) => detail.message).join(", ") || "Validation error";
  return new CustomError(message, 400, true, "VALIDATION_ERROR", error.details);
}

// Database error handler
export function handleDatabaseError(error: any): CustomError {
  let message = "Database error";
  let statusCode = 500;

  if (error.code === "P2002") {
    message = "Duplicate entry";
    statusCode = 409;
  } else if (error.code === "P2025") {
    message = "Record not found";
    statusCode = 404;
  }

  return new CustomError(message, statusCode, true, "DATABASE_ERROR", {originalError: error.message});
}

// Authentication error handler
export function handleAuthError(message: string = "Authentication failed"): CustomError {
  return new CustomError(message, 401, true, "AUTH_ERROR");
}

// Authorization error handler
export function handleAuthorizationError(message: string = "Insufficient permissions"): CustomError {
  return new CustomError(message, 403, true, "AUTHORIZATION_ERROR");
}

// Not found error handler
export function handleNotFoundError(resource: string = "Resource"): CustomError {
  return new CustomError(`${resource} not found`, 404, true, "NOT_FOUND_ERROR");
}

// Rate limit error handler
export function handleRateLimitError(message: string = "Rate limit exceeded"): CustomError {
  return new CustomError(message, 429, true, "RATE_LIMIT_ERROR");
}

// Initialize error handlers
export function initializeErrorHandlers() {
  handleUnhandledRejection();
  handleUncaughtException();
}
