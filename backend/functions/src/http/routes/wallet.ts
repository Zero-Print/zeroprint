/**
 * Wallet HTTP Routes
 * Handles wallet operations including coin redemption
 */

import {Router, Request, Response} from "express";
import {rewardsService} from "../../services/rewardsService";
import {walletService} from "../../services/walletService";
import {ApiResponse} from "../../lib/apiResponse";
import {authGuard} from "../../middleware/authGuard";

const router = Router();

// Apply auth guard to all wallet routes
router.use(authGuard);

// GET /wallet/balance - Get wallet balance
router.get("/balance", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const response = await walletService.getBalance(userId);
    return res.json(response);
  } catch (error) {
    console.error("Wallet balance error:", error);
    return res.status(500).json(ApiResponse.error("Failed to get wallet balance"));
  }
});

// GET /wallet/transactions - Get wallet transactions
router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const response = await walletService.getTransactions(userId, page, limit);
    return res.json(response);
  } catch (error) {
    console.error("Wallet transactions error:", error);
    return res.status(500).json(ApiResponse.error("Failed to get wallet transactions"));
  }
});

// POST /wallet/earn - Earn coins
router.post("/earn", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const {gameId, coins} = req.body;

    if (!gameId || !coins || coins <= 0) {
      return res.status(400).json(ApiResponse.error("Invalid earn request", "400"));
    }

    const response = await walletService.earnCoins(userId, gameId, coins);
    return res.json(response);
  } catch (error) {
    console.error("Earn coins error:", error);
    return res.status(500).json(ApiResponse.error("Failed to earn coins"));
  }
});

// POST /wallet/redeem - Redeem coins for reward
router.post("/redeem", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const {rewardId, quantity = 1} = req.body;

    if (!rewardId) {
      return res.status(400).json(ApiResponse.error("Reward ID is required", "400"));
    }

    if (quantity <= 0 || quantity > 10) {
      return res.status(400).json(ApiResponse.error("Invalid quantity (1-10)", "400"));
    }

    const response = await rewardsService.redeemReward(userId, rewardId, quantity);
    return res.json(response);
  } catch (error) {
    console.error("Redeem coins error:", error);
    return res.status(500).json(ApiResponse.error("Failed to redeem coins"));
  }
});

// GET /wallet/redemptions - Get user redemption history
router.get("/redemptions", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const response = await rewardsService.getRedemptions(userId, page, limit);
    return res.json(response);
  } catch (error) {
    console.error("Redemptions history error:", error);
    return res.status(500).json(ApiResponse.error("Failed to get redemption history"));
  }
});

// TODO: Implement transferCoins method in WalletService
// router.post('/transfer', async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.uid;
//     if (!userId) {
//       return res.status(401).json(ApiResponse.error('User not authenticated', '401'));
//     }

//     const { recipientId, amount, message } = req.body;

//     if (!recipientId || !amount || amount <= 0) {
//       return res.status(400).json(ApiResponse.error('Invalid transfer request', '400'));
//     }

//     if (amount > 1000) {
//       return res.status(400).json(ApiResponse.error('Transfer amount too high (max 1000)', '400'));
//     }

//     const response = await walletService.transferCoins(userId, recipientId, amount, message);
//     res.json(response);
//   } catch (error) {
//     console.error('Transfer coins error:', error);
//     res.status(500).json(ApiResponse.error('Failed to transfer coins'));
//   }
// });

// TODO: Implement getRedemptionLimits method in WalletService
// router.get('/limits', async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.uid;
//     if (!userId) {
//       return res.status(401).json(ApiResponse.error('User not authenticated', '401'));
//     }

//     const response = await walletService.getRedemptionLimits(userId);
//     res.json(response);
//   } catch (error) {
//     console.error('Redemption limits error:', error);
//     res.status(500).json(ApiResponse.error('Failed to get redemption limits'));
//   }
// });

export default router;
