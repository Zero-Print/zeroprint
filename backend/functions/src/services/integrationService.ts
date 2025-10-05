/**
 * Integration Service - isolates Firestore operations for external integrations
 */

import {BaseService} from "./baseService";
import {validateRequiredFields} from "../lib/validators";

export class IntegrationService extends BaseService {
  async sendNotification(payload: any): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields(payload, ["userId", "channel", "templateId"]);

        // Mock notification sending
        const notificationId = `notif_${Date.now()}`;

        // Log notification
        await this.db.collection("notificationLogs").doc(notificationId).set({
          id: notificationId,
          userId: payload.userId,
          channel: payload.channel,
          templateId: payload.templateId,
          status: "sent",
          sentAt: new Date(),
          response: {providerId: `provider_${Date.now()}`},
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {notificationId, status: "sent"};
      },
      "integration_send_notification",
      {channel: payload.channel},
      "integrations"
    );
  }

  async dispatchRedemption(redemptionId: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({redemptionId}, ["redemptionId"]);

        // Mock redemption dispatch
        const dispatchId = `dispatch_${Date.now()}`;

        // Update redemption status
        await this.db.collection("redemptions").doc(redemptionId).update({
          status: "fulfilled",
          fulfillmentDetails: {dispatchId, fulfilledAt: new Date()},
          updatedAt: new Date(),
        });

        return {dispatchId, status: "fulfilled"};
      },
      "integration_dispatch_redemption",
      {redemptionId},
      "integrations"
    );
  }

  async reverseGeocode(lat: number, lng: number, actionId: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({lat, lng, actionId}, ["lat", "lng", "actionId"]);

        // Mock reverse geocoding
        const wardId = `ward_${Math.floor(Math.random() * 100)}`;

        // Update action with ward ID
        await this.db.collection("carbonLogs").doc(actionId).update({
          wardId,
          updatedAt: new Date(),
        });

        return {wardId, lat, lng};
      },
      "integration_reverse_geocode",
      {lat, lng},
      "integrations"
    );
  }
}

export const integrationService = new IntegrationService();
