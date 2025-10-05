/**
 * Games HTTP Routes
 * Handles game-related API endpoints
 */

import {Router, Request, Response} from "express";
import {gamesService} from "../../services/gamesService";
import {ApiResponse} from "../../lib/apiResponse";
import {authGuard} from "../../middleware/authGuard";

const router = Router();

// GET /games - Get all available games
router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await gamesService.getGames();
    res.json(response);
  } catch (error) {
    console.error("Get games error:", error);
    res.status(500).json(ApiResponse.error("Failed to fetch games"));
  }
});

// GET /games/:id - Get specific game with configuration
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const response = await gamesService.getGame(id);
    res.json(response);
  } catch (error) {
    console.error("Get game error:", error);
    res.status(500).json(ApiResponse.error("Failed to fetch game"));
  }
});

// Apply auth guard to protected routes
router.use(authGuard);

// POST /games/:id/complete - Complete a game
router.post("/:id/complete", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const {id} = req.params;
    const {score, clientData, playTime} = req.body;

    // Validate input
    if (typeof score !== "number" || score < 0) {
      return res.status(400).json(ApiResponse.error("Invalid score", "400"));
    }

    if (typeof playTime !== "number" || playTime < 0) {
      return res.status(400).json(ApiResponse.error("Invalid play time", "400"));
    }

    if (!clientData || typeof clientData !== "object") {
      return res.status(400).json(ApiResponse.error("Client data is required", "400"));
    }

    const response = await gamesService.completeGame(userId, id, clientData, playTime);
    return res.json(response);
  } catch (error) {
    console.error("Complete game error:", error);
    return res.status(500).json(ApiResponse.error("Failed to complete game"));
  }
});

// GET /games/history - Get user's game history
router.get("/history", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const response = await gamesService.getGameHistory(userId, page, limit);
    return res.json(response);
  } catch (error) {
    console.error("Get game history error:", error);
    return res.status(500).json(ApiResponse.error("Failed to fetch game history"));
  }
});

// GET /games/:id/leaderboard - Get game leaderboard
router.get("/:id/leaderboard", async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const response = await gamesService.getLeaderboard(id, limit);
    return res.json(response);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return res.status(500).json(ApiResponse.error("Failed to fetch leaderboard"));
  }
});

export default router;
