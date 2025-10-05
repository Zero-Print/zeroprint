import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {validateAuth} from "../lib/auth";

interface GetErrorLogsRequest {
  limit?: number;
  startAfter?: string | null;
  severity?: string | null;
  source?: string | null;
  timeframe?: string | null;
}

interface CreateErrorLogRequest {
  message: string;
  stack?: string;
  source: string;
  severity?: string;
  metadata?: any;
}

interface GetErrorStatsRequest {
  timeframe?: number;
}

// Get error logs with pagination and filtering
export const getErrorLogs = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<GetErrorLogsRequest>) => {
    try {
      // Validate auth and admin role
      validateAuth(request, ["admin"]);

      const {
        limit = 20,
        startAfter = null,
        severity = null,
        source = null,
        timeframe = null,
      } = request.data;

      let query = db.collection("error-logs").orderBy("timestamp", "desc");

      // Apply filters if provided
      if (severity) {
        query = query.where("severity", "==", severity);
      }

      if (source) {
        query = query.where("source", "==", source);
      }

      if (timeframe) {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(timeframe));
        query = query.where("timestamp", ">=", date.toISOString());
      }

      // Apply pagination
      query = query.limit(limit);

      if (startAfter) {
        const startAfterDoc = await db.collection("error-logs").doc(startAfter).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {logs};
    } catch (error) {
      console.error("Error retrieving error logs:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving error logs"
      );
    }
  });

// Create a new error log entry
export const createErrorLog = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<CreateErrorLogRequest>) => {
    try {
      // This endpoint allows client-side error logging without auth
      const {message, stack, source, severity, metadata} = request.data;

      if (!message || !source) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required fields"
        );
      }

      const logData = {
        message,
        stack: stack || "",
        source,
        severity: severity || "error",
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        userId: request.auth?.uid || "anonymous",
      };

      const docRef = await db.collection("error-logs").add(logData);

      return {
        id: docRef.id,
        ...logData,
      };
    } catch (error) {
      console.error("Error creating error log:", error);
      throw new HttpsError(
        "internal",
        "Error creating error log"
      );
    }
  });

// Get error log statistics
export const getErrorStats = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<GetErrorStatsRequest>) => {
    try {
      // Validate auth and admin role
      validateAuth(request, ["admin"]);

      // Remove unused variable
      // const { timeframe = 7 } = request.data;

      // This would be implemented with aggregation queries in production
      // For now, returning mock data
      return {
        total: 156,
        bySeverity: {
          critical: 12,
          error: 45,
          warning: 99,
        },
        bySource: {
          frontend: 87,
          backend: 69,
        },
        trend: [
          {date: "2023-06-01", count: 25},
          {date: "2023-06-02", count: 18},
          {date: "2023-06-03", count: 22},
          {date: "2023-06-04", count: 15},
          {date: "2023-06-05", count: 30},
          {date: "2023-06-06", count: 28},
          {date: "2023-06-07", count: 18},
        ],
      };
    } catch (error) {
      console.error("Error retrieving error stats:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving error statistics"
      );
    }
  });
