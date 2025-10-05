import * as Sentry from "@sentry/node";
import {ProfilingIntegration} from "@sentry/profiling-node";
import {LoggingService} from "./loggingService";

export class BackendSentryService {
  private loggingService = new LoggingService();
  private initialized = false;

  init(): void {
    if (this.initialized) return;

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      integrations: [
        new ProfilingIntegration(),
        Sentry.httpIntegration(),
        Sentry.dedupeIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      beforeSend: (event) => {
        // Filter out non-critical errors in production
        if (process.env.NODE_ENV === "production") {
          if (event.level === "info" || event.level === "debug") {
            return null;
          }
        }
        return event;
      },
    });

    this.initialized = true;
  }

  async captureError(
    error: Error,
    context?: {
      userId?: string;
      endpoint?: string;
      requestId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    const eventId = Sentry.captureException(error, {
      user: context?.userId ? {id: context.userId} : undefined,
      tags: {
        endpoint: context?.endpoint,
        requestId: context?.requestId,
      },
      extra: context?.metadata,
    });

    // Log to our internal error logging system
    try {
      await this.loggingService.logError({
        service: "backend",
        environment: process.env.NODE_ENV || "development",
        errorType: "runtime",
        message: error.message,
        stack: error.stack || "",
        userId: context?.userId,
        endpoint: context?.endpoint,
        requestId: context?.requestId,
        metadata: {
          ...context?.metadata,
          sentryEventId: eventId,
        },
      });
    } catch (loggingError) {
      console.error("Failed to log error to internal system:", loggingError);
    }

    return eventId;
  }

  async captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: {
      userId?: string;
      endpoint?: string;
      requestId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    const eventId = Sentry.captureMessage(message, {
      level,
      user: context?.userId ? {id: context.userId} : undefined,
      tags: {
        endpoint: context?.endpoint,
        requestId: context?.requestId,
      },
      extra: context?.metadata,
    });

    return eventId;
  }

  setUser(userId: string, email?: string): void {
    Sentry.setUser({
      id: userId,
      email,
    });
  }

  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  setContext(key: string, context: Record<string, any>): void {
    Sentry.setContext(key, context);
  }

  async flush(timeout: number = 2000): Promise<boolean> {
    return Sentry.flush(timeout);
  }
}

export const backendSentry = new BackendSentryService();
