/**
 * HTTP handlers - thin orchestration layer
 * All handlers delegate to services and handle responses
 */

import {Request, Response} from "express";
import {ApiResponse} from "../lib/apiResponse";
// import { authGuard } from '../middleware/authGuard';

// Import services
import {AuthService} from "../services/authService";
import {walletService} from "../services/walletService";
// import { trackersService } from '../services/trackersService';
// import { gamesService } from '../services/gamesService';
// import { subscriptionsService } from '../services/subscriptionsService';
import {rewardsService} from "../services/rewardsService";
import {dashboardService} from "../services/dashboardService";
import {monitoringService} from "../services/monitoringService";
import {integrationService} from "../services/integrationService";
import {adminService} from "../services/adminService";
import {CarbonService} from "../services/carbonService";
import {GameService} from "../services/gameService";
import {SubscriptionService} from "../services/subscriptionService";
import {errorHandler} from "../middleware/errorHandler";

// Service instances
const authService = new AuthService();
const carbonService = new CarbonService();
const gameService = new GameService();
const subscriptionService = new SubscriptionService();

/**
 * Auth Handlers
 */
export const authHandlers = {
  signup: async (req: Request, res: Response) => {
    try {
      const {email, password, userData} = req.body;
      const result = await authService.signup(email, password, userData);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const {email, password} = req.body;
      const result = await authService.login(email, password);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const result = await authService.getProfile(userId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const result = await authService.updateProfile(userId, req.body);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Wallet Handlers
 */
export const walletHandlers = {
  getBalance: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const result = await walletService.getBalance(userId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getTransactions: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await walletService.getTransactions(userId, page, limit);
      res.json(ApiResponse.success(result.data, result.pagination));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  earnCoins: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {gameId, coins} = req.body;
      const result = await walletService.earnCoins(userId, gameId, coins);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  redeemCoins: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {amount, rewardId} = req.body;
      const result = await walletService.redeemCoins(userId, amount, rewardId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Tracker Handlers
 */
export const trackerHandlers = {
  logCarbon: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {actionType, value, details} = req.body;
      const result = await carbonService.logAction(userId, actionType, value, details);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  logMood: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {mood, note} = req.body;
      const result = await carbonService.logMood(userId, mood, note);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  logAnimal: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {actions} = req.body;
      const result = await carbonService.logAnimalActions(userId, actions);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  runDigitalTwin: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {inputConfig} = req.body;
      const result = await carbonService.runDigitalTwin(userId, inputConfig);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  generateMSMEReport: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {orgId, monthData} = req.body;
      const result = await carbonService.generateMSMEReport(userId, orgId, monthData);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Game Handlers
 */
export const gameHandlers = {
  getGames: async (req: Request, res: Response) => {
    try {
      const result = await gameService.getGames();
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getGame: async (req: Request, res: Response) => {
    try {
      const {id} = req.params;
      const result = await gameService.getGame(id);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  completeGame: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {id} = req.params;
      const {score} = req.body;
      const result = await gameService.completeGame(userId, id, score);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Subscription Handlers
 */
export const subscriptionHandlers = {
  getPlans: async (req: Request, res: Response) => {
    try {
      const result = await subscriptionService.getPlans();
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  checkout: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {planId} = req.body;
      const result = await subscriptionService.checkout(userId, planId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  cancel: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {subscriptionId} = req.body;
      const result = await subscriptionService.cancel(userId, subscriptionId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getStatus: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const result = await subscriptionService.getStatus(userId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Rewards Handlers
 */
export const rewardsHandlers = {
  getRewards: async (req: Request, res: Response) => {
    try {
      const result = await rewardsService.getRewards();
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getReward: async (req: Request, res: Response) => {
    try {
      const {id} = req.params;
      const result = await rewardsService.getReward(id);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getRedemptions: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await rewardsService.getRedemptions(userId, page, limit);
      res.json(ApiResponse.success(result.data, result.pagination));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Dashboard Handlers
 */
export const dashboardHandlers = {
  getCitizen: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const result = await dashboardService.getCitizenDashboard(userId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getEntity: async (req: Request, res: Response) => {
    try {
      const {type, id} = req.query;
      if (!type || !id) throw new Error("Missing type or id parameter");

      const result = await dashboardService.getEntityDashboard(type as string, id as string);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getGovernment: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const result = await dashboardService.getGovernmentDashboard(userId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getGovernmentWard: async (req: Request, res: Response) => {
    try {
      const {wardId} = req.params;
      const result = await dashboardService.getGovernmentDashboard(wardId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getAdmin: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const result = await dashboardService.getAdminDashboard(userId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Monitoring Handlers
 */
export const monitoringHandlers = {
  logActivity: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {action, details} = req.body;
      await monitoringService.logActivity(userId, action, details);
      res.json(ApiResponse.success({}));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  logError: async (req: Request, res: Response) => {
    try {
      const {module, errorType, message, stackTrace} = req.body;
      const userId = req.user?.uid;

      await monitoringService.logError(module, errorType, message, stackTrace, userId);
      res.json(ApiResponse.success({}));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  recordMetric: async (req: Request, res: Response) => {
    try {
      const {metricType, value, context} = req.body;
      await monitoringService.recordMetric(metricType, value, context);
      res.json(ApiResponse.success({}));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getAnalytics: async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || "7d";
      const result = await monitoringService.getAnalytics(timeRange);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Integration Handlers
 */
export const integrationHandlers = {
  sendNotification: async (req: Request, res: Response) => {
    try {
      const {payload} = req.body;
      const result = await integrationService.sendNotification(payload);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  dispatchRedemption: async (req: Request, res: Response) => {
    try {
      const {redemptionId} = req.body;
      const result = await integrationService.dispatchRedemption(redemptionId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  reverseGeocode: async (req: Request, res: Response) => {
    try {
      const {lat, lng, actionId} = req.body;
      const result = await integrationService.reverseGeocode(lat, lng, actionId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};

/**
 * Admin Handlers
 */
export const adminHandlers = {
  getAuditLogs: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = req.body || {};

      const result = await adminService.getAuditLogs(userId, page, limit, filters);
      res.json(ApiResponse.success(result.data, result.pagination));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getErrorLogs: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminService.getErrorLogs(userId, page, limit);
      res.json(ApiResponse.success(result.data, result.pagination));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getActivityLogs: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminService.getActivityLogs(userId, page, limit);
      res.json(ApiResponse.success(result.data, result.pagination));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  reverseTransaction: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const {logId} = req.body;
      const result = await adminService.reverseTransaction(userId, logId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getDeployLogs: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminService.getDeployLogs(userId, page, limit);
      res.json(ApiResponse.success(result.data, result.pagination));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  getAnalytics: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const timeRange = req.query.timeRange as string || "7d";
      const result = await adminService.getAnalytics(userId, timeRange);
      res.json(ApiResponse.success(result));
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },

  exportAnalytics: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) throw new Error("User not authenticated");

      const timeRange = req.query.timeRange as string || "7d";
      const format = req.query.format as string || "csv";

      const result = await adminService.exportAnalytics(userId, timeRange, format);

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="analytics-${timeRange}.csv"`);
        res.send(result);
      } else if (format === "pdf") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="analytics-${timeRange}.pdf"`);
        res.send(result);
      } else {
        res.json(ApiResponse.success(result));
      }
    } catch (error) {
      errorHandler.handleError(error as any, req, res, () => {});
    }
  },
};
