import {Request, Response, NextFunction} from "express";
import {backendSentry} from "../lib/sentry";
import {LoggingService} from "../lib/loggingService";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class ErrorHandler {
  private loggingService = new LoggingService();

  handleError = async (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const statusCode = error.statusCode || 500;
    const isOperational = error.isOperational || false;
    const requestId = req.headers["x-request-id"] as string || "unknown";
    const userId = (req as any).user?.uid;
    const endpoint = `${req.method} ${req.path}`;

    // Set Sentry context
    if (userId) {
      backendSentry.setUser(userId);
    }
    backendSentry.setTag("endpoint", endpoint);
    backendSentry.setTag("requestId", requestId);
    backendSentry.setContext("request", {
      method: req.method,
      url: req.url,
      headers: this.sanitizeHeaders(req.headers),
      body: this.sanitizeBody(req.body),
      query: req.query,
      params: req.params,
    });

    // Capture error in Sentry
    const sentryEventId = await backendSentry.captureError(error, {
      userId,
      endpoint,
      requestId,
      metadata: {
        statusCode,
        isOperational,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      },
    });

    // Send critical errors to Slack/Discord
    if (statusCode >= 500 && process.env.NODE_ENV === "production") {
      try {
        await this.loggingService.logError({
          service: "backend",
          environment: process.env.NODE_ENV || "development",
          errorType: "runtime",
          message: error.message,
          stack: error.stack,
          endpoint,
          userId,
          userAgent: req.get("User-Agent"),
          metadata: {
            requestId,
            sentryEventId,
            ip: req.ip,
          },
        });
      } catch (notificationError) {
        console.error("Failed to send error notification:", notificationError);
      }
    }

    // Log error details
    console.error("Error handled:", {
      message: error.message,
      stack: error.stack,
      statusCode,
      endpoint,
      userId,
      requestId,
      sentryEventId,
    });

    // Send response
    const errorResponse = {
      success: false,
      error: {
        message: isOperational ? error.message : "Internal server error",
        code: error.code,
        requestId,
        ...(process.env.NODE_ENV === "development" && {
          stack: error.stack,
          sentryEventId,
        }),
      },
    };

    res.status(statusCode).json(errorResponse);
  };

  private sanitizeHeaders(headers: any): Record<string, any> {
    const sanitized = {...headers};

    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized["x-api-key"];

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== "object") {
      return body;
    }

    const sanitized = {...body};

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;

    return sanitized;
  }

  createError(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.code = code;
    error.isOperational = isOperational;
    return error;
  }
}

export const errorHandler = new ErrorHandler();

// Express error handling middleware
export const expressErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  errorHandler.handleError(error, req, res, next);
};

// Async wrapper for route handlers
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
