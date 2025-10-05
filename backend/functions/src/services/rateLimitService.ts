import {db} from "../lib/firebase";
import {logAudit} from "../lib/auditService";

// Move these to types/index.ts in a real implementation
export type RateLimitConfig = {
  action: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  enabled: boolean;
};

export type RateLimit = {
  rateLimitId: string;
  userId: string;
  action: string;
  period: "daily" | "monthly";
  count: number;
  limit: number;
  resetAt: string;
  createdAt: string;
  updatedAt: string;
};

export class RateLimitService {
  private readonly rateLimits: Record<string, RateLimitConfig> = {
    "wallet_earn": {
      action: "wallet_earn",
      dailyLimit: 100, // Max 100 HealCoins per day
      monthlyLimit: 2000, // Max 2000 HealCoins per month
      enabled: true,
    },
    "wallet_redeem": {
      action: "wallet_redeem",
      dailyLimit: 50, // Max 50 HealCoins redemption per day
      monthlyLimit: 1000, // Max 1000 HealCoins redemption per month
      enabled: true,
    },
    "carbon_log": {
      action: "carbon_log",
      dailyLimit: 10, // Max 10 carbon logs per day
      monthlyLimit: 200, // Max 200 carbon logs per month
      enabled: true,
    },
    "mental_health_log": {
      action: "mental_health_log",
      dailyLimit: 5, // Max 5 mental health logs per day
      monthlyLimit: 100, // Max 100 mental health logs per month
      enabled: true,
    },
    "game_completion": {
      action: "game_completion",
      dailyLimit: 20, // Max 20 game completions per day
      monthlyLimit: 400, // Max 400 game completions per month
      enabled: true,
    },
    "data_export": {
      action: "data_export",
      dailyLimit: 3, // Max 3 data export requests per day
      monthlyLimit: 10, // Max 10 data export requests per month
      enabled: true,
    },
  };

  async checkRateLimit(
    userId: string,
    action: string,
    amount: number = 1
  ): Promise<{ allowed: boolean; reason?: string; resetAt?: Date }> {
    const config = this.rateLimits[action];

    if (!config || !config.enabled) {
      return {allowed: true};
    }

    // Check daily limit
    if (config.dailyLimit) {
      const dailyCheck = await this.checkPeriodLimit(
        userId,
        action,
        "daily",
        config.dailyLimit,
        amount
      );

      if (!dailyCheck.allowed) {
        return dailyCheck;
      }
    }

    // Check monthly limit
    if (config.monthlyLimit) {
      const monthlyCheck = await this.checkPeriodLimit(
        userId,
        action,
        "monthly",
        config.monthlyLimit,
        amount
      );

      if (!monthlyCheck.allowed) {
        return monthlyCheck;
      }
    }

    return {allowed: true};
  }

