/**
 * Tests for Timing Middleware
 */

import {Request, Response, NextFunction} from "express";
import {timingMiddleware, PerformanceMonitor} from "../../middleware/timing";
import {loggingService} from "../../services/loggingService";
import {DecodedIdToken} from "firebase-admin/auth";

// Mock logging service
jest.mock("../../services/loggingService", () => ({
  loggingService: {
    recordPerformance: jest.fn(),
  },
}));

describe("Timing Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      route: {path: "/api/test"},
      method: "GET",
      user: {
        uid: "user123",
        aud: "test-aud",
        auth_time: Date.now() / 1000,
        exp: Date.now() / 1000 + 3600,
        firebase: {identities: {}, sign_in_provider: "password"},
        iat: Date.now() / 1000,
        iss: "https://securetoken.google.com/test",
        sub: "user123",
      } as DecodedIdToken,
    };
    res = {
      statusCode: 200,
      end: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should record performance metrics on response end", async () => {
    const middleware = timingMiddleware();

    // Call middleware
    middleware(req as Request, res as Response, next);

    // Verify next was called
    expect(next).toHaveBeenCalled();

    // Verify performance data was stored
    expect(req.performanceData).toBeDefined();
    expect(req.performanceData?.route).toBe("/api/test");
    expect(req.performanceData?.method).toBe("GET");
    expect(req.performanceData?.userId).toBe("user123");

    // Simulate response end
    const originalEnd = res.end as jest.Mock;
    originalEnd.call(res);

    // Wait for async performance recording
    await new Promise((resolve) => setImmediate(resolve));

    // Verify performance was recorded
    expect(loggingService.recordPerformance).toHaveBeenCalledWith(
      "/api/test",
      "GET",
      expect.any(Number),
      200,
      "user123",
      expect.any(Number),
      expect.any(Number)
    );
  });

  it("should handle requests without user", async () => {
    req.user = undefined;
    const middleware = timingMiddleware();

    middleware(req as Request, res as Response, next);

    // Simulate response end
    const originalEnd = res.end as jest.Mock;
    originalEnd.call(res);

    await new Promise((resolve) => setImmediate(resolve));

    expect(loggingService.recordPerformance).toHaveBeenCalledWith(
      "/api/test",
      "GET",
      expect.any(Number),
      200,
      undefined,
      expect.any(Number),
      expect.any(Number)
    );
  });

  it("should handle requests without route path", async () => {
    req.route = undefined;
    // Use Object.defineProperty to set read-only property
    Object.defineProperty(req, "path", {value: "/api/fallback", writable: true});
    const middleware = timingMiddleware();

    middleware(req as Request, res as Response, next);

    // Simulate response end
    const originalEnd = res.end as jest.Mock;
    originalEnd.call(res);

    await new Promise((resolve) => setImmediate(resolve));

    expect(loggingService.recordPerformance).toHaveBeenCalledWith(
      "/api/fallback",
      "GET",
      expect.any(Number),
      200,
      "user123",
      expect.any(Number),
      expect.any(Number)
    );
  });
});

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    PerformanceMonitor.clearMetrics();
  });

  describe("recordMetric", () => {
    it("should record custom metrics", () => {
      PerformanceMonitor.recordMetric("db_query", 150);
      PerformanceMonitor.recordMetric("db_query", 200);
      PerformanceMonitor.recordMetric("db_query", 100);

      const metrics = PerformanceMonitor.getAllMetrics();
      expect(metrics.db_query).toBeDefined();
      expect(metrics.db_query.count).toBe(3);
      expect(metrics.db_query.avg).toBe(150);
    });

    it("should limit stored values to prevent memory leaks", () => {
      // Add more than 1000 values
      for (let i = 0; i < 1500; i++) {
        PerformanceMonitor.recordMetric("test_metric", i);
      }

      const metrics = PerformanceMonitor.getAllMetrics();
      expect(metrics.test_metric.count).toBe(1000);
    });
  });

  describe("getPercentile", () => {
    it("should calculate percentiles correctly", () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      values.forEach((val) => PerformanceMonitor.recordMetric("test", val));

      expect(PerformanceMonitor.getPercentile("test", 50)).toBe(50);
      expect(PerformanceMonitor.getPercentile("test", 95)).toBe(95);
      expect(PerformanceMonitor.getPercentile("test", 99)).toBe(99);
    });

    it("should return 0 for empty metrics", () => {
      expect(PerformanceMonitor.getPercentile("nonexistent", 50)).toBe(0);
    });
  });

  describe("getAverage", () => {
    it("should calculate average correctly", () => {
      PerformanceMonitor.recordMetric("test", 10);
      PerformanceMonitor.recordMetric("test", 20);
      PerformanceMonitor.recordMetric("test", 30);

      expect(PerformanceMonitor.getAverage("test")).toBe(20);
    });

    it("should return 0 for empty metrics", () => {
      expect(PerformanceMonitor.getAverage("nonexistent")).toBe(0);
    });
  });

  describe("getAllMetrics", () => {
    it("should return all metrics with statistics", () => {
      const values = [10, 20, 30, 40, 50];
      values.forEach((val) => PerformanceMonitor.recordMetric("test", val));

      const metrics = PerformanceMonitor.getAllMetrics();
      expect(metrics.test).toEqual({
        avg: 30,
        p95: 45,
        p99: 49,
        count: 5,
      });
    });
  });

  describe("clearMetrics", () => {
    it("should clear all metrics", () => {
      PerformanceMonitor.recordMetric("test1", 100);
      PerformanceMonitor.recordMetric("test2", 200);

      PerformanceMonitor.clearMetrics();

      const metrics = PerformanceMonitor.getAllMetrics();
      expect(Object.keys(metrics)).toHaveLength(0);
    });
  });

  describe("clearMetric", () => {
    it("should clear specific metric", () => {
      PerformanceMonitor.recordMetric("test1", 100);
      PerformanceMonitor.recordMetric("test2", 200);

      PerformanceMonitor.clearMetric("test1");

      const metrics = PerformanceMonitor.getAllMetrics();
      expect(metrics.test1).toBeUndefined();
      expect(metrics.test2).toBeDefined();
    });
  });
});
