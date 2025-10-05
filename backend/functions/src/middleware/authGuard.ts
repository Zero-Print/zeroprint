/**
 * Auth Guard Middleware
 * Validates JWT tokens and protects routes
 */

import {Request, Response, NextFunction} from "express";
import {auth} from "../lib/firebase";
import {DecodedIdToken} from "firebase-admin/auth";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

// Auth guard for protected routes
export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({
        success: false,
        error: "Authorization header required",
        message: "Please provide a valid authorization token",
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ") ?
      authHeader.substring(7) :
      authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Invalid authorization format",
        message: "Authorization header must be in format \"Bearer <token>\"",
      });
    }

    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);

    // Add user to request
    req.user = decodedToken;

    next();
    return;
  } catch (error) {
    console.error("Auth guard error:", error);

    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        return res.status(401).json({
          success: false,
          error: "Token expired",
          message: "Your session has expired. Please sign in again.",
        });
      }

      if (error.message.includes("invalid")) {
        return res.status(401).json({
          success: false,
          error: "Invalid token",
          message: "Invalid authorization token. Please sign in again.",
        });
      }
    }

    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: "Unable to verify your identity. Please sign in again.",
    });
  }
};

// Admin role guard
export const adminGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "Please sign in to access this resource",
      });
    }

    // Check if user has admin role
    const customClaims = req.user.custom_claims || {};
    const userRole = customClaims.role || "citizen";

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        message: "Admin access required for this resource",
      });
    }

    next();
    return;
  } catch (error) {
    console.error("Admin guard error:", error);
    return res.status(500).json({
      success: false,
      error: "Authorization check failed",
      message: "Unable to verify your permissions",
    });
  }
};

// Role-based guard factory
export const roleGuard = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          message: "Please sign in to access this resource",
        });
      }

      const customClaims = req.user.custom_claims || {};
      const userRole = customClaims.role || "citizen";

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
      return;
    } catch (error) {
      console.error("Role guard error:", error);
      return res.status(500).json({
        success: false,
        error: "Authorization check failed",
        message: "Unable to verify your permissions",
      });
    }
  };
};

// Optional auth guard (doesn't fail if no token)
export const optionalAuthGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && typeof authHeader === "string") {
      const token = authHeader.startsWith("Bearer ") ?
        authHeader.substring(7) :
        authHeader;

      if (token) {
        try {
          const decodedToken = await auth.verifyIdToken(token);
          req.user = decodedToken;
        } catch (error) {
          // Ignore token verification errors for optional auth
          console.warn("Optional auth token verification failed:", error);
        }
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth guard error:", error);
    next(); // Continue even if auth fails
  }
};
