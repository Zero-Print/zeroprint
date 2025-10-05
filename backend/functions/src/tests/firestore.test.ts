import {
  userConverter,
  walletConverter,
  gameScoreConverter,
  auditLogConverter,
} from "../lib/typedFirestore";
import {carbonLogConverter} from "../services/firestoreConverters";
import {User, Wallet, AuditLog, GameScore, CarbonLog} from "../types";

// Mock firebase-admin
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  apps: [],
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
  firestore: Object.assign(
    jest.fn(() => ({
      collection: jest.fn(() => ({
        withConverter: jest.fn(() => ({})),
        doc: jest.fn(),
        add: jest.fn(),
        get: jest.fn(),
      })),
      doc: jest.fn(),
    })),
    {
      Timestamp: {
        fromDate: jest.fn((date: Date) => ({
          toDate: () => date,
          seconds: Math.floor(date.getTime() / 1000),
          nanoseconds: (date.getTime() % 1000) * 1000000,
        })),
        now: jest.fn(() => ({
          toDate: () => new Date(),
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: (Date.now() % 1000) * 1000000,
        })),
      },
    }
  ),
}));

// Get the mocked admin module
const admin = require("firebase-admin");
const mockTimestamp = admin.firestore.Timestamp;

const mockSnapshot = {
  id: "test-id",
  data: jest.fn(),
};

