/**
 * Input Validation Schemas
 * Per-endpoint validation for all API endpoints
 */

import {z} from "zod";
import {Request, Response, NextFunction} from "express";

// Base schemas
// const baseEntitySchema = z.object({
//   id: z.string().min(1),
//   createdAt: z.date(),
//   updatedAt: z.date(),
// }); // Unused

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  userData: z.object({
    name: z.string().min(1),
    role: z.enum(["citizen", "school", "msme", "government", "admin"]).default("citizen"),
    profile: z.object({
      avatar: z.string().url().optional(),
      bio: z.string().optional(),
      location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        wardId: z.string().optional(),
      }).optional(),
    }).optional(),
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  profile: z.object({
    avatar: z.string().url().optional(),
    bio: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
      wardId: z.string().optional(),
    }).optional(),
    preferences: z.object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      language: z.enum(["en", "hi"]).optional(),
      units: z.enum(["metric", "imperial"]).optional(),
    }).optional(),
  }).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
  }).optional(),
});

// Wallet schemas
export const earnCoinsSchema = z.object({
  gameId: z.string().min(1),
  coins: z.number().int().min(1).max(1000),
});

export const redeemCoinsSchema = z.object({
  amount: z.number().int().min(1).optional(),
  rewardId: z.string().min(1).optional(),
}).refine((data) => data.amount || data.rewardId, {
  message: "Either amount or rewardId must be provided",
});

export const walletTransactionsSchema = paginationSchema;

// Tracker schemas
export const carbonLogSchema = z.object({
  actionType: z.enum(["transport", "energy", "waste", "water", "food"]),
  value: z.number().min(0),
  details: z.object({
    transportMode: z.string().optional(),
    distance: z.number().optional(),
    location: z.string().optional(),
    wardId: z.string().optional(),
  }).optional(),
});

export const moodLogSchema = z.object({
  mood: z.enum(["excellent", "good", "neutral", "poor", "terrible"]),
  note: z.string().max(500).optional(),
});

export const animalLogSchema = z.object({
  actions: z.array(z.object({
    type: z.enum(["rescue", "adoption", "volunteer", "donation", "education"]),
    description: z.string().min(1).max(200),
    impact: z.number().min(1).max(10),
  })).min(1).max(10),
});

export const digitalTwinSchema = z.object({
  inputConfig: z.object({
    scenario: z.string().min(1),
    variables: z.record(z.any()),
    objectives: z.array(z.string()).min(1),
    constraints: z.array(z.string()).optional(),
  }),
});

export const msmeReportSchema = z.object({
  orgId: z.string().min(1),
  monthData: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    year: z.number().int().min(2020).max(2030),
    data: z.object({
      environmental: z.object({
        energyUsage: z.number().min(0),
        wasteReduction: z.number().min(0),
        waterConservation: z.number().min(0),
        renewableEnergy: z.number().min(0),
      }),
      social: z.object({
        employeeWellness: z.number().min(0).max(100),
        communityEngagement: z.number().min(0).max(100),
        diversity: z.number().min(0).max(100),
        safety: z.number().min(0).max(100),
      }),
      governance: z.object({
        transparency: z.number().min(0).max(100),
        ethics: z.number().min(0).max(100),
        compliance: z.number().min(0).max(100),
        innovation: z.number().min(0).max(100),
      }),
    }),
  }),
});

// Game schemas
export const completeGameSchema = z.object({
  score: z.number().int().min(0),
});

export const gameParamsSchema = z.object({
  id: z.string().min(1),
});

// Subscription schemas
export const checkoutSchema = z.object({
  planId: z.string().min(1),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
});

// Webhook schemas
export const razorpayWebhookSchema = z.object({
  event: z.string().min(1),
  created_at: z.number().int(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string().min(1),
        amount: z.number().int(),
        currency: z.string(),
        status: z.string(),
        order_id: z.string().optional(),
        method: z.string().optional(),
        description: z.string().optional(),
        notes: z.record(z.string()).optional(),
      }),
    }),
  }),
});

// Monitoring schemas
export const logActivitySchema = z.object({
  action: z.string().min(1).max(100),
  details: z.record(z.any()).optional(),
});

export const logErrorSchema = z.object({
  module: z.string().min(1).max(50),
  errorType: z.string().min(1).max(50),
  message: z.string().min(1).max(500),
  stackTrace: z.string().optional(),
});

export const recordMetricSchema = z.object({
  metricType: z.string().min(1).max(50),
  value: z.number(),
  context: z.record(z.any()).optional(),
});

export const fraudAlertSchema = z.object({
  userId: z.string().min(1),
  action: z.string().min(1).max(100),
  reason: z.string().min(1).max(200),
});

// Integration schemas
export const sendNotificationSchema = z.object({
  userId: z.string().min(1),
  channel: z.enum(["email", "sms", "push"]),
  templateId: z.string().min(1),
  variables: z.record(z.string()).optional(),
});

export const dispatchRedemptionSchema = z.object({
  redemptionId: z.string().min(1),
});

export const reverseGeocodeSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  actionId: z.string().min(1),
});

export const partnerWebhookSchema = z.object({
  partnerId: z.string().min(1),
  event: z.string().min(1),
  data: z.record(z.any()),
  signature: z.string().min(1),
  timestamp: z.number().int(),
});

// Admin schemas
export const auditLogsSchema = paginationSchema.extend({
  filters: z.object({
    userId: z.string().optional(),
    actionType: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }).optional(),
});

export const reverseTransactionSchema = z.object({
  logId: z.string().min(1),
});

export const analyticsSchema = z.object({
  timeRange: z.enum(["24h", "7d", "30d"]).default("7d"),
  module: z.string().optional(),
});

export const exportAnalyticsSchema = analyticsSchema.extend({
  format: z.enum(["csv", "pdf"]).default("csv"),
});

// Dashboard schemas
export const entityDashboardSchema = z.object({
  type: z.enum(["school", "msme"]),
  id: z.string().min(1),
});

export const governmentWardSchema = z.object({
  wardId: z.string().min(1),
});

// Query parameter schemas
export const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  timeRange: z.enum(["24h", "7d", "30d"]).optional(),
  format: z.enum(["csv", "pdf"]).optional(),
  module: z.string().optional(),
  type: z.string().optional(),
  id: z.string().optional(),
  wardId: z.string().optional(),
});

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) =>
        `${err.path.join(".")}: ${err.message}`
      ).join(", ");
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}

// Request validation middleware factory
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validateInput(schema, req.body);
      (req as any).validatedData = validatedData;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        message: error instanceof Error ? error.message : "Invalid input data",
      });
    }
  };
}

// Query parameter validation middleware
export function createQueryValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validatedQuery = validateInput(schema, req.query);
      req.validatedQuery = validatedQuery;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Query validation failed",
        message: error instanceof Error ? error.message : "Invalid query parameters",
      });
    }
  };
}
