import {Request, Response} from "express";
import {DataExportService} from "../services/dataExportService";
import {AccountDeletionService} from "../services/accountDeletionService";
import {validateAuth} from "../middleware/auth";

const dataExportService = new DataExportService();
const accountDeletionService = new AccountDeletionService();

export const exportData = async (req: Request, res: Response) => {
  try {
    const {uid} = await validateAuth(req);
    const {dataTypes, format = "json"} = req.body;

    if (!dataTypes || !Array.isArray(dataTypes) || dataTypes.length === 0) {
      return res.status(400).json({
        error: "dataTypes is required and must be a non-empty array",
      });
    }

    const validDataTypes = ["profile", "wallet", "trackers", "activities", "games", "subscriptions"];
    const invalidTypes = dataTypes.filter((type) => !validDataTypes.includes(type));

    if (invalidTypes.length > 0) {
      return res.status(400).json({
        error: `Invalid data types: ${invalidTypes.join(", ")}`,
        validTypes: validDataTypes,
      });
    }

    const requestId = await dataExportService.requestDataExport(uid, dataTypes, format);

    return res.json({
      success: true,
      requestId,
      message: "Data export request submitted successfully",
      estimatedCompletionTime: "24-48 hours",
    });
  } catch (error) {
    console.error("Data export request failed:", error);
    return res.status(500).json({
      error: "Failed to submit data export request",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getExportRequests = async (req: Request, res: Response) => {
  try {
    const {uid} = await validateAuth(req);
    const requests = await dataExportService.getExportRequests(uid);

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Failed to get export requests:", error);
    res.status(500).json({
      error: "Failed to retrieve export requests",
    });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const {uid} = await validateAuth(req);
    const {confirmationText, reason} = req.body;

    if (!confirmationText || confirmationText !== "DELETE MY ACCOUNT") {
      return res.status(400).json({
        error: "Invalid confirmation text",
        required: "DELETE MY ACCOUNT",
      });
    }

    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    };

    const requestId = await accountDeletionService.requestAccountDeletion(
      uid,
      confirmationText,
      reason,
      metadata
    );

    return res.json({
      success: true,
      requestId,
      message: "Account deletion scheduled successfully",
      scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      gracePeriod: "30 days",
    });
  } catch (error) {
    console.error("Account deletion request failed:", error);
    return res.status(500).json({
      error: "Failed to submit account deletion request",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const cancelAccountDeletion = async (req: Request, res: Response) => {
  try {
    const {uid} = await validateAuth(req);
    const {requestId} = req.body;

    if (!requestId) {
      return res.status(400).json({
        error: "requestId is required",
      });
    }

    await accountDeletionService.cancelAccountDeletion(uid, requestId);

    return res.json({
      success: true,
      message: "Account deletion cancelled successfully",
    });
  } catch (error) {
    console.error("Account deletion cancellation failed:", error);
    return res.status(500).json({
      error: "Failed to cancel account deletion",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDeletionStatus = async (req: Request, res: Response) => {
  try {
    const {uid} = await validateAuth(req);
    const deletionRequest = await accountDeletionService.getDeletionRequest(uid);

    res.json({
      success: true,
      deletionRequest,
    });
  } catch (error) {
    console.error("Failed to get deletion status:", error);
    res.status(500).json({
      error: "Failed to retrieve deletion status",
    });
  }
};
