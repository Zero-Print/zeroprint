import {db} from "../lib/firebase";
import {logAudit} from "../lib/auditService";
import {DataExportRequest} from "../types";

export class DataExportService {
  async requestDataExport(
    userId: string,
    dataTypes: string[],
    format: "json" | "csv" = "json"
  ): Promise<string> {
    const requestId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const exportRequest: DataExportRequest = {
      requestId,
      userId,
      includeData: dataTypes,
      format,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    // Save export request
    await db.collection("exportRequests").doc(requestId).set(exportRequest);

    // Log audit trail
    await logAudit(
      "DATA_EXPORT_REQUESTED",
      userId,
      requestId,
      {},
      {
        requestId,
        dataTypes,
        format,
      },
      "DataExportService"
    );

    // Process export asynchronously
    this.processExportRequest(requestId).catch((error) => {
      console.error("Export processing failed:", error);
    });

    return requestId;
  }

  private async processExportRequest(requestId: string): Promise<void> {
    const requestRef = db.collection("exportRequests").doc(requestId);
    let request: DataExportRequest | null = null;

    try {
      // Update status to processing
      await requestRef.update({status: "processing"});

      const requestDoc = await requestRef.get();
      request = requestDoc.data() as DataExportRequest;

      if (!request) {
        throw new Error("Export request not found");
      }

      // Collect user data
      const userData = await this.collectUserData(request.userId, request.includeData);

      // Generate export file (simplified - store in Firestore for now)
      const fileName = `zeroprint-data-export-${requestId}.json`;
      const downloadUrl = `https://example.com/exports/${fileName}`; // Placeholder URL

      // Store the export data in Firestore
      await db.collection("exportData").doc(requestId).set({
        data: userData,
        fileName,
        createdAt: new Date().toISOString(),
      });

      // Update request with completion details
      await requestRef.update({
        status: "completed",
        completedAt: new Date().toISOString(),
        downloadUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Log completion
      await logAudit(
        "DATA_EXPORT_COMPLETED",
        request.userId,
        requestId,
        {},
        {
          requestId,
          fileName,
          dataTypes: request.includeData,
        },
        "DataExportService"
      );

      // Send notification email (implement email service)
      // await this.sendExportCompletionEmail(request.userId, downloadUrl);
    } catch (error) {
      console.error("Export processing failed:", error);

      await requestRef.update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Only log audit if we have the request data
      if (request) {
        await logAudit(
          "DATA_EXPORT_FAILED",
          request.userId,
          requestId,
          {},
          {
            requestId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          "DataExportService"
        );
      }
    }
  }

  private async collectUserData(userId: string, dataTypes: string[]): Promise<Record<string, any>> {
    const userData: Record<string, any> = {
      exportMetadata: {
        userId,
        exportedAt: new Date().toISOString(),
        dataTypes,
        version: "1.0",
      },
    };

    // Collect profile data
    if (dataTypes.includes("profile")) {
      const userDoc = await db.collection("users").doc(userId).get();
      userData.profile = userDoc.data();
    }

    // Collect wallet data
    if (dataTypes.includes("wallet")) {
      const walletDoc = await db.collection("wallets").doc(userId).get();
      const transactionsSnapshot = await db.collection("transactions")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      userData.wallet = {
        balance: walletDoc.data(),
        transactions: transactionsSnapshot.docs.map((doc) => doc.data()),
      };
    }

    // Collect tracker data
    if (dataTypes.includes("trackers")) {
      const carbonLogsSnapshot = await db.collection("carbonLogs")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const mentalHealthLogsSnapshot = await db.collection("mentalHealthLogs")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      userData.trackers = {
        carbonLogs: carbonLogsSnapshot.docs.map((doc) => doc.data()),
        mentalHealthLogs: mentalHealthLogsSnapshot.docs.map((doc) => doc.data()),
      };
    }

    // Collect activity logs
    if (dataTypes.includes("activities")) {
      const activityLogsSnapshot = await db.collection("activityLogs")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(1000) // Limit to recent 1000 activities
        .get();

      userData.activities = activityLogsSnapshot.docs.map((doc) => doc.data());
    }

    // Collect game data
    if (dataTypes.includes("games")) {
      const gameProgressSnapshot = await db.collection("gameProgress")
        .where("userId", "==", userId)
        .get();

      userData.games = gameProgressSnapshot.docs.map((doc) => doc.data());
    }

    // Collect subscription data
    if (dataTypes.includes("subscriptions")) {
      const subscriptionsSnapshot = await db.collection("userSubscriptions")
        .where("userId", "==", userId)
        .get();

      userData.subscriptions = subscriptionsSnapshot.docs.map((doc) => doc.data());
    }

    return userData;
  }

  async getExportRequests(userId: string): Promise<DataExportRequest[]> {
    const snapshot = await db.collection("exportRequests")
      .where("userId", "==", userId)
      .orderBy("requestedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as DataExportRequest);
  }

  async getExportRequest(requestId: string, userId: string): Promise<DataExportRequest | null> {
    const doc = await db.collection("exportRequests").doc(requestId).get();
    const request = doc.data() as DataExportRequest;

    if (!request || request.userId !== userId) {
      return null;
    }

    return request;
  }
}
