import {db, auth, admin} from "../lib/firebase";
import {logAudit} from "../lib/auditService";
import {AccountDeletionRequest} from "../types";

export class AccountDeletionService {
  private readonly DELETION_GRACE_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days

  async requestAccountDeletion(
    userId: string,
    confirmationText: string,
    reason?: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<string> {
    // Verify user exists
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const requestId = `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const scheduledDeletionAt = new Date(now.getTime() + this.DELETION_GRACE_PERIOD);

    const deletionRequest: AccountDeletionRequest = {
      requestId,
      userId,
      requestedAt: now.toISOString(),
      scheduledAt: scheduledDeletionAt.toISOString(),
      status: "scheduled",
      reason,
      dataRetention: {
        auditLogs: true,
        transactions: true,
        legalCompliance: true,
      },
    };

    // Save deletion request
    await db.collection("deletionRequests").doc(requestId).set(deletionRequest);

    // Mark user account for deletion
    await db.collection("users").doc(userId).update({
      deletionScheduled: true,
      deletionRequestId: requestId,
      scheduledDeletionAt,
      updatedAt: now,
    });

    // Log audit trail
    await logAudit(
      "ACCOUNT_DELETION_REQUESTED",
      userId,
      requestId,
      {},
      {
        requestId,
        scheduledDeletionAt: scheduledDeletionAt.toISOString(),
        reason,
      },
      "AccountDeletionService"
    );

    // Schedule actual deletion (implement with Cloud Scheduler or similar)
    // await this.scheduleAccountDeletion(requestId, scheduledDeletionAt);

    return requestId;
  }

  async cancelAccountDeletion(userId: string, requestId: string): Promise<void> {
    const requestRef = db.collection("deletionRequests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new Error("Deletion request not found");
    }

    const request = requestDoc.data() as AccountDeletionRequest;
    if (request.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (request.status !== "scheduled") {
      throw new Error("Cannot cancel deletion request");
    }

    // Update deletion request
    await requestRef.update({
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    });

    // Remove deletion flag from user
    await db.collection("users").doc(userId).update({
      deletionScheduled: false,
      deletionRequestId: admin.firestore.FieldValue.delete(),
      scheduledDeletionAt: admin.firestore.FieldValue.delete(),
      updatedAt: new Date().toISOString(),
    });

    // Log cancellation
    await logAudit(
      "ACCOUNT_DELETION_CANCELLED",
      userId,
      requestId,
      {},
      {
        requestId,
      },
      "AccountDeletionService"
    );
  }

  async executeAccountDeletion(requestId: string): Promise<void> {
    const requestRef = db.collection("deletionRequests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new Error("Deletion request not found");
    }

    const request = requestDoc.data() as AccountDeletionRequest;
    const userId = request.userId;

    try {
      // Start batch deletion
      const batch = db.batch();

      // Delete user data collections
      await this.deleteUserCollections(userId, batch);

      // Mark deletion request as completed
      batch.update(requestRef, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      // Commit batch deletion
      await batch.commit();

      // Delete Firebase Auth user (do this last)
      try {
        await auth.deleteUser(userId);
      } catch (authError) {
        console.error("Failed to delete auth user:", authError);
        // Continue with deletion even if auth deletion fails
      }

      // Final audit log (this will be one of the last logs for this user)
      await logAudit(
        "ACCOUNT_DELETION_COMPLETED",
        userId,
        requestId,
        {},
        {
          requestId,
          deletedAt: new Date().toISOString(),
        },
        "AccountDeletionService"
      );

      console.log(`Account deletion completed for user: ${userId}`);
    } catch (error) {
      console.error("Account deletion failed:", error);

      await requestRef.update({
        status: "pending", // Reset to pending for retry
        error: error instanceof Error ? error.message : "Unknown error",
      });

      await logAudit(
        "ACCOUNT_DELETION_FAILED",
        userId,
        requestId,
        {},
        {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "AccountDeletionService"
      );

      throw error;
    }
  }

  private async deleteUserCollections(userId: string, batch: admin.firestore.WriteBatch): Promise<void> {
    const collections = [
      "users",
      "wallets",
      "transactions",
      "carbonLogs",
      "mentalHealthLogs",
      "gameProgress",
      "userSubscriptions",
      "activityLogs",
      "exportRequests",
    ];

    for (const collectionName of collections) {
      if (collectionName === "users") {
        // Delete user document
        batch.delete(db.collection("users").doc(userId));
      } else if (collectionName === "wallets") {
        // Delete wallet document (uses userId as doc ID)
        batch.delete(db.collection("wallets").doc(userId));
      } else {
        // Delete documents where userId field matches
        const snapshot = await db.collection(collectionName)
          .where("userId", "==", userId)
          .get();

        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }
    }

    // Note: Audit logs are intentionally NOT deleted for compliance
    // They will be anonymized instead
    await this.anonymizeAuditLogs(userId, batch);
  }

  private async anonymizeAuditLogs(userId: string, batch: admin.firestore.WriteBatch): Promise<void> {
    const auditLogsSnapshot = await db.collection("auditLogs")
      .where("userId", "==", userId)
      .get();

    auditLogsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        userId: "[DELETED_USER]",
        anonymized: true,
        anonymizedAt: new Date().toISOString(),
      });
    });
  }

  async getDeletionRequest(userId: string): Promise<AccountDeletionRequest | null> {
    const snapshot = await db.collection("deletionRequests")
      .where("userId", "==", userId)
      .where("status", "in", ["scheduled", "pending"])
      .orderBy("requestedAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as AccountDeletionRequest;
  }

  async getScheduledDeletions(): Promise<AccountDeletionRequest[]> {
    const now = new Date();
    const snapshot = await db.collection("deletionRequests")
      .where("status", "==", "scheduled")
      .where("scheduledDeletionAt", "<=", now)
      .get();

    return snapshot.docs.map((doc) => doc.data() as AccountDeletionRequest);
  }
}
