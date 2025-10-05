/**
 * Tracker Routes
 * POST /trackers/carbon, POST /trackers/mood, POST /trackers/animal,
 * POST /trackers/digital-twin, POST /trackers/msme/report
 */

import {Router, Request, Response} from "express";
import {trackersService} from "../../services/trackersService";
import {createValidationMiddleware,
  carbonLogSchema,
  moodLogSchema,
  animalLogSchema,
  digitalTwinSchema,
  msmeReportSchema,
} from "../../lib/validationSchemas";
import {ApiResponse} from "../../lib/apiResponse";
// import { loggingService } from '../../services/loggingService'; // Unused

const router = Router();

// POST /trackers/carbon
router.post("/carbon",
  createValidationMiddleware(carbonLogSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json(ApiResponse.error("User not authenticated", "AUTH_REQUIRED"));
      }

      const {actionType, value, details} = (req as any).validatedData;

      const result = await trackersService.logCarbonAction(userId, actionType, `Carbon action: ${actionType}`, value, 1, "kg", details);

      return res.json(ApiResponse.success(result));
    } catch (error) {
      console.error("Carbon log error:", error);
      return res.status(400).json(ApiResponse.error(
        (error as Error).message || "Failed to log carbon action",
        "CARBON_LOG_ERROR"
      ));
    }
  }
);

// POST /trackers/mood
router.post("/mood",
  createValidationMiddleware(moodLogSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json(ApiResponse.error("User not authenticated", "AUTH_REQUIRED"));
      }

      const {mood, note} = (req as any).validatedData;

      // Convert mood enum to number (1-5)
      const moodNumber = ["terrible", "poor", "neutral", "good", "excellent"].indexOf(mood) + 1;
      const energy = 3; // Default energy level
      const stress = 3; // Default stress level

      const result = await trackersService.logMoodCheckIn(userId, moodNumber, energy, stress, note);

      return res.json(ApiResponse.success(result));
    } catch (error) {
      console.error("Mood log error:", error);
      return res.status(400).json(ApiResponse.error(
        (error as Error).message || "Failed to log mood",
        "MOOD_LOG_ERROR"
      ));
    }
  }
);

// POST /trackers/animal
router.post("/animal",
  createValidationMiddleware(animalLogSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json(ApiResponse.error("User not authenticated", "AUTH_REQUIRED"));
      }

      const {actions} = (req as any).validatedData;

      // Process each action
      const results = [];
      for (const action of actions) {
        const result = await trackersService.logAnimalWelfareAction(
          userId,
          action.type,
          "animal_welfare",
          action.impact,
          action.description
        );
        results.push(result);
      }

      return res.json(ApiResponse.success(results));
    } catch (error) {
      console.error("Animal log error:", error);

      return res.status(400).json(ApiResponse.error(
        (error as Error).message || "Failed to log animal actions",
        "ANIMAL_LOG_ERROR"
      ));
    }
  }
);

// POST /trackers/digital-twin
router.post("/digital-twin",
  createValidationMiddleware(digitalTwinSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json(ApiResponse.error("User not authenticated", "AUTH_REQUIRED"));
      }

      const {inputConfig} = (req as any).validatedData;

      const result = await trackersService.createDigitalTwinSimulation(userId, "sustainability", inputConfig, {});

      return res.json(ApiResponse.success(result));
    } catch (error) {
      console.error("Digital twin error:", error);
      return res.status(400).json(ApiResponse.error(
        (error as Error).message || "Failed to run digital twin simulation",
        "DIGITAL_TWIN_ERROR"
      ));
    }
  }
);

// POST /trackers/msme/report
router.post("/msme/report",
  createValidationMiddleware(msmeReportSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json(ApiResponse.error("User not authenticated", "AUTH_REQUIRED"));
      }

      const {orgId, monthData} = (req as any).validatedData;

      const result = await trackersService.createMSMEReport(userId, "monthly", {orgId, monthData});

      return res.json(ApiResponse.success(result));
    } catch (error) {
      console.error("MSME report error:", error);
      return res.status(400).json(ApiResponse.error(
        (error as Error).message || "Failed to generate MSME report",
        "MSME_REPORT_ERROR"
      ));
    }
  }
);

export default router;
