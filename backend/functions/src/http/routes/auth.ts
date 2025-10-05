import {Router, Request, Response} from "express";
import {AuthService} from "../../services/authService";
import {
  createValidationMiddleware,
  signupSchema,
  loginSchema,
  updateProfileSchema,
} from "../../lib/validationSchemas";
import {ApiResponse} from "../../lib/apiResponse";
// import {loggingService} from "../../services/loggingService";
import {logAudit, logUserActivity} from "../../lib/auditService";
import {logSystemError} from "../../lib/errorService";

const router = Router();
const authService = new AuthService();

// Remove unused interface - using type assertion instead

// POST /auth/signup
router.post(
  "/signup",
  createValidationMiddleware(signupSchema),
  async (req: Request, res: Response) => {
    try {
      const {email, password, userData} = (req as any).validatedData;
      const result = await authService.signup(email, password, userData);

      await logAudit(
        "userSignup",
        result.userId,
        result.userId,
        {},
        {email, role: userData.role},
        "AuthService:signup"
      );

      await logUserActivity(
        result.userId,
        "userSignup",
        {email, role: userData.role},
        "auth"
      );

      return res.json(ApiResponse.success(result));
    } catch (error) {
      console.error("Signup error:", error);
      await logSystemError(
        "auth",
        "signup_failed",
        (error as Error).message,
        error as Error
      );

      return res.status(400).json(
        ApiResponse.error(
          (error as Error).message || "Signup failed",
          "SIGNUP_ERROR"
        )
      );
    }
  }
);

// POST /auth/login
router.post(
  "/login",
  createValidationMiddleware(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const {email, password} = (req as any).validatedData;
      const result = await authService.login(email, password);

      await logAudit(
        "userLogin",
        result.userId,
        result.userId,
        {},
        {email},
        "AuthService:login"
      );

      await logUserActivity(result.userId, "userLogin", {email}, "auth");

      return res.json(ApiResponse.success(result));
    } catch (error) {
      console.error("Login error:", error);
      await logSystemError(
        "auth",
        "login_failed",
        (error as Error).message,
        error as Error
      );

      return res.status(401).json(
        ApiResponse.error(
          (error as Error).message || "Login failed",
          "LOGIN_ERROR"
        )
      );
    }
  }
);

// GET /auth/profile
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res
        .status(401)
        .json(ApiResponse.error("User not authenticated", "AUTH_REQUIRED"));
    }

    const result = await authService.getProfile(userId);
    return res.json(ApiResponse.success(result));
  } catch (error) {
    console.error("Get profile error:", error);
    await logSystemError(
      "auth",
      "get_profile_failed",
      (error as Error).message,
      error as Error
    );

    return res.status(500).json(
      ApiResponse.error(
        (error as Error).message || "Failed to get profile",
        "PROFILE_ERROR"
      )
    );
  }
});

// PUT /auth/profile
router.put(
  "/profile",
  createValidationMiddleware(updateProfileSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("User not authenticated", "AUTH_REQUIRED"));
      }

      const before = await authService.getProfile(userId);
      const result = await authService.updateProfile(userId, (req as any).validatedData);

      await logAudit(
        "profileUpdate",
        userId,
        userId,
        before,
        result,
        "AuthService:updateProfile"
      );

      await logUserActivity(
        userId,
        "profileUpdated",
        {fields: Object.keys((req as any).validatedData)},
        "auth"
      );

      return res.json(ApiResponse.success(result));
    } catch (error) {
      console.error("Update profile error:", error);
      await logSystemError(
        "auth",
        "update_profile_failed",
        (error as Error).message,
        error as Error
      );

      return res.status(500).json(
        ApiResponse.error(
          (error as Error).message || "Failed to update profile",
          "PROFILE_UPDATE_ERROR"
        )
      );
    }
  }
);

export default router;
