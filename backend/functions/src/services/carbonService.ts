/**
 * Carbon Service - isolates Firestore operations for carbon tracking
 */

import {BaseService} from "./baseService";
import {CarbonLog, MentalHealthLog, AnimalWelfareLog, DigitalTwinSimulation, MSMEReport} from "../types";
import {validateRequiredFields} from "../lib/validators";
import {capsAndLimits} from "../lib/capsAndLimits";

export class CarbonService extends BaseService {
  /**
   * Log carbon action (transport, energy, waste, etc.)
   */
  async logAction(
    userId: string,
    actionType: string,
    value: number,
    details?: any
  ): Promise<CarbonLog> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, actionType, value}, ["userId", "actionType", "value"]);

        // Calculate CO2 saved and coins earned
        const co2Saved = this.calculateCO2Saved(actionType, value);
        const coinsEarned = this.calculateCoinsEarned(co2Saved);

        // Check daily earning cap
        const dailyEarned = await capsAndLimits.getDailyEarned(userId);
        if (dailyEarned + coinsEarned > capsAndLimits.DAILY_EARN_CAP) {
          throw new Error(`Daily earning cap exceeded. Max: ${capsAndLimits.DAILY_EARN_CAP}`);
        }

        // Create carbon log
        const carbonLog: CarbonLog = {
          id: this.db.collection("carbonLogs").doc().id,
          userId,
          categoryId: actionType, // Map actionType to categoryId
          action: actionType,
          co2Saved,
          quantity: value,
          unit: "kg", // Default unit
          timestamp: new Date().toISOString(),
          metadata: {
            coinsEarned,
            wardId: details?.wardId,
            ...details,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        await this.db.collection("carbonLogs").doc(carbonLog.id).set(
          this.sanitizeForFirestore(carbonLog)
        );

        // Update wallet if coins earned
        if (coinsEarned > 0) {
          const walletService = new (await import("./walletService")).WalletService();
          await walletService.earnCoins(userId, `carbon:${actionType}`, coinsEarned);
        }

        // Log activity
        await this.logActivity(
          userId,
          "carbonLogSubmitted",
          {actionType, value, co2Saved, coinsEarned},
          "trackers"
        );

        return carbonLog;
      },
      "carbon_log_action",
      {userId, actionType, value},
      "trackers"
    );
  }

  /**
   * Log mood check-in
   */
  async logMood(userId: string, mood: string, note?: string): Promise<MentalHealthLog> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, mood}, ["userId", "mood"]);

        const moodScores = {
          "excellent": 5,
          "good": 4,
          "neutral": 3,
          "poor": 2,
          "terrible": 1,
        };

        const score = moodScores[mood as keyof typeof moodScores] || 3;
        const coinsEarned = Math.max(0, score - 2); // Earn coins for good moods

        // Check daily earning cap
        const dailyEarned = await capsAndLimits.getDailyEarned(userId);
        if (dailyEarned + coinsEarned > capsAndLimits.DAILY_EARN_CAP) {
          throw new Error(`Daily earning cap exceeded. Max: ${capsAndLimits.DAILY_EARN_CAP}`);
        }

        // Create mental health log
        const mentalHealthLog: MentalHealthLog = {
          id: this.db.collection("mentalHealthLogs").doc().id,
          userId,
          mood: mood as "excellent" | "good" | "neutral" | "poor" | "terrible",
          score,
          note,
          factors: this.extractMoodFactors(note),
          coinsEarned,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        await this.db.collection("mentalHealthLogs").doc(mentalHealthLog.id).set(
          this.sanitizeForFirestore(mentalHealthLog)
        );

        // Update wallet if coins earned
        if (coinsEarned > 0) {
          const walletService = new (await import("./walletService")).WalletService();
          await walletService.earnCoins(userId, "mood:checkin", coinsEarned);
        }

        // Log activity
        await this.logActivity(
          userId,
          "moodLogged",
          {mood, score, coinsEarned},
          "trackers"
        );

        return mentalHealthLog;
      },
      "carbon_log_mood",
      {userId, mood},
      "trackers"
    );
  }

  /**
   * Log animal welfare actions
   */
  async logAnimalActions(userId: string, actions: any[]): Promise<AnimalWelfareLog> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, actions}, ["userId", "actions"]);

        // Calculate kindness score and coins earned
        const kindnessScore = this.calculateKindnessScore(actions);
        const coinsEarned = Math.floor(kindnessScore / 10); // 1 coin per 10 points

        // Check daily earning cap
        const dailyEarned = await capsAndLimits.getDailyEarned(userId);
        if (dailyEarned + coinsEarned > capsAndLimits.DAILY_EARN_CAP) {
          throw new Error(`Daily earning cap exceeded. Max: ${capsAndLimits.DAILY_EARN_CAP}`);
        }

        // Create animal welfare log
        const animalWelfareLog: AnimalWelfareLog = {
          id: this.db.collection("animalWelfareLogs").doc().id,
          userId,
          action: actions.join(", "), // Convert actions array to string
          category: "kindness",
          impact: kindnessScore,
          description: `Performed ${actions.length} kindness actions`,
          timestamp: new Date().toISOString(),
          metadata: {
            actions,
            coinsEarned,
            actionCount: actions.length,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        await this.db.collection("animalWelfareLogs").doc(animalWelfareLog.id).set(
          this.sanitizeForFirestore(animalWelfareLog)
        );

        // Update wallet if coins earned
        if (coinsEarned > 0) {
          const walletService = new (await import("./walletService")).WalletService();
          await walletService.earnCoins(userId, "animal:welfare", coinsEarned);
        }

        // Log activity
        await this.logActivity(
          userId,
          "animalActionsLogged",
          {actionCount: actions.length, kindnessScore, coinsEarned},
          "trackers"
        );

        return animalWelfareLog;
      },
      "carbon_log_animal",
      {userId, actionCount: actions.length},
      "trackers"
    );
  }

  /**
   * Run digital twin simulation
   */
  async runDigitalTwin(userId: string, inputConfig: any): Promise<DigitalTwinSimulation> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, inputConfig}, ["userId", "inputConfig"]);

        // Run simulation
        const results = await this.runSimulation(inputConfig);
        const coinsEarned = Math.floor(results.co2Reduction / 10); // 1 coin per 10kg CO2

        // Check daily earning cap
        const dailyEarned = await capsAndLimits.getDailyEarned(userId);
        if (dailyEarned + coinsEarned > capsAndLimits.DAILY_EARN_CAP) {
          throw new Error(`Daily earning cap exceeded. Max: ${capsAndLimits.DAILY_EARN_CAP}`);
        }

        // Create digital twin simulation
        const simulation: DigitalTwinSimulation = {
          id: this.db.collection("digitalTwinSimulations").doc().id,
          userId,
          scenario: "carbon_reduction",
          inputConfig,
          results,
          parameters: inputConfig,
          metadata: {
            coinsEarned,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        await this.db.collection("digitalTwinSimulations").doc(simulation.id).set(
          this.sanitizeForFirestore(simulation)
        );

        // Update wallet if coins earned
        if (coinsEarned > 0) {
          const walletService = new (await import("./walletService")).WalletService();
          await walletService.earnCoins(userId, "digital:twin", coinsEarned);
        }

        // Log activity
        await this.logActivity(
          userId,
          "digitalTwinSimulated",
          {co2Reduction: results.co2Reduction, coinsEarned},
          "trackers"
        );

        return simulation;
      },
      "carbon_run_digital_twin",
      {userId},
      "trackers"
    );
  }

  /**
   * Generate MSME ESG report
   */
  async generateMSMEReport(userId: string, orgId: string, monthData: any): Promise<MSMEReport> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, orgId, monthData}, ["userId", "orgId", "monthData"]);

        // Calculate ESG score
        const esgScore = this.calculateESGScore(monthData);
        const coinsEarned = Math.floor(esgScore / 5); // 1 coin per 5 ESG points

        // Check daily earning cap
        const dailyEarned = await capsAndLimits.getDailyEarned(userId);
        if (dailyEarned + coinsEarned > capsAndLimits.DAILY_EARN_CAP) {
          throw new Error(`Daily earning cap exceeded. Max: ${capsAndLimits.DAILY_EARN_CAP}`);
        }

        // Generate PDF report
        const pdfUrl = await this.generatePDFReport(orgId, monthData, esgScore);

        // Create MSME report
        const report: MSMEReport = {
          id: this.db.collection("msmeReports").doc().id,
          userId,
          reportType: "monthly_esg",
          reportData: monthData,
          data: monthData,
          esgScore,
          metadata: {
            orgId,
            month: monthData.month,
            year: monthData.year,
            pdfUrl,
            status: "submitted",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        await this.db.collection("msmeReports").doc(report.id).set(
          this.sanitizeForFirestore(report)
        );

        // Update wallet if coins earned
        if (coinsEarned > 0) {
          const walletService = new (await import("./walletService")).WalletService();
          await walletService.earnCoins(userId, "msme:report", coinsEarned);
        }

        // Log activity
        await this.logActivity(
          userId,
          "msmeReportGenerated",
          {orgId, esgScore, coinsEarned},
          "trackers"
        );

        return report;
      },
      "carbon_generate_msme_report",
      {userId, orgId},
      "trackers"
    );
  }

  // Helper methods
  private calculateCO2Saved(actionType: string, value: number): number {
    const co2Factors = {
      "transport": {
        "bike": 0.2,
        "walk": 0.1,
        "public_transport": 0.3,
        "car": 0.4,
      },
      "energy": {
        "solar": 0.5,
        "wind": 0.4,
        "hydro": 0.3,
        "fossil": 0.8,
      },
      "waste": {
        "recycle": 0.3,
        "compost": 0.2,
        "reduce": 0.4,
      },
      "water": {
        "conservation": 0.1,
        "rainwater": 0.2,
        "greywater": 0.15,
      },
      "food": {
        "vegetarian": 0.3,
        "vegan": 0.5,
        "local": 0.2,
      },
    };

    const factor = co2Factors[actionType as keyof typeof co2Factors] || {};
    const subFactor = factor[value as keyof typeof factor] || 0.1;

    return value * subFactor;
  }

  private calculateCoinsEarned(co2Saved: number): number {
    return Math.floor(co2Saved * 2); // 2 coins per kg CO2 saved
  }

  private extractMoodFactors(note?: string): string[] {
    if (!note) return [];

    const factors: string[] = [];
    const keywords = {
      "exercise": ["workout", "gym", "run", "walk", "exercise"],
      "social": ["friend", "family", "social", "party", "meeting"],
      "work": ["work", "job", "project", "meeting", "deadline"],
      "weather": ["sunny", "rain", "cloudy", "hot", "cold"],
      "health": ["sick", "healthy", "pain", "energy", "tired"],
    };

    const lowerNote = note.toLowerCase();
    Object.entries(keywords).forEach(([factor, words]) => {
      if (words.some((word) => lowerNote.includes(word))) {
        factors.push(factor);
      }
    });

    return factors;
  }

  private calculateKindnessScore(actions: any[]): number {
    const actionScores = {
      "rescue": 20,
      "adoption": 30,
      "volunteer": 15,
      "donation": 10,
      "education": 5,
    };

    return actions.reduce((total, action) => {
      const score = actionScores[action.type as keyof typeof actionScores] || 0;
      return total + (score * (action.impact || 1));
    }, 0);
  }

  private async runSimulation(inputConfig: any): Promise<any> {
    // Simulate digital twin calculation
    const co2Reduction = Math.random() * 100; // Mock calculation
    const costSavings = co2Reduction * 50; // Mock calculation

    return {
      co2Reduction,
      costSavings,
      recommendations: [
        "Switch to renewable energy sources",
        "Implement waste reduction strategies",
        "Optimize transportation routes",
      ],
      confidence: 0.85,
    };
  }

  private calculateESGScore(monthData: any): number {
    const {environmental, social, governance} = monthData;

    const envScore = Object.values(environmental).reduce((sum: number, val: any) => sum + val, 0) / 4;
    const socScore = Object.values(social).reduce((sum: number, val: any) => sum + val, 0) / 4;
    const govScore = Object.values(governance).reduce((sum: number, val: any) => sum + val, 0) / 4;

    return Math.round((envScore + socScore + govScore) / 3);
  }

  private async generatePDFReport(orgId: string, monthData: any, esgScore: number): Promise<string> {
    // Mock PDF generation
    const fileName = `msme-report-${orgId}-${monthData.month}-${monthData.year}.pdf`;
    return `https://storage.googleapis.com/zeroprint-reports/${fileName}`;
  }
}
