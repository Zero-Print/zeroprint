import * as functions from "firebase-functions";

/**
 * Utility functions for backend operations
 */

/**
 * Formats a response object with standardized structure
 * @param data The data to include in the response
 * @param message Optional message to include
 * @returns Formatted response object
 */
export const formatResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message: message || "Operation successful",
    timestamp: new Date().toISOString(),
  };
};

/**
 * Formats an error response with standardized structure
 * @param error The error object or message
 * @param code Optional HTTP status code
 * @returns Formatted error response
 */
export const formatErrorResponse = (error: any, code = 500) => {
  const message = error instanceof Error ? error.message : String(error);

  return {
    success: false,
    error: {
      message,
      code,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Validates required fields in a request
 * @param data The request data object
 * @param requiredFields Array of required field names
 * @throws HttpsError if any required fields are missing
 */
export const validateRequiredFields = (data: any, requiredFields: string[]): void => {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Missing required fields: ${missingFields.join(", ")}`
    );
  }
};

/**
 * Generates a unique ID with optional prefix
 * @param prefix Optional prefix for the ID
 * @returns Unique ID string
 */
export const generateId = (prefix = ""): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
};

/**
 * Safely parses JSON with error handling
 * @param jsonString The JSON string to parse
 * @param fallback Optional fallback value if parsing fails
 * @returns Parsed object or fallback value
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
};

/**
 * Calculates date range based on timeframe string
 * @param timeframe The timeframe string (day, week, month, year)
 * @returns Object with start and end dates
 */
export const getDateRangeFromTimeframe = (timeframe: string): { startDate: Date, endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeframe) {
  case "day":
    startDate.setDate(endDate.getDate() - 1);
    break;
  case "week":
    startDate.setDate(endDate.getDate() - 7);
    break;
  case "month":
    startDate.setMonth(endDate.getMonth() - 1);
    break;
  case "year":
    startDate.setFullYear(endDate.getFullYear() - 1);
    break;
  default:
    // Default to week if invalid timeframe
    startDate.setDate(endDate.getDate() - 7);
  }

  return {startDate, endDate};
};