describe("Firestore Converters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("userConverter", () => {
    const mockUser: User = {
      userId: "user123",
      email: "test@example.com",
      displayName: "Test User",
      role: "citizen",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      isActive: true,
    };

    it("should convert User to Firestore format", () => {
      const result = userConverter.toFirestore(mockUser);

      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockUser.createdAt));
      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockUser.updatedAt!));
      expect(result).toEqual(expect.objectContaining({
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        isActive: mockUser.isActive,
        emailVerified: undefined,
        lastLoginAt: undefined,
      }));
      expect(result.createdAt).toHaveProperty("toDate");
      expect(result.updatedAt).toHaveProperty("toDate");
    });

    it("should convert Firestore document to User", () => {
      const mockData = {
        email: "test@example.com",
        name: "Test User",
        role: "citizen",
        isActive: true,
        emailVerified: true,
        createdAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        updatedAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        lastLoginAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},

      };

      mockSnapshot.data.mockReturnValue(mockData);
      const result = userConverter.fromFirestore(mockSnapshot as any);

      expect(result.userId).toBe("test-id");
      expect(result.email).toBe(mockData.email);
      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });
  });

  describe("carbonLogConverter", () => {
    const mockCarbonLog: CarbonLog = {
      id: "log123",
      userId: "user123",
      categoryId: "transport",
      action: "cycling",
      co2Saved: 2.5,
      quantity: 10,
      unit: "km",
      timestamp: "2024-01-01T00:00:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      metadata: {transportMode: "cycle"},
    };

    it("should convert CarbonLog to Firestore format", () => {
      const result = carbonLogConverter.toFirestore(mockCarbonLog);

      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockCarbonLog.createdAt));
      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockCarbonLog.updatedAt));
      expect(result).toEqual(expect.objectContaining({
        userId: mockCarbonLog.userId,
        categoryId: mockCarbonLog.categoryId,
        action: mockCarbonLog.action,
        quantity: mockCarbonLog.quantity,
        co2Saved: mockCarbonLog.co2Saved,
      }));
    });

    it("should convert Firestore document to CarbonLog", () => {
      const mockData = {
        userId: "user123",
        categoryId: "transport",
        action: "cycling",
        quantity: 10,
        unit: "km",
        co2Saved: 5.5,
        timestamp: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        metadata: {vehicle: "bicycle"},
      };

      mockSnapshot.data.mockReturnValue(mockData);
      const result = carbonLogConverter.fromFirestore(mockSnapshot as any);

      expect(result.id).toBe("test-id");
      expect(result.categoryId).toBe(mockData.categoryId);
      expect(result.action).toBe(mockData.action);
      expect(result.timestamp).toEqual({toDate: () => new Date("2024-01-01T00:00:00.000Z")});
    });
  });

  describe("walletConverter", () => {
    const mockWallet: Wallet = {
      walletId: "wallet123",
      id: "wallet123",
      entityId: "user123",
      userId: "user123",
      inrBalance: 1000,
      healCoins: 500,
      totalEarned: 500,
      totalRedeemed: 0,
      lastUpdated: "2024-01-01T00:00:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      isActive: true,
    };

    it("should convert Wallet to Firestore format", () => {
      const result = walletConverter.toFirestore(mockWallet);

      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockWallet.createdAt));
      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockWallet.lastUpdated));
      expect(result).toEqual(expect.objectContaining({
        entityId: mockWallet.entityId,
        inrBalance: mockWallet.inrBalance,
        healCoins: mockWallet.healCoins,
        isActive: mockWallet.isActive,
      }));
      expect(result.lastUpdated).toHaveProperty("toDate");
      expect(result.createdAt).toHaveProperty("toDate");
    });

    it("should convert Firestore document to Wallet with defaults", () => {
      const mockData = {
        entityId: "user123",
        inrBalance: 1000,
        healCoins: 500,
        lastUpdated: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        createdAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        isActive: true,
      };

      mockSnapshot.data.mockReturnValue(mockData);
      const result = walletConverter.fromFirestore(mockSnapshot as any);

      expect(result.walletId).toBe("test-id");
      expect(result.entityId).toBe(mockData.entityId);
      expect(result.inrBalance).toBe(mockData.inrBalance);
      expect(result.healCoins).toBe(mockData.healCoins);
      expect(result.isActive).toBe(mockData.isActive);
      expect(result.lastUpdated).toBe("2024-01-01T00:00:00.000Z");
      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });
  });

  describe("gameScoreConverter", () => {
    const mockGameScore: GameScore = {
      scoreId: "score123",
      gameId: "game123",
      userId: "user123",
      gameType: "quiz",
      gameName: "Eco Quiz",
      score: 1500,
      maxScore: 2000,
      percentage: 75,
      completionTime: 180,
      timeSpent: 180,
      coinsEarned: 25,
      completedAt: "2024-01-01T00:00:00.000Z",
      attempts: 1,
      metadata: {},
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    it("should convert GameScore to Firestore format", () => {
      const result = gameScoreConverter.toFirestore(mockGameScore);

      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockGameScore.completedAt));
      expect(result).toEqual(expect.objectContaining({
        gameId: mockGameScore.gameId,
        userId: mockGameScore.userId,
        score: mockGameScore.score,
        coinsEarned: mockGameScore.coinsEarned,
        attempts: mockGameScore.attempts,
      }));
    });

    it("should handle null completedAt", () => {
      const incompleteScore = {...mockGameScore, completedAt: "2024-01-01T00:00:00.000Z"};
      const result = gameScoreConverter.toFirestore(incompleteScore);

      expect(result.coinsEarned).toBe(mockGameScore.coinsEarned);
    });

    it("should convert Firestore document to GameScore", () => {
      const mockData = {
        gameId: "game123",
        userId: "user123",
        score: 1500,
        coinsEarned: 25,
        createdAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        attempts: 1,
      };

      mockSnapshot.data.mockReturnValue(mockData);
      const result = gameScoreConverter.fromFirestore(mockSnapshot as any);

      expect(result.scoreId).toBe("test-id");
      expect(result.gameId).toBe(mockData.gameId);
      expect(result.userId).toBe(mockData.userId);
      expect(result.score).toBe(mockData.score);
      expect(result.coinsEarned).toBe(25);
      expect(result.attempts).toBe(1);
      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });
  });

  describe("auditLogConverter", () => {
    const mockAuditLog: AuditLog = {
      auditId: "audit123",
      userId: "user123",
      action: "credit",
      resourceType: "wallet",
      resourceId: "wallet123",
      details: {amount: 100},
      timestamp: "2024-01-01T00:00:00.000Z",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    };

    it("should convert AuditLog to Firestore format", () => {
      const result = auditLogConverter.toFirestore(mockAuditLog);

      expect(mockTimestamp.fromDate).toHaveBeenCalledWith(new Date(mockAuditLog.timestamp));
      expect(result).toEqual(expect.objectContaining({
        action: mockAuditLog.action,
        userId: mockAuditLog.userId,
        resourceType: mockAuditLog.resourceType,
        resourceId: mockAuditLog.resourceId,
        details: mockAuditLog.details,
        ipAddress: mockAuditLog.ipAddress,
        userAgent: mockAuditLog.userAgent,
      }));
      expect(result.createdAt).toHaveProperty("toDate");
    });

    it("should convert Firestore document to AuditLog", () => {
      const mockData = {
        type: "wallet",
        action: "credit",
        userId: "user123",
        data: {amount: 100},
        createdAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        severity: "low",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      mockSnapshot.data.mockReturnValue(mockData);
      const result = auditLogConverter.fromFirestore(mockSnapshot as any);

      expect(result.logId).toBe("test-id");
      expect(result.type).toBe(mockData.type);
      expect(result.action).toBe(mockData.action);
      expect(result.userId).toBe(mockData.userId);
      expect(result.data).toEqual(mockData.data);
      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
      expect(result.severity).toBe(mockData.severity);
      expect(result.ipAddress).toBe(mockData.ipAddress);
      expect(result.userAgent).toBe(mockData.userAgent);
    });

    it("should handle missing optional fields", () => {
      const mockData = {
        type: "wallet",
        action: "credit",
        userId: "user123",
        data: {},
        createdAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        severity: "low",
      };

      mockSnapshot.data.mockReturnValue(mockData);
      const result = auditLogConverter.fromFirestore(mockSnapshot as any);

      expect(result.logId).toBe("test-id");
      expect(result.data).toEqual({});
      expect(result.ipAddress).toBeUndefined();
      expect(result.userAgent).toBeUndefined();
    });

    it("should handle missing optional fields with defaults for GameScore", () => {
      const mockData = {
        gameId: "game123",
        userId: "user123",
        score: 1500,
        createdAt: {toDate: () => new Date("2024-01-01T00:00:00.000Z")},
        attempts: 1,
      };

      mockSnapshot.data.mockReturnValue(mockData);
      const result = gameScoreConverter.fromFirestore(mockSnapshot as any);

      expect(result.scoreId).toBe("test-id");
      expect(result.coinsEarned).toBe(0); // Default value when missing
      expect(result.attempts).toBe(1);
    });
  });
});
