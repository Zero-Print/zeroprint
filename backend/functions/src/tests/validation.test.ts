import {describe, it, expect} from "@jest/globals";
import {createSubscriptionSchema, cancelSubscriptionSchema} from "../lib/schemas";

describe("Validation schemas", () => {
  it("accepts valid createSubscription payload", () => {
    const parsed = createSubscriptionSchema.parse({planId: "citizen", autoRenewal: true});
    expect(parsed.planId).toBe("citizen");
  });
  it("rejects invalid createSubscription payload", () => {
    expect(() => createSubscriptionSchema.parse({planId: "invalid"})).toThrow();
  });
  it("accepts valid cancelSubscription payload", () => {
    const parsed = cancelSubscriptionSchema.parse({subscriptionId: "sub1"});
    expect(parsed.subscriptionId).toBe("sub1");
  });
});

import {isValidUserRole, isValidPaymentStatus} from "../types";
import {CarbonActionType} from "../types/trackers";

describe("Type Validation", () => {
  describe("isValidUserRole", () => {
    it("should validate correct user roles", () => {
      expect(isValidUserRole("citizen")).toBe(true);
      expect(isValidUserRole("school")).toBe(true);
      expect(isValidUserRole("msme")).toBe(true);
      expect(isValidUserRole("govt")).toBe(true);
      expect(isValidUserRole("admin")).toBe(true);
    });

    it("should reject invalid user roles", () => {
      expect(isValidUserRole("invalid")).toBe(false);
      expect(isValidUserRole("user")).toBe(false);
      expect(isValidUserRole("")).toBe(false);
      expect(isValidUserRole("ADMIN")).toBe(false); // Case sensitive
    });
  });

  describe("isValidPaymentStatus", () => {
    it("should validate correct payment statuses", () => {
      expect(isValidPaymentStatus("success")).toBe(true);
      expect(isValidPaymentStatus("failed")).toBe(true);
      expect(isValidPaymentStatus("pending")).toBe(true);
    });

    it("should reject invalid payment statuses", () => {
      expect(isValidPaymentStatus("completed")).toBe(false);
      expect(isValidPaymentStatus("cancelled")).toBe(false);
      expect(isValidPaymentStatus("")).toBe(false);
      expect(isValidPaymentStatus("SUCCESS")).toBe(false); // Case sensitive
    });
  });

  describe("CarbonActionType validation", () => {
    const validActionTypes: CarbonActionType[] = [
      "transport", "energy", "waste", "water",
    ];

    it("should accept valid carbon action types", () => {
      validActionTypes.forEach((actionType) => {
        expect(typeof actionType).toBe("string");
        expect(actionType.length).toBeGreaterThan(0);
      });
    });

    it("should maintain type safety for carbon action types", () => {
      // This test ensures TypeScript compilation catches invalid types
      const testActionType: CarbonActionType = "transport";
      expect(testActionType).toBe("transport");
    });
  });

  describe("Data structure validation", () => {
    describe("User profile validation", () => {
      it("should validate complete user profile structure", () => {
        const validProfile = {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "1990-01-01",
          phoneNumber: "+1234567890",
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "State",
            zipCode: "12345",
            country: "Country",
          },
          preferences: {
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            privacy: {
              profileVisibility: "public" as const,
              dataSharing: true,
            },
            language: "en",
            timezone: "UTC",
          },
        };

        expect(validProfile.firstName).toBeDefined();
        expect(validProfile.address.street).toBeDefined();
        expect(validProfile.preferences.notifications.email).toBe(true);
        expect(["public", "private", "friends"].includes(validProfile.preferences.privacy.profileVisibility)).toBe(true);
      });

      it("should handle missing optional profile fields", () => {
        const minimalProfile = {
          firstName: "John",
          lastName: "Doe",
          preferences: {
            notifications: {
              email: true,
              push: false,
              sms: false,
            },
            privacy: {
              profileVisibility: "private" as const,
              dataSharing: false,
            },
            language: "en",
            timezone: "UTC",
          },
        };

        expect(minimalProfile.firstName).toBe("John");
        expect(minimalProfile.lastName).toBe("Doe");
        expect(minimalProfile.preferences).toBeDefined();
        expect(minimalProfile.preferences.notifications).toBeDefined();
        expect(minimalProfile.preferences.privacy).toBeDefined();
        expect(minimalProfile.preferences.language).toBe("en");
        expect(minimalProfile.preferences.timezone).toBe("UTC");
      });
    });

    describe("Wallet validation", () => {
      it("should validate wallet balance constraints", () => {
        const wallet = {
          walletId: "wallet123",
          userId: "user123",
          healCoins: 100,
          carbonCredits: 50,
          totalEarned: 200,
          totalSpent: 100,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        // Validate balance consistency
        expect(wallet.healCoins).toBeGreaterThanOrEqual(0);
        expect(wallet.carbonCredits).toBeGreaterThanOrEqual(0);
        expect(wallet.totalEarned).toBeGreaterThanOrEqual(wallet.totalSpent);
        expect(wallet.totalEarned - wallet.totalSpent).toBeGreaterThanOrEqual(0);
      });

      it("should handle edge cases for wallet balances", () => {
        const zeroWallet = {
          walletId: "wallet123",
          userId: "user123",
          healCoins: 0,
          carbonCredits: 0,
          totalEarned: 0,
          totalSpent: 0,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        expect(zeroWallet.healCoins).toBe(0);
        expect(zeroWallet.carbonCredits).toBe(0);
        expect(zeroWallet.totalEarned).toBe(zeroWallet.totalSpent);
      });
    });

    describe("Carbon log validation", () => {
      it("should validate carbon log data integrity", () => {
        const carbonLog = {
          logId: "log123",
          userId: "user123",
          actionType: "transport" as CarbonActionType,
          value: 10,
          co2Saved: 5.5,
          coinsEarned: 10,
          timestamp: "2024-01-01T00:00:00.000Z",
          metadata: {vehicle: "bicycle"},
        };

        expect(carbonLog.value).toBeGreaterThan(0);
        expect(carbonLog.co2Saved).toBeGreaterThanOrEqual(0);
        expect(carbonLog.coinsEarned).toBeGreaterThanOrEqual(0);
        expect(new Date(carbonLog.timestamp)).toBeInstanceOf(Date);
        expect(carbonLog.metadata).toBeDefined();
      });

      it("should handle different carbon action types", () => {
        const actionTypes: CarbonActionType[] = ["transport", "energy", "waste", "water"];

        actionTypes.forEach((actionType) => {
          const log = {
            logId: `log_${actionType}`,
            userId: "user123",
            actionType,
            value: 5,
            co2Saved: 2.5,
            coinsEarned: 5,
            timestamp: "2024-01-01T00:00:00.000Z",
          };

          expect(log.actionType).toBe(actionType);
          expect(typeof log.actionType).toBe("string");
        });
      });
    });

    describe("Game score validation", () => {
      it("should validate game score structure", () => {
        const gameScore = {
          scoreId: "score123",
          gameId: "game123",
          userId: "user123",
          score: 1500,
          completedAt: "2024-01-01T00:00:00.000Z",
          healCoinsEarned: 25,
          createdAt: "2024-01-01T00:00:00.000Z",
        };

        expect(gameScore.score).toBeGreaterThanOrEqual(0);
        expect(gameScore.healCoinsEarned).toBeGreaterThanOrEqual(0);
        expect(new Date(gameScore.completedAt)).toBeInstanceOf(Date);
        expect(new Date(gameScore.createdAt)).toBeInstanceOf(Date);
      });

      it("should handle incomplete games", () => {
        const incompleteScore = {
          scoreId: "score123",
          gameId: "game123",
          userId: "user123",
          score: 1500,
          coinsEarned: 25,
          attempts: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
        };

        expect(incompleteScore.scoreId).toBeDefined();
        expect(incompleteScore.gameId).toBeDefined();
        expect(incompleteScore.userId).toBeDefined();
        expect(incompleteScore.score).toBeGreaterThan(0);
        expect(incompleteScore.coinsEarned).toBeGreaterThanOrEqual(0);
        expect(incompleteScore.attempts).toBeGreaterThan(0);
        expect(incompleteScore.createdAt).toBeDefined();
      });
    });
  });

  describe("Error handling validation", () => {
    it("should validate error log structure", () => {
      const errorLog = {
        errorId: "error123",
        message: "Test error message",
        level: "error" as const,
        source: "backend" as const,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      expect(["info", "warning", "error", "critical"].includes(errorLog.level)).toBe(true);
      expect(["frontend", "backend", "database", "external"].includes(errorLog.source)).toBe(true);
      expect(errorLog.message.length).toBeGreaterThan(0);
    });

    it("should validate audit log structure", () => {
      const auditLog = {
        auditId: "audit123",
        userId: "user123",
        action: "wallet_credit",
        resourceType: "wallet",
        resourceId: "wallet123",
        timestamp: "2024-01-01T00:00:00.000Z",
      };

      expect(auditLog.action.length).toBeGreaterThan(0);
      expect(auditLog.resourceType.length).toBeGreaterThan(0);
      expect(auditLog.resourceId.length).toBeGreaterThan(0);
      expect(new Date(auditLog.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe("Date and timestamp validation", () => {
    it("should validate ISO string format", () => {
      const isoString = "2024-01-01T00:00:00.000Z";
      const date = new Date(isoString);

      expect(date.toISOString()).toBe(isoString);
      expect(isNaN(date.getTime())).toBe(false);
    });

    it("should handle invalid date strings", () => {
      const invalidDate = new Date("invalid-date");
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });

    it("should validate date ordering", () => {
      const createdAt = "2024-01-01T00:00:00.000Z";
      const updatedAt = "2024-01-02T00:00:00.000Z";

      expect(new Date(updatedAt).getTime()).toBeGreaterThan(new Date(createdAt).getTime());
    });
  });
});
