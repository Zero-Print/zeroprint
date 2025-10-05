/**
 * Dashboard HTTP Routes
 * Handles all dashboard-related API endpoints
 */

import {Router, Request, Response} from "express";
import {dashboardService} from "../../services/dashboardService";
import {exportService} from "../../services/exportService";
import {ApiResponse} from "../../lib/apiResponse";
import {authGuard, adminGuard} from "../../middleware/authGuard";
import {db} from "../../lib/firebase";
import * as fs from "fs";

const router = Router();

// Apply auth guard to all dashboard routes
router.use(authGuard);

// Citizen Dashboard Routes
router.get("/citizen", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const response = await dashboardService.getCitizenDashboard(userId);
    return res.json(response);
  } catch (error) {
    console.error("Citizen dashboard error:", error);
    return res.status(500).json(ApiResponse.error("Failed to fetch citizen dashboard"));
  }
});

// TODO: Implement getCitizenEcoScore method in DashboardService
// router.get('/citizen/ecoscore', async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.uid;
//     if (!userId) {
//       return res.status(401).json(ApiResponse.error('User not authenticated', '401'));
//     }

//     const response = await dashboardService.getCitizenEcoScore(userId);
//     return res.json(response);
//   } catch (error) {
//     console.error('Citizen eco score error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch eco score'));
//   }
// });

// TODO: Implement getCitizenTrends method in DashboardService
// router.get('/citizen/trends', async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.uid;
//     if (!userId) {
//       return res.status(401).json(ApiResponse.error('User not authenticated', '401'));
//     }

//     const timeRange = req.query.timeRange as string || '7d';
//     const response = await dashboardService.getCitizenTrends(userId, timeRange);
//     return res.json(response);
//   } catch (error) {
//     console.error('Citizen trends error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch trends'));
//   }
// });

// TODO: Implement getCitizenDigitalTwin method in DashboardService
// router.get('/citizen/digital-twin', async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.uid;
//     if (!userId) {
//       return res.status(401).json(ApiResponse.error('User not authenticated', '401'));
//     }

//     const response = await dashboardService.getCitizenDigitalTwin(userId);
//     return res.json(response);
//   } catch (error) {
//     console.error('Citizen digital twin error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch digital twin'));
//   }
// });

// TODO: Implement getCitizenActivity method in DashboardService
// router.get('/citizen/activity', async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.uid;
//     if (!userId) {
//       return res.status(401).json(ApiResponse.error('User not authenticated', '401'));
//     }

//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 20;

//     const response = await dashboardService.getCitizenActivity(userId, { page, limit });
//     return res.json(response);
//   } catch (error) {
//     console.error('Citizen activity error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch activity'));
//   }
// });

// TODO: Implement getCitizenLeaderboards method in DashboardService
// router.get('/citizen/leaderboards', async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.uid;
//     if (!userId) {
//       return res.status(401).json(ApiResponse.error('User not authenticated', '401'));
//     }

//     const response = await dashboardService.getCitizenLeaderboards(userId);
//     return res.json(response);
//   } catch (error) {
//     console.error('Citizen leaderboards error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch leaderboards'));
//   }
// });

// Entity Dashboard Routes
router.get("/entity/:type/:id", async (req: Request, res: Response) => {
  try {
    const {type} = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    if (!["school", "msme"].includes(type)) {
      return res.status(400).json(ApiResponse.error("Invalid entity type", "400"));
    }

    const response = await dashboardService.getEntityDashboard(userId, type as "school" | "msme");
    return res.json(response);
  } catch (error) {
    console.error("Entity dashboard error:", error);
    return res.status(500).json(ApiResponse.error("Failed to fetch entity dashboard"));
  }
});

// TODO: Implement getEntityKPIs method in DashboardService
// router.get('/entity/:type/:id/kpis', async (req: Request, res: Response) => {
//   try {
//     const { type, id } = req.params;

//     if (!['school', 'msme'].includes(type)) {
//       return res.status(400).json(ApiResponse.error('Invalid entity type', '400'));
//     }

//     const response = await dashboardService.getEntityKPIs(type as 'school' | 'msme', id);
//     res.json(response);
//   } catch (error) {
//     console.error('Entity KPIs error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch entity KPIs'));
//   }
// });

// TODO: Implement getEntityLeaderboard method in DashboardService
// router.get('/entity/:type/:id/leaderboard', async (req: Request, res: Response) => {
//   try {
//     const { type, id } = req.params;
//     const leaderboardType = req.query.type as string || 'class';

