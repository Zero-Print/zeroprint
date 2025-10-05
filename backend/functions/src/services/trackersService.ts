/**
 * Trackers Service
 * Handles carbon tracking, mood logging, animal welfare, and MSME reports
 */

import {BaseService} from "./baseService";
import {CarbonLog, MoodLog, AnimalWelfareLog, DigitalTwinSimulation, MSMEReport} from "../types/shared";
import {validateRequiredFields} from "../lib/validators";
import {fraudDetection} from "../lib/fraudDetection";
import {FieldValue} from "firebase-admin/firestore";
import {walletService} from "./walletService";

export class TrackersService extends BaseService {
  /**
   * Get carbon tracking data
   */
  async getCarbonLogs(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CarbonLog[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("carbonLogs")
          .where("userId", "==", userId)
          .orderBy("timestamp", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const logs = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as CarbonLog
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("carbonLogs")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: logs,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "trackers_get_carbon_logs",
      {userId, page, limit},
      "trackers"
    );
  }

  /**
   * Log carbon-saving action
   */
  async logCarbonAction(
    userId: string,
    categoryId: string,
    action: string,
    co2Saved: number,
    quantity: number,
    unit: string,
    metadata?: any
  ): Promise<CarbonLog> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, categoryId, action, co2Saved, quantity, unit},
          ["userId", "categoryId", "action", "co2Saved", "quantity", "unit"]);

        if (co2Saved <= 0) {
          throw new Error("CO2 saved must be positive");
        }

        if (quantity <= 0) {
          throw new Error("Quantity must be positive");
        }

        // Check for duplicate action (fraud prevention)
        const isDuplicate = await fraudDetection.checkDuplicateCarbonAction(userId, action, co2Saved);
        if (isDuplicate) {
          throw new Error("Duplicate carbon action detected");
        }

        // Create carbon log
        const carbonLog: CarbonLog = {
          id: this.db.collection("carbonLogs").doc().id,
          userId,
          categoryId,
          action,
          co2Saved,
          quantity,
          unit,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save carbon log
        await this.db.collection("carbonLogs").doc(carbonLog.id).set(
          this.sanitizeForFirestore(carbonLog)
        );

        // Calculate coins earned (1 coin per 1kg CO2 saved)
        const coinsEarned = Math.floor(co2Saved);

        // Earn coins if any
        if (coinsEarned > 0) {
          await walletService.earnCoins(userId, "carbon_tracking", coinsEarned);
        }

        // Update carbon stats
        await this.updateCarbonStats(userId, co2Saved);

        // Log audit trail
        await this.logAudit(
          "carbonActionLogged",
          userId,
          userId,
          {categoryId, action, co2Saved, quantity, unit},
          carbonLog,
          "TrackersService:logCarbonAction"
        );

        // Log activity
        await this.logActivity(
          userId,
          "carbonActionLogged",
          {action, co2Saved, coinsEarned},
          "trackers"
        );

        return carbonLog;
      },
      "trackers_log_carbon_action",
      {userId, categoryId, action, co2Saved, quantity, unit},
      "trackers"
    );
  }

  /**
   * Update carbon log
   */
  async updateCarbonLog(
    userId: string,
    logId: string,
    updates: Partial<CarbonLog>
  ): Promise<CarbonLog> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, logId}, ["userId", "logId"]);

        const logRef = this.db.collection("carbonLogs").doc(logId);
        const logDoc = await logRef.get();

        if (!logDoc.exists) {
          throw new Error("Carbon log not found");
        }

        const existingLog = this.convertFromFirestore(logDoc.data()) as CarbonLog;

        if (existingLog.userId !== userId) {
          throw new Error("Unauthorized to update this log");
        }

        const updatedLog: CarbonLog = {
          ...existingLog,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await logRef.update(this.sanitizeForFirestore(updatedLog));

        // Log audit trail
        await this.logAudit(
          "carbonLogUpdated",
          userId,
          userId,
          existingLog,
          updatedLog,
          "TrackersService:updateCarbonLog"
        );

        return updatedLog;
      },
      "trackers_update_carbon_log",
      {userId, logId, updates},
      "trackers"
    );
  }

  /**
   * Delete carbon log
   */
  async deleteCarbonLog(userId: string, logId: string): Promise<void> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, logId}, ["userId", "logId"]);

        const logRef = this.db.collection("carbonLogs").doc(logId);
        const logDoc = await logRef.get();

        if (!logDoc.exists) {
          throw new Error("Carbon log not found");
        }

        const existingLog = this.convertFromFirestore(logDoc.data()) as CarbonLog;

        if (existingLog.userId !== userId) {
          throw new Error("Unauthorized to delete this log");
        }

        await logRef.delete();

        // Log audit trail
        await this.logAudit(
          "carbonLogDeleted",
          userId,
          userId,
          existingLog,
          null,
          "TrackersService:deleteCarbonLog"
        );
      },
      "trackers_delete_carbon_log",
      {userId, logId},
      "trackers"
    );
  }

  /**
   * Get mood tracking data
   */
  async getMoodLogs(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: MoodLog[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("moodLogs")
          .where("userId", "==", userId)
          .orderBy("timestamp", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const logs = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as MoodLog
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("moodLogs")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: logs,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "trackers_get_mood_logs",
      {userId, page, limit},
      "trackers"
    );
  }

  /**
   * Log mood check-in
   */
  async logMoodCheckIn(
    userId: string,
    mood: number,
    energy: number,
    stress: number,
    notes?: string,
    metadata?: any
  ): Promise<MoodLog> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, mood, energy, stress}, ["userId", "mood", "energy", "stress"]);

        if (mood < 1 || mood > 5) {
          throw new Error("Mood must be between 1 and 5");
        }

        if (energy < 1 || energy > 5) {
          throw new Error("Energy must be between 1 and 5");
        }

        if (stress < 1 || stress > 5) {
          throw new Error("Stress must be between 1 and 5");
        }

        // Check for duplicate mood log (same day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingLog = await this.db
          .collection("moodLogs")
          .where("userId", "==", userId)
          .where("timestamp", ">=", today)
          .get();

        if (!existingLog.empty) {
          throw new Error("Mood already logged today");
        }

        // Create mood log
        const moodLog: MoodLog = {
          id: this.db.collection("moodLogs").doc().id,
          userId,
          mood,
          energy,
          stress,
          notes: notes || "",
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save mood log
        await this.db.collection("moodLogs").doc(moodLog.id).set(
          this.sanitizeForFirestore(moodLog)
        );

        // Earn coins for mood tracking (encouragement)
        const coinsEarned = 5; // Small reward for tracking
        await walletService.earnCoins(userId, "mood_tracking", coinsEarned);

        // Log activity
        await this.logActivity(
          userId,
          "moodLogged",
          {mood, energy, stress, coinsEarned},
          "trackers"
        );

        return moodLog;
      },
      "trackers_log_mood",
      {userId, mood, energy, stress},
      "trackers"
    );
  }

  /**
   * Get animal welfare data
   */
  async getAnimalWelfareLogs(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: AnimalWelfareLog[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("animalWelfareLogs")
          .where("userId", "==", userId)
          .orderBy("timestamp", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const logs = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as AnimalWelfareLog
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("animalWelfareLogs")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: logs,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "trackers_get_animal_welfare_logs",
      {userId, page, limit},
      "trackers"
    );
  }

  /**
   * Log animal welfare action
   */
  async logAnimalWelfareAction(
    userId: string,
    action: string,
    category: string,
    impact: number,
    description: string,
    metadata?: any
  ): Promise<AnimalWelfareLog> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, action, category, impact, description},
          ["userId", "action", "category", "impact", "description"]);

        if (impact < 1 || impact > 5) {
          throw new Error("Impact must be between 1 and 5");
        }

        // Create animal welfare log
        const animalWelfareLog: AnimalWelfareLog = {
          id: this.db.collection("animalWelfareLogs").doc().id,
          userId,
          action,
          category,
          impact,
          description,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save animal welfare log
        await this.db.collection("animalWelfareLogs").doc(animalWelfareLog.id).set(
          this.sanitizeForFirestore(animalWelfareLog)
        );

        // Earn coins based on impact
        const coinsEarned = impact * 10; // 10-50 coins based on impact
        await walletService.earnCoins(userId, "animal_welfare", coinsEarned);

        // Log activity
        await this.logActivity(
          userId,
          "animalWelfareActionLogged",
          {action, category, impact, coinsEarned},
          "trackers"
        );

        return animalWelfareLog;
      },
      "trackers_log_animal_welfare",
      {userId, action, category, impact, description},
      "trackers"
    );
  }

  /**
   * Get digital twin simulations
   */
  async getDigitalTwinSimulations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: DigitalTwinSimulation[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("digitalTwinSimulations")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const simulations = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as DigitalTwinSimulation
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("digitalTwinSimulations")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: simulations,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "trackers_get_digital_twin_simulations",
      {userId, page, limit},
      "trackers"
    );
  }

  /**
   * Create digital twin simulation
   */
  async createDigitalTwinSimulation(
    userId: string,
    scenario: string,
    parameters: any,
    results: any,
    metadata?: any
  ): Promise<DigitalTwinSimulation> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, scenario, parameters, results},
          ["userId", "scenario", "parameters", "results"]);

        // Create digital twin simulation
        const simulation: DigitalTwinSimulation = {
          id: this.db.collection("digitalTwinSimulations").doc().id,
          userId,
          scenario,
          inputConfig: parameters || {},
          parameters: parameters || {},
          results,
          metadata: metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save simulation
        await this.db.collection("digitalTwinSimulations").doc(simulation.id).set(
          this.sanitizeForFirestore(simulation)
        );

        // Earn coins for simulation
        const coinsEarned = 20; // Fixed reward for simulation
        await walletService.earnCoins(userId, "digital_twin_simulation", coinsEarned);

        // Log activity
        await this.logActivity(
          userId,
          "digitalTwinSimulationCreated",
          {scenario, coinsEarned},
          "trackers"
        );

        return simulation;
      },
      "trackers_create_digital_twin_simulation",
      {userId, scenario, parameters, results},
      "trackers"
    );
  }

  /**
   * Get MSME reports
   */
  async getMSMEReports(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: MSMEReport[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("msmeReports")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const reports = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as MSMEReport
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("msmeReports")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: reports,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "trackers_get_msme_reports",
      {userId, page, limit},
      "trackers"
    );
  }

  /**
   * Create MSME report
   */
  async createMSMEReport(
    userId: string,
    reportType: string,
    data: any,
    metadata?: any
  ): Promise<MSMEReport> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, reportType, data}, ["userId", "reportType", "data"]);

        // Create MSME report
        const report: MSMEReport = {
          id: this.db.collection("msmeReports").doc().id,
          userId,
          reportType,
          reportData: data || {},
          data: data || {},
          esgScore: 0, // Default ESG score
          metadata: metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save report
        await this.db.collection("msmeReports").doc(report.id).set(
          this.sanitizeForFirestore(report)
        );

        // Earn coins for report
        const coinsEarned = 50; // Higher reward for MSME reports
        await walletService.earnCoins(userId, "msme_report", coinsEarned);

        // Log activity
        await this.logActivity(
          userId,
          "msmeReportCreated",
          {reportType, coinsEarned},
          "trackers"
        );

        return report;
      },
      "trackers_create_msme_report",
      {userId, reportType, data},
      "trackers"
    );
  }

  /**
   * Update carbon stats
   */
  private async updateCarbonStats(userId: string, co2Saved: number): Promise<void> {
    const statsRef = this.db.collection("carbonStats").doc(userId);

    await statsRef.set({
      userId,
      totalCo2Saved: FieldValue.increment(co2Saved),
      lastUpdated: new Date(),
    }, {merge: true});
  }
}

export const trackersService = new TrackersService();
