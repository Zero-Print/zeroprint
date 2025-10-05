/**
 * Tests for Logging Service
 */

import {loggingService} from "../../services/loggingService";
import {db} from "../../lib/firebase";

// Mock Firebase
jest.mock("../../lib/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
          get: jest.fn(),
        })),
        get: jest.fn(),
      })),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
        get: jest.fn(),
      })),
    })),
  },
}));

describe("LoggingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logAudit", () => {
    it("should log audit trail with hash chaining", async () => {
      const mockSet = jest.fn();
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn(() => ({set: mockSet})),
      });

      const result = await loggingService.logAudit(
        "user_action",
        "login",
        "user123",
        {ip: "192.168.1.1"}
      );

      expect(result).toMatch(/^audit_\d+_[a-z0-9]+$/);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "user_action",
          action: "login",
          userId: "user123",
          data: {ip: "192.168.1.1"},
          hash: expect.any(String),
        })
      );
    });

    it("should include previous hash in audit log", async () => {
      const mockSet = jest.fn();
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn(() => ({set: mockSet})),
      });

      // First audit log
      await loggingService.logAudit("test", "action1", "user1", {});

      // Second audit log should include previous hash
      await loggingService.logAudit("test", "action2", "user2", {});

      expect(mockSet).toHaveBeenCalledTimes(2);
      const secondCall = mockSet.mock.calls[1][0];
      expect(secondCall.previousHash).toBeDefined();
    });
  });

  describe("logActivity", () => {
    it("should log user activity", async () => {
      const mockSet = jest.fn();
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn(() => ({set: mockSet})),
      });

      const result = await loggingService.logActivity(
        "user123",
        "game_completed",
        {gameId: "game1", score: 100},
        "games",
        50,
        2.5
      );

      expect(result).toMatch(/^activity_\d+_[a-z0-9]+$/);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user123",
          action: "game_completed",
          details: {gameId: "game1", score: 100},
          module: "games",
          coinsEarned: 50,
          co2Saved: 2.5,
        })
      );
    });
  });

  describe("logError", () => {
    it("should log system error with severity", async () => {
      const mockSet = jest.fn();
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn(() => ({set: mockSet})),
      });

      const result = await loggingService.logError(
        "auth",
        "InvalidTokenError",
        "Token verification failed",
        "Error: Invalid token\n    at verifyToken",
        "user123",
        "high",
        {tokenType: "idToken"}
      );

      expect(result).toMatch(/^error_\d+_[a-z0-9]+$/);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          module: "auth",
          errorType: "InvalidTokenError",
          message: "Token verification failed",
          stack: expect.stringContaining("Error: Invalid token"),
          userId: "user123",
          severity: "high",
          resolved: false,
          context: {tokenType: "idToken"},
        })
      );
    });

    it("should trigger alert for critical errors", async () => {
      const mockSet = jest.fn();
      const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({set: mockSet})),
      }));
      (db.collection as jest.Mock).mockImplementation(mockCollection);

      await loggingService.logError(
        "database",
        "ConnectionError",
        "Database connection lost",
        "Error: Connection timeout",
        undefined,
        "critical"
      );

      // Should log error and trigger alert
      expect(mockSet).toHaveBeenCalledTimes(2);

      const alertCall = mockSet.mock.calls.find((call) =>
        call[0].type === "error_spike"
      );
      expect(alertCall).toBeDefined();
    });
  });

  describe("recordPerformance", () => {
    it("should record performance metric", async () => {
      const mockSet = jest.fn();
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn(() => ({set: mockSet})),
      });

      const result = await loggingService.recordPerformance(
        "/api/wallet/balance",
        "GET",
        150,
        200,
        "user123",
        1024,
        50
      );

      expect(result).toMatch(/^perf_\d+_[a-z0-9]+$/);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          route: "/api/wallet/balance",
          method: "GET",
          latency: 150,
          p95: 180, // 150 * 1.2
          p99: 225, // 150 * 1.5
          userId: "user123",
          statusCode: 200,
          memoryUsage: 1024,
          cpuUsage: 50,
        })
      );
    });

    it("should trigger alert for slow responses", async () => {
      const mockSet = jest.fn();
      const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({set: mockSet})),
      }));
      (db.collection as jest.Mock).mockImplementation(mockCollection);

      await loggingService.recordPerformance(
        "/api/slow-endpoint",
        "POST",
        6000, // 6 seconds - should trigger alert
        200
      );

      // Should record metric and trigger alert
      expect(mockSet).toHaveBeenCalledTimes(2);

      const alertCall = mockSet.mock.calls.find((call) =>
        call[0].type === "performance_degradation"
      );
      expect(alertCall).toBeDefined();
    });
  });

  describe("triggerAlert", () => {
    it("should create system alert", async () => {
      const mockSet = jest.fn();
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn(() => ({set: mockSet})),
      });

      const result = await loggingService.triggerAlert(
        "webhook_failure",
        "high",
        "Webhook delivery failed",
        {webhookId: "wh123", attempts: 3}
      );

      expect(result).toMatch(/^alert_\d+_[a-z0-9]+$/);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "webhook_failure",
          severity: "high",
          message: "Webhook delivery failed",
          data: {webhookId: "wh123", attempts: 3},
          resolved: false,
        })
      );
    });
  });

  describe("getAnalytics", () => {
    it("should return analytics data", async () => {
      const mockGet = jest.fn();
      const mockSnapshot = {
        docs: [
          {data: () => ({userId: "user1", coinsEarned: 100, co2Saved: 5})},
          {data: () => ({userId: "user2", coinsEarned: 200, co2Saved: 10})},
        ],
        size: 2,
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn(() => ({
          get: mockGet.mockResolvedValue(mockSnapshot),
        })),
      });

      const analytics = await loggingService.getAnalytics("7d");

      expect(analytics).toEqual({
        dau: 2,
        totalCoins: 300,
        totalCo2Saved: 15,
        ecoMindScore: 75,
        kindnessIndex: 80,
        errorCount: 0,
        subscriptionCount: 0,
        fraudAlerts: 0,
        performance: {
          avgLatency: 0,
          p95Latency: 0,
          p99Latency: 0,
        },
      });
    });
  });

  describe("health checks", () => {
    it("should check for CO₂ drop", async () => {
      const mockGet = jest.fn();
      const currentWeekSnapshot = {
        docs: [{data: () => ({co2Saved: 50})}],
      };
      const previousWeekSnapshot = {
        docs: [{data: () => ({co2Saved: 100})}],
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn(() => ({
          get: mockGet
            .mockResolvedValueOnce(currentWeekSnapshot)
            .mockResolvedValueOnce(previousWeekSnapshot),
        })),
      });

      // Mock triggerAlert
      const triggerAlertSpy = jest.spyOn(loggingService, "triggerAlert");
      triggerAlertSpy.mockResolvedValue("alert123");

      await loggingService.checkCo2Drop();

      expect(triggerAlertSpy).toHaveBeenCalledWith(
        "co2_drop",
        "high",
        expect.stringContaining("CO₂ savings dropped by 50.0%"),
        expect.objectContaining({
          currentWeekCo2: 50,
          previousWeekCo2: 100,
          dropPercentage: 50,
        })
      );
    });

    it("should check for webhook failures", async () => {
      const mockGet = jest.fn();
      const webhookErrorsSnapshot = {
        docs: new Array(6).fill({data: () => ({module: "webhooks"})}),
        size: 6,
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn(() => ({
          get: mockGet.mockResolvedValue(webhookErrorsSnapshot),
        })),
      });

      const triggerAlertSpy = jest.spyOn(loggingService, "triggerAlert");
      triggerAlertSpy.mockResolvedValue("alert123");

      await loggingService.checkWebhookFailures();

      expect(triggerAlertSpy).toHaveBeenCalledWith(
        "webhook_failure",
        "high",
        "6 webhook failures detected in the last hour",
        expect.objectContaining({
          errorCount: 6,
          timeRange: "1 hour",
        })
      );
    });

    it("should check for system downtime", async () => {
      const mockGet = jest.fn();
      const emptySnapshot = {empty: true};

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn(() => ({
          get: mockGet.mockResolvedValue(emptySnapshot),
        })),
      });

      const triggerAlertSpy = jest.spyOn(loggingService, "triggerAlert");
      triggerAlertSpy.mockResolvedValue("alert123");

      await loggingService.checkDowntime();

      expect(triggerAlertSpy).toHaveBeenCalledWith(
        "downtime",
        "critical",
        "No successful requests detected in the last 5 minutes",
        expect.objectContaining({
          lastSuccessfulRequest: expect.any(Date),
        })
      );
    });
  });
});
