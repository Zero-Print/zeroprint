import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {validateAuth} from "../lib/auth";

interface GetDeployLogsRequest {
  limit?: number;
  startAfter?: string | null;
}

interface CreateDeployLogRequest {
  version: string;
  environment: string;
  changes?: any[];
  status: string;
}

interface GetDeployLogByIdRequest {
  id: string;
}

// Get deploy logs with pagination
export const getDeployLogs = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<GetDeployLogsRequest>) => {
    try {
      // Validate auth and admin role
      validateAuth(request, ["admin"]);

      const {limit = 20, startAfter = null} = request.data;

      let query = db.collection("deploy-logs")
        .orderBy("timestamp", "desc")
        .limit(limit);

      if (startAfter) {
        const startAfterDoc = await db.collection("deploy-logs").doc(startAfter).get();
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
      console.error("Error retrieving deploy logs:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving deploy logs"
      );
    }
  });

// Create a new deploy log entry
export const createDeployLog = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<CreateDeployLogRequest>) => {
    try {
      // Validate auth and admin role
      validateAuth(request, ["admin"]);

      const {version, environment, changes, status} = request.data;

      if (!version || !environment || !status) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required fields"
        );
      }

      const logData = {
        version,
        environment,
        changes: changes || [],
        status,
        timestamp: new Date().toISOString(),
        deployedBy: request.auth?.uid || "system",
      };

      const docRef = await db.collection("deploy-logs").add(logData);

      return {
        id: docRef.id,
        ...logData,
      };
    } catch (error) {
      console.error("Error creating deploy log:", error);
      throw new HttpsError(
        "internal",
        "Error creating deploy log"
      );
    }
  });

// Get a specific deploy log by ID
export const getDeployLogById = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<GetDeployLogByIdRequest>) => {
    try {
      // Validate auth and admin role
      validateAuth(request, ["admin"]);

      const {id} = request.data;

      if (!id) {
        throw new HttpsError(
          "invalid-argument",
          "Missing log ID"
        );
      }

      const docRef = await db.collection("deploy-logs").doc(id).get();

      if (!docRef.exists) {
        throw new HttpsError(
          "not-found",
          "Deploy log not found"
        );
      }

      return {
        id: docRef.id,
        ...docRef.data(),
      };
    } catch (error) {
      console.error("Error retrieving deploy log:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving deploy log"
      );
    }
  });
