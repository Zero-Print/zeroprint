import {Request, Response, NextFunction} from "express";
import {auth} from "../lib/firebase";

// Use intersection type instead of interface extension to avoid TypeScript strict checking
export type AuthenticatedRequest = Request & {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
};

// Type assertion helper for authenticated requests
export type AuthRequest = Request & {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
};

export interface AuthResult {
  uid: string;
  email?: string;
  role?: string;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({error: "No valid authorization token provided"});
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        ...decodedToken,
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: (decodedToken as any).role || "citizen",
      } as any;
      next();
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      res.status(401).json({error: "Invalid or expired token"});
      return;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({error: "Internal server error during authentication"});
    return;
  }
};

export const validateAuth = async (req: Request): Promise<AuthResult> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization token provided");
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "citizen",
    };
  } catch (tokenError) {
    throw new Error("Invalid or expired token");
  }
};