//     if (!['school', 'msme'].includes(type)) {
//       return res.status(400).json(ApiResponse.error('Invalid entity type', '400'));
//     }

//     const response = await dashboardService.getEntityLeaderboard(
//       type as 'school' | 'msme',
//       id,
//       leaderboardType as 'class' | 'unit' | 'department'
//     );
//     res.json(response);
//   } catch (error) {
//     console.error('Entity leaderboard error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch entity leaderboard'));
//   }
// });

// TODO: Implement getEntityGameHeatmap method in DashboardService
// router.get('/entity/:type/:id/game-heatmap', async (req: Request, res: Response) => {
//   try {
//     const { type, id } = req.params;

//     if (!['school', 'msme'].includes(type)) {
//       return res.status(400).json(ApiResponse.error('Invalid entity type', '400'));
//     }

//     const response = await dashboardService.getEntityGameHeatmap(type as 'school' | 'msme', id);
//     res.json(response);
//   } catch (error) {
//     console.error('Entity game heatmap error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch game heatmap'));
//   }
// });

// TODO: Implement getEntityESGReport method in DashboardService
// router.get('/entity/:type/:id/esg-report', async (req: Request, res: Response) => {
//   try {
//     const { type, id } = req.params;
//     const format = req.query.format as string || 'pdf';

//     if (!['school', 'msme'].includes(type)) {
//       return res.status(400).json(ApiResponse.error('Invalid entity type', '400'));
//     }

//     if (!['pdf', 'csv'].includes(format)) {
//       return res.status(400).json(ApiResponse.error('Invalid format', '400'));
//     }

//     const response = await dashboardService.getEntityESGReport(
//       type as 'school' | 'msme',
//       id,
//       format as 'pdf' | 'csv'
//     );
//     res.json(response);
//   } catch (error) {
//     console.error('Entity ESG report error:', error);
//     res.status(500).json(ApiResponse.error('Failed to generate ESG report'));
//   }
// });

// Government Dashboard Routes
router.get("/government", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const response = await dashboardService.getGovernmentDashboard(userId);
    return res.json(response);
  } catch (error) {
    console.error("Government dashboard error:", error);
    return res.status(500).json(ApiResponse.error("Failed to fetch government dashboard"));
  }
});

// TODO: Implement getWardSelector method in DashboardService
// router.get('/government/ward-selector', async (req: Request, res: Response) => {
//   try {
//     const response = await dashboardService.getWardSelector();
//     res.json(response);
//   } catch (error) {
//     console.error('Ward selector error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch ward selector'));
//   }
// });

// TODO: Implement getGeoJSONHeatmap method in DashboardService
// router.get('/government/geojson-heatmap', async (req: Request, res: Response) => {
//   try {
//     const wardId = req.query.wardId as string;
//     const response = await dashboardService.getGeoJSONHeatmap(wardId);
//     res.json(response);
//   } catch (error) {
//     console.error('GeoJSON heatmap error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch GeoJSON heatmap'));
//   }
// });

// TODO: Implement getGovernmentKPIs method in DashboardService
// router.get('/government/kpis', async (req: Request, res: Response) => {
//   try {
//     const wardId = req.query.wardId as string;
//     const response = await dashboardService.getGovernmentKPIs(wardId);
//     res.json(response);
//   } catch (error) {
//     console.error('Government KPIs error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch government KPIs'));
//   }
// });

// TODO: Implement getScenarioSimulations method in DashboardService
// router.get('/government/scenario-simulations', async (req: Request, res: Response) => {
//   try {
//     const response = await dashboardService.getScenarioSimulations();
//     res.json(response);
//   } catch (error) {
//     console.error('Scenario simulations error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch scenario simulations'));
//   }
// });

// TODO: Implement runScenarioSimulation method in DashboardService
// router.post('/government/run-simulation', async (req: Request, res: Response) => {
//   try {
//     const { scenarioId, parameters } = req.body;

//     if (!scenarioId) {
//       return res.status(400).json(ApiResponse.error('Scenario ID is required', '400'));
//     }

//     const response = await dashboardService.runScenarioSimulation(scenarioId, parameters);
//     res.json(response);
//   } catch (error) {
//     console.error('Run simulation error:', error);
//     res.status(500).json(ApiResponse.error('Failed to run simulation'));
//   }
// });

// Admin Dashboard Routes (require admin role)
router.use("/admin", adminGuard);

router.get("/admin", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const response = await dashboardService.getAdminDashboard(userId);
    return res.json(response);
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json(ApiResponse.error("Failed to fetch admin dashboard"));
  }
});

