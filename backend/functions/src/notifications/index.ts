import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {validateAuth} from "../lib/auth";

interface GetUserNotificationsRequest {
  limit?: number;
  startAfter?: string | null;
  includeRead?: boolean;
}

interface MarkNotificationReadRequest {
  notificationId: string;
}

interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}

interface CreateBulkNotificationsRequest {
  userIds: string[];
  title: string;
  message: string;
  type: string;
  link?: string;
}

// Get user notifications with pagination
export const getUserNotifications = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<GetUserNotificationsRequest>) => {
    try {
      // Validate auth
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const userId = request.auth.uid;
      const {limit = 20, startAfter = null, includeRead = false} = request.data;

      let query = db.collection("notifications")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc");

      if (!includeRead) {
        query = query.where("read", "==", false);
      }

      query = query.limit(limit);

      if (startAfter) {
        const startAfterDoc = await db.collection("notifications").doc(startAfter).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {notifications};
    } catch (error) {
      console.error("Error retrieving notifications:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving notifications"
      );
    }
  });

// Mark notification as read
export const markNotificationRead = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<MarkNotificationReadRequest>) => {
    try {
      // Validate auth
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const userId = request.auth.uid;
      const {notificationId} = request.data;

      if (!notificationId) {
        throw new HttpsError(
          "invalid-argument",
          "Missing notification ID"
        );
      }

      const notificationRef = db.collection("notifications").doc(notificationId);
      const notificationDoc = await notificationRef.get();

      if (!notificationDoc.exists) {
        throw new HttpsError(
          "not-found",
          "Notification not found"
        );
      }

      const notificationData = notificationDoc.data();
      if (notificationData?.userId !== userId) {
        throw new HttpsError(
          "permission-denied",
          "Cannot access this notification"
        );
      }

      await notificationRef.update({read: true});

      return {success: true};
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new HttpsError(
        "internal",
        "Error marking notification as read"
      );
    }
  });

// Create a notification (admin only)
export const createNotification = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<CreateNotificationRequest>) => {
    try {
      // Validate auth and admin role
      validateAuth(request, ["admin"]);

      const {userId, title, message, type, link} = request.data;

      if (!userId || !title || !message || !type) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required fields"
        );
      }

      const notificationData = {
        userId,
        title,
        message,
        type,
        link: link || null,
        read: false,
        timestamp: new Date().toISOString(),
      };

      const docRef = await db.collection("notifications").add(notificationData);

      return {
        id: docRef.id,
        ...notificationData,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new HttpsError(
        "internal",
        "Error creating notification"
      );
    }
  });

// Create a bulk notification (admin only)
export const createBulkNotifications = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<CreateBulkNotificationsRequest>) => {
    try {
      // Validate auth and admin role
      validateAuth(request, ["admin"]);

      const {userIds, title, message, type, link} = request.data;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !message || !type) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required fields"
        );
      }

      const batch = db.batch();
      const timestamp = new Date().toISOString();

      for (const userId of userIds) {
        const notificationData = {
          userId,
          title,
          message,
          type,
          link: link || null,
          read: false,
          timestamp,
        };

        const docRef = db.collection("notifications").doc();
        batch.set(docRef, notificationData);
      }

      await batch.commit();

      return {
        success: true,
        count: userIds.length,
      };
    } catch (error) {
      console.error("Error creating bulk notifications:", error);
      throw new HttpsError(
        "internal",
        "Error creating bulk notifications"
      );
    }
  });