  private async checkPeriodLimit(
    userId: string,
    action: string,
    period: "daily" | "monthly",
    limit: number,
    amount: number
  ): Promise<{ allowed: boolean; reason?: string; resetAt?: Date }> {
    const now = new Date();
    const resetAt = this.getResetTime(now, period);
    const rateLimitId = `${userId}_${action}_${period}`;

    const rateLimitRef = db.collection("rateLimits").doc(rateLimitId);
    const rateLimitDoc = await rateLimitRef.get();

    let currentCount = 0;
    let rateLimit: RateLimit;

    if (rateLimitDoc.exists) {
      rateLimit = rateLimitDoc.data() as RateLimit;

      // Check if we need to reset the counter
      if (now >= new Date(rateLimit.resetAt)) {
        currentCount = 0;
        rateLimit.count = 0;
        rateLimit.resetAt = resetAt.toISOString();
        rateLimit.updatedAt = now.toISOString();
      } else {
        currentCount = rateLimit.count;
      }
    } else {
      // Create new rate limit record
      rateLimit = {
        rateLimitId: `${userId}_${action}_${period}`,
        userId,
        action,
        period,
        count: 0,
        limit,
        resetAt: resetAt.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }

    // Check if adding the amount would exceed the limit
    if (currentCount + amount > limit) {
      // Log rate limit violation
      await logAudit(
        "RATE_LIMIT_EXCEEDED",
        userId,
        userId,
        {},
        {
          action,
          period,
          currentCount,
          attemptedAmount: amount,
          limit,
          resetAt: rateLimit.resetAt,
        },
        "rateLimitService"
      );

      return {
        allowed: false,
        reason: `${period} limit exceeded for ${action}. Current: ${currentCount}, Limit: ${limit}, Reset: ${rateLimit.resetAt}`,
        resetAt: new Date(rateLimit.resetAt),
      };
    }

    return {allowed: true};
  }

  async incrementRateLimit(
    userId: string,
    action: string,
    amount: number = 1
  ): Promise<void> {
    const config = this.rateLimits[action];

    if (!config || !config.enabled) {
      return;
    }

    const now = new Date();

    // Update daily counter
    if (config.dailyLimit) {
      await this.updatePeriodCounter(userId, action, "daily", amount, now);
    }

    // Update monthly counter
    if (config.monthlyLimit) {
      await this.updatePeriodCounter(userId, action, "monthly", amount, now);
    }
  }

  private async updatePeriodCounter(
    userId: string,
    action: string,
    period: "daily" | "monthly",
    amount: number,
    now: Date
  ): Promise<void> {
    const resetAt = this.getResetTime(now, period);
    const rateLimitId = `${userId}_${action}_${period}`;
    const config = this.rateLimits[action];

    const rateLimitRef = db.collection("rateLimits").doc(rateLimitId);

    await db.runTransaction(async (transaction) => {
      const rateLimitDoc = await transaction.get(rateLimitRef);

      if (rateLimitDoc.exists) {
        const rateLimit = rateLimitDoc.data() as RateLimit;

        // Check if we need to reset
        if (now >= new Date(rateLimit.resetAt)) {
          transaction.set(rateLimitRef, {
            rateLimitId,
            userId,
            action,
            period,
            count: amount,
            limit: period === "daily" ? config.dailyLimit! : config.monthlyLimit!,
            resetAt: resetAt.toISOString(),
            createdAt: rateLimit.createdAt,
            updatedAt: now.toISOString(),
          });
        } else {
          transaction.update(rateLimitRef, {
            count: rateLimit.count + amount,
            updatedAt: now.toISOString(),
          });
        }
      } else {
        transaction.set(rateLimitRef, {
          rateLimitId,
          userId,
          action,
          period,
          count: amount,
          limit: period === "daily" ? config.dailyLimit! : config.monthlyLimit!,
          resetAt: resetAt.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
      }
    });
  }

  private getResetTime(now: Date, period: "daily" | "monthly"): Date {
    const resetTime = new Date(now);

    if (period === "daily") {
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);
    } else {
      resetTime.setMonth(resetTime.getMonth() + 1);
      resetTime.setDate(1);
      resetTime.setHours(0, 0, 0, 0);
    }

    return resetTime;
  }

  async getRateLimitStatus(userId: string, action: string): Promise<{
    daily?: { count: number; limit: number; resetAt: Date };
    monthly?: { count: number; limit: number; resetAt: Date };
  }> {
    const config = this.rateLimits[action];
    const status: any = {};

    if (config?.dailyLimit) {
      const dailyDoc = await db.collection("rateLimits")
        .doc(`${userId}_${action}_daily`)
        .get();

      if (dailyDoc.exists) {
        const data = dailyDoc.data() as RateLimit;
        status.daily = {
          count: data.count,
          limit: data.limit,
          resetAt: data.resetAt,
        };
      } else {
        status.daily = {
          count: 0,
          limit: config.dailyLimit,
          resetAt: this.getResetTime(new Date(), "daily").toISOString(),
        };
      }
    }

    if (config?.monthlyLimit) {
      const monthlyDoc = await db.collection("rateLimits")
        .doc(`${userId}_${action}_monthly`)
        .get();

      if (monthlyDoc.exists) {
        const data = monthlyDoc.data() as RateLimit;
        status.monthly = {
          count: data.count,
          limit: data.limit,
          resetAt: data.resetAt,
        };
      } else {
        status.monthly = {
          count: 0,
          limit: config.monthlyLimit,
          resetAt: this.getResetTime(new Date(), "monthly").toISOString(),
        };
      }
    }

    return status;
  }

  async updateRateLimitConfig(
    action: string,
    config: Partial<RateLimitConfig>
  ): Promise<void> {
    this.rateLimits[action] = {
      ...this.rateLimits[action],
      ...config,
    };

    // Save to database for persistence
    await db.collection("rateLimitConfigs").doc(action).set({
      ...this.rateLimits[action],
      updatedAt: new Date().toISOString(),
    });

    await logAudit(
      "RATE_LIMIT_CONFIG_UPDATED",
      "system",
      action,
      {},
      {
        action,
        config,
      },
      "rateLimitService"
    );
  }
}

export const rateLimitService = new RateLimitService();
