/**
 * API Response Utility
 * Unified response envelope for all API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiResponse {
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(error: string, code?: string, message?: string): ApiResponse {
    return {
      success: false,
      error: code || error,
      message: message || error,
    };
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
    message?: string
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      pagination,
      message,
    };
  }

  static validationError(errors: string[]): ApiResponse {
    return {
      success: false,
      error: "Validation failed",
      message: errors.join(", "),
    };
  }

  static authError(message: string = "Authentication required"): ApiResponse {
    return {
      success: false,
      error: "AUTH_REQUIRED",
      message,
    };
  }

  static forbiddenError(message: string = "Insufficient permissions"): ApiResponse {
    return {
      success: false,
      error: "FORBIDDEN",
      message,
    };
  }

  static notFoundError(message: string = "Resource not found"): ApiResponse {
    return {
      success: false,
      error: "NOT_FOUND",
      message,
    };
  }

  static conflictError(message: string = "Resource conflict"): ApiResponse {
    return {
      success: false,
      error: "CONFLICT",
      message,
    };
  }

  static rateLimitError(message: string = "Rate limit exceeded"): ApiResponse {
    return {
      success: false,
      error: "RATE_LIMIT",
      message,
    };
  }

  static serverError(message: string = "Internal server error"): ApiResponse {
    return {
      success: false,
      error: "SERVER_ERROR",
      message,
    };
  }
}

// Convenience exports
export const ok = ApiResponse.success;
export const err = ApiResponse.error;
