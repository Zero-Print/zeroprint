import { z, ZodSchema, ZodError } from 'zod';

/**
 * Safely parse data with Zod schema, handling undefined/null values gracefully
 */
export function safeParse<T>(
  schema: ZodSchema<T>,
  data: unknown,
  fallback?: T
): { success: true; data: T } | { success: false; error: string; data?: T } {
  try {
    // Handle undefined/null data
    if (data === undefined || data === null) {
      if (fallback !== undefined) {
        return { success: true, data: fallback };
      }
      return { 
        success: false, 
        error: 'Data is undefined or null',
        data: fallback
      };
    }

    // Attempt to parse with Zod
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      return { 
        success: false, 
        error: `Validation failed: ${errorMessage}`,
        data: fallback
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    return { 
      success: false, 
      error: errorMessage,
      data: fallback
    };
  }
}

/**
 * Parse data with Zod schema, throwing on error (for cases where you want to fail fast)
 */
export function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  if (data === undefined || data === null) {
    throw new Error('Data is undefined or null');
  }
  
  return schema.parse(data);
}

/**
 * Parse data with Zod schema, returning undefined on error
 */
export function parseOrUndefined<T>(schema: ZodSchema<T>, data: unknown): T | undefined {
  const result = safeParse(schema, data);
  return result.success ? result.data : undefined;
}

/**
 * Common validation schemas for API responses
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.enum(['citizen', 'admin', 'msme', 'school']).optional(),
  avatar: z.string().url().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const GameSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  maxScore: z.number().optional(),
  baseCoins: z.number().optional(),
  features: z.array(z.string()).optional(),
  config: z.any().optional(),
});

export const WalletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  balance: z.number(),
  currency: z.string().default('HealCoins'),
  transactions: z.array(z.any()).optional(),
  lastUpdated: z.string().optional(),
});

/**
 * Utility to validate API responses
 */
export function validateApiResponse<T>(
  response: unknown,
  dataSchema?: ZodSchema<T>
): { success: boolean; data?: T; error?: string } {
  const apiResult = safeParse(ApiResponseSchema, response);
  
  if (!apiResult.success) {
    return { success: false, error: apiResult.error };
  }
  
  const apiData = apiResult.data;
  
  if (!apiData.success) {
    return { success: false, error: apiData.error || 'API request failed' };
  }
  
  if (dataSchema && apiData.data !== undefined) {
    const dataResult = safeParse(dataSchema, apiData.data);
    if (!dataResult.success) {
      return { success: false, error: dataResult.error };
    }
    return { success: true, data: dataResult.data };
  }
  
  return { success: true, data: apiData.data };
}
