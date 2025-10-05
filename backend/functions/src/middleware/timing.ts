/**
 * Timing Middleware
 * Records performance metrics for all HTTP requests
 */

import {Request, Response, NextFunction} from "express";
import {loggingService} from "../services/loggingService";

// Performance tracking interface
interface PerformanceData {
  startTime: number;
  route: string;
  method: string;
  userId?: string;
}

// Extend Request interface to include performance data
declare global {
  namespace Express {
    interface Request {
      performanceData?: PerformanceData;
    }
  }
}

// Timing middleware
export function timingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Record start time
    const startTime = Date.now();
    const route = req.route?.path || req.path;
    const method = req.method;
    const userId = req.user?.uid;

    // Store performance data in request
    req.performanceData = {
      startTime,
      route,
      method,
      userId,
    };

    // Override res.end to capture response time
    const originalEnd = res.end.bind(res);
    (res as any).end = function(chunk?: any, encoding?: any, cb?: any): any {
      const endTime = Date.now();
      const latency = endTime - startTime;

      // Record performance metric asynchronously
      setImmediate(async () => {
        try {
          await loggingService.recordPerformance(
            route,
            method,
            latency,
            res.statusCode,
            userId,
            process.memoryUsage?.()?.heapUsed,
            process.cpuUsage?.()?.user
          );
        } catch (error) {
          console.error("Error recording performance metric:", error);
        }
      });

      // Call original end method
      if (cb) {
        originalEnd.call(this, chunk, encoding, cb);
      } else if (encoding) {
        originalEnd.call(this, chunk, encoding);
      } else if (chunk) {
        (originalEnd as any).call(this, chunk);
      } else {
        (originalEnd as any).call(this);
      }
    };

    next();
  };
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  // Record a custom metric
  static recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const values = this.metrics.get(key)!;
    values.push(value);

    // Keep only last 1000 values to prevent memory leaks
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
  }

  // Get percentile for a metric
  static getPercentile(key: string, percentile: number): number {
    const values = this.metrics.get(key);
    if (!values || values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  // Get average for a metric
  static getAverage(key: string): number {
    const values = this.metrics.get(key);
    if (!values || values.length === 0) return 0;

    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Get all metrics
  static getAllMetrics(): Record<string, { avg: number; p95: number; p99: number; count: number }> {
    const result: Record<string, { avg: number; p95: number; p99: number; count: number }> = {};

    for (const [key, values] of this.metrics.entries()) {
      if (values.length > 0) {
        result[key] = {
          avg: this.getAverage(key),
          p95: this.getPercentile(key, 95),
          p99: this.getPercentile(key, 99),
          count: values.length,
        };
      }
    }

    return result;
  }

  // Clear metrics
  static clearMetrics(): void {
    this.metrics.clear();
  }

  // Clear specific metric
  static clearMetric(key: string): void {
    this.metrics.delete(key);
  }
}

// Database operation timing decorator
export function timedOperation(operationName: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const startTime = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        PerformanceMonitor.recordMetric(`db_${operationName}`, duration);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        PerformanceMonitor.recordMetric(`db_${operationName}_error`, duration);
        throw error;
      }
    };
  };
}

// API call timing decorator
export function timedApiCall(apiName: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const startTime = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        PerformanceMonitor.recordMetric(`api_${apiName}`, duration);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        PerformanceMonitor.recordMetric(`api_${apiName}_error`, duration);
        throw error;
      }
    };
  };
}

// Memory usage monitoring
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  } {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    rss: Math.round(usage.rss / 1024 / 1024), // MB
  };
}

// CPU usage monitoring
export function getCpuUsage(): {
  user: number;
  system: number;
  } {
  const usage = process.cpuUsage();
  return {
    user: Math.round(usage.user / 1000), // microseconds to milliseconds
    system: Math.round(usage.system / 1000), // microseconds to milliseconds
  };
}

// System health check
export function getSystemHealth(): {
  memory: ReturnType<typeof getMemoryUsage>;
  cpu: ReturnType<typeof getCpuUsage>;
  uptime: number;
  performance: ReturnType<typeof PerformanceMonitor.getAllMetrics>;
  } {
  return {
    memory: getMemoryUsage(),
    cpu: getCpuUsage(),
    uptime: Math.round(process.uptime()),
    performance: PerformanceMonitor.getAllMetrics(),
  };
}