// TODO: Implement getAdminUsers method in DashboardService
// router.get('/admin/users', async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;
//     const filters = req.query;

//     const response = await dashboardService.getAdminUsers({ page, limit }, filters);
//     res.json(response);
//   } catch (error) {
//     console.error('Admin users error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch admin users'));
//   }
// });

// TODO: Implement getAdminConfigs method in DashboardService
// router.get('/admin/configs', async (req: Request, res: Response) => {
//   try {
//     const response = await dashboardService.getAdminConfigs();
//     res.json(response);
//   } catch (error) {
//     console.error('Admin configs error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch admin configs'));
//   }
// });

// TODO: Implement getAdminRewards method in DashboardService
// router.get('/admin/rewards', async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;

//     const response = await dashboardService.getAdminRewards({ page, limit });
//     res.json(response);
//   } catch (error) {
//     console.error('Admin rewards error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch admin rewards'));
//   }
// });

// TODO: Implement getAdminTransactions method in DashboardService
// router.get('/admin/transactions', async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;
//     const filters = req.query;

//     const response = await dashboardService.getAdminTransactions({ page, limit }, filters);
//     res.json(response);
//   } catch (error) {
//     console.error('Admin transactions error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch admin transactions'));
//   }
// });

// TODO: Implement reverseTransaction method in DashboardService
// router.post('/admin/reverse-transaction', async (req: Request, res: Response) => {
//   try {
//     const { transactionId, reason } = req.body;

//     if (!transactionId || !reason) {
//       return res.status(400).json(ApiResponse.error('Transaction ID and reason are required', '400'));
//     }

//     const response = await dashboardService.reverseTransaction(transactionId, reason);
//     res.json(response);
//   } catch (error) {
//     console.error('Reverse transaction error:', error);
//     res.status(500).json(ApiResponse.error('Failed to reverse transaction'));
//   }
// });

// TODO: Implement getAdminErrorStats method in DashboardService
// router.get('/admin/error-stats', async (req: Request, res: Response) => {
//   try {
//     const response = await dashboardService.getAdminErrorStats();
//     res.json(response);
//   } catch (error) {
//     console.error('Admin error stats error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch error stats'));
//   }
// });

// TODO: Implement getAdminDeployLogs method in DashboardService
// router.get('/admin/deploy-logs', async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;

//     const response = await dashboardService.getAdminDeployLogs({ page, limit });
//     res.json(response);
//   } catch (error) {
//     console.error('Admin deploy logs error:', error);
//     res.status(500).json(ApiResponse.error('Failed to fetch deploy logs'));
//   }
// });

// Export Routes
router.post("/export/:dashboardType", async (req: Request, res: Response) => {
  try {
    const {dashboardType} = req.params;
    const {format, filters} = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    if (!["citizen", "entity", "government", "admin"].includes(dashboardType)) {
      return res.status(400).json(ApiResponse.error("Invalid dashboard type", "400"));
    }

    if (!["csv", "pdf"].includes(format)) {
      return res.status(400).json(ApiResponse.error("Invalid format", "400"));
    }

    const response = await exportService.exportDashboardData(
      dashboardType as "citizen" | "entity" | "government" | "admin",
      {format, filters},
      userId
    );
    return res.json(response);
  } catch (error) {
    console.error("Export dashboard error:", error);
    return res.status(500).json(ApiResponse.error("Failed to export dashboard"));
  }
});

router.get("/export/:exportId", async (req: Request, res: Response) => {
  try {
    const {exportId} = req.params;

    const exportDoc = await db.collection("exports").doc(exportId).get();

    if (!exportDoc.exists) {
      return res.status(404).json(ApiResponse.error("Export not found", "404"));
    }

    const exportData = exportDoc.data();

    if (!exportData) {
      return res.status(404).json(ApiResponse.error("Export data not found", "404"));
    }

    if (new Date() > exportData.expiresAt.toDate()) {
      return res.status(410).json(ApiResponse.error("Export has expired", "410"));
    }

    // Update download count
    await exportDoc.ref.update({
      downloadCount: (exportData.downloadCount || 0) + 1,
      lastDownloadedAt: new Date(),
    });

    // Return file
    const filePath = exportData.filePath;
    if (fs.existsSync(filePath)) {
      return res.download(filePath, exportData.filename);
    } else {
      return res.status(404).json(ApiResponse.error("File not found", "404"));
    }
  } catch (error) {
    console.error("Download export error:", error);
    return res.status(500).json(ApiResponse.error("Failed to download export"));
  }
});

export default router;
