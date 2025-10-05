/**
 * Export Service
 * Handles CSV and PDF generation for dashboard data
 */

import {db} from "../lib/firebase";
import {BaseService} from "./baseService";
import {ApiResponse} from "../lib/apiResponse";
import * as fs from "fs";
import * as path from "path";

export interface ExportOptions {
  format: "csv" | "pdf";
  template?: string;
  filters?: any;
  pagination?: any;
  includeCharts?: boolean;
  customFields?: string[];
}

export interface ExportResult {
  downloadUrl: string;
  filename: string;
  expiresAt: Date;
  size: number;
}

export class ExportService extends BaseService {
  private exportsCollection = "exports";
  private tempDir = "/tmp/exports";

  // Ensure temp directory exists
  private async ensureTempDir(): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, {recursive: true});
    }
  }

  // Export dashboard data
  async exportDashboardData(
    dashboardType: "citizen" | "entity" | "government" | "admin",
    options: ExportOptions,
    userId?: string
  ): Promise<ApiResponse<ExportResult>> {
    try {
      await this.ensureTempDir();

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${dashboardType}_dashboard_${timestamp}.${options.format}`;
      const filePath = path.join(this.tempDir, filename);

      let result: ExportResult;

      if (options.format === "csv") {
        result = await this.exportDashboardCSV(dashboardType, filePath, options);
      } else if (options.format === "pdf") {
        result = await this.exportDashboardPDF(dashboardType, filePath, options);
      } else {
        return ApiResponse.error("Unsupported export format", "400");
      }

      // Store export record
      const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.collection(this.exportsCollection).doc(exportId).set({
        id: exportId,
        userId,
        dashboardType,
        format: options.format,
        filename,
        filePath,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        downloadCount: 0,
      });

      // Log export activity
      await this.logActivity(
        userId || "system",
        "dashboard_exported",
        {
          dashboardType,
          format: options.format,
          filename,
          exportId,
        },
        "export"
      );

      return ApiResponse.success(result);
    } catch (error) {
      await this.logError("ExportService", "exportDashboardData", (error as Error).message, "export");
      return ApiResponse.error("Failed to export dashboard data");
    }
  }

  // Export dashboard as CSV
  private async exportDashboardCSV(
    dashboardType: string,
    filePath: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const data = await this.fetchDashboardData(dashboardType, options);
    const csvData = this.convertToCSV(data, options);

    fs.writeFileSync(filePath, csvData);

    return {
      downloadUrl: `/exports/${path.basename(filePath)}`,
      filename: path.basename(filePath),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      size: fs.statSync(filePath).size,
    };
  }

  // Export dashboard as PDF
  private async exportDashboardPDF(
    dashboardType: string,
    filePath: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // const data = await this.fetchDashboardData(dashboardType, options);
    // const html = this.generatePDFHTML(dashboardType, data, options);

    // TODO: Install puppeteer package for PDF generation
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // });

    // For now, create a placeholder PDF
    // const browser = null as any;

    try {
      // TODO: Implement actual PDF generation when puppeteer is available
      // const page = await browser.newPage();
      // await page.setContent(html, { waitUntil: 'networkidle0' });
      // await page.pdf({...});

      // For now, create a placeholder file
      await fs.promises.writeFile(filePath, "PDF placeholder - install puppeteer for actual PDF generation");

      return {
        downloadUrl: `/exports/${path.basename(filePath)}`,
        filename: path.basename(filePath),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        size: fs.statSync(filePath).size,
      };
    } finally {
      // await browser.close();
    }
  }

  // Fetch dashboard data based on type
  private async fetchDashboardData(dashboardType: string, options: ExportOptions): Promise<any> {
    switch (dashboardType) {
    case "citizen":
      return await this.fetchCitizenData(options);
    case "entity":
      return await this.fetchEntityData(options);
    case "government":
      return await this.fetchGovernmentData(options);
    case "admin":
      return await this.fetchAdminData(options);
    default:
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }
  }

  // Fetch citizen dashboard data
  private async fetchCitizenData(options: ExportOptions): Promise<any> {
    const data: any = {
      wallet: {healCoins: 0, inrBalance: 0},
      ecoScore: {current: 0, trend: []},
      trends: {carbon: [], mood: [], kindness: []},
      activities: [],
      leaderboards: {global: [], friends: [], local: []},
    };

    // Fetch wallet data
    const walletSnapshot = await db.collection("wallets")
      .where("userId", "==", options.filters?.userId)
      .limit(1)
      .get();

    if (!walletSnapshot.empty) {
      const wallet = walletSnapshot.docs[0].data();
      data.wallet = {
        healCoins: wallet.healCoins || 0,
        inrBalance: wallet.inrBalance || 0,
      };
    }

    // Fetch eco score data
    const ecoScoreSnapshot = await db.collection("carbonLogs")
      .where("userId", "==", options.filters?.userId)
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    data.ecoScore = {
      current: this.calculateEcoScore(ecoScoreSnapshot.docs),
      trend: ecoScoreSnapshot.docs.map((doc) => ({
        date: doc.data().createdAt.toDate().toISOString().split("T")[0],
        score: this.calculateEcoScore([doc]),
      })),
    };

    // Fetch activity data
    const activitySnapshot = await db.collection("activityLogs")
      .where("userId", "==", options.filters?.userId)
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    data.activities = activitySnapshot.docs.map((doc) => ({
      id: doc.id,
      type: doc.data().action,
      description: doc.data().details,
      timestamp: doc.data().timestamp.toDate().toISOString(),
      coinsEarned: doc.data().coinsEarned || 0,
    }));

    return data;
  }

  // Fetch entity dashboard data
  private async fetchEntityData(options: ExportOptions): Promise<any> {
    const data: any = {
      kpis: {totalUsers: 0, activeUsers: 0, totalCo2Saved: 0, ecoScore: 0, engagement: 0},
      leaderboard: [],
      gameHeatmap: [],
      esgReport: {},
    };

    // Fetch entity users
    const usersSnapshot = await db.collection("users")
      .where("entityId", "==", options.filters?.entityId)
      .where("entityType", "==", options.filters?.entityType)
      .get();

    data.kpis.totalUsers = usersSnapshot.size;
    data.kpis.activeUsers = usersSnapshot.docs.filter((doc) => {
      const lastActive = doc.data().lastActive?.toDate();
      return lastActive && (Date.now() - lastActive.getTime()) < 7 * 24 * 60 * 60 * 1000;
    }).length;

    // Fetch CO2 savings
    const carbonSnapshot = await db.collection("carbonLogs")
      .where("entityId", "==", options.filters?.entityId)
      .get();

    data.kpis.totalCo2Saved = carbonSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().co2Saved || 0);
    }, 0);

    // Fetch game data
    const gameSnapshot = await db.collection("gameScores")
      .where("entityId", "==", options.filters?.entityId)
      .get();

    data.gameHeatmap = this.aggregateGameData(gameSnapshot.docs);

    return data;
  }

  // Fetch government dashboard data
  private async fetchGovernmentData(options: ExportOptions): Promise<any> {
    const data: any = {
      kpis: {totalCo2Saved: 0, adoptionRate: 0, ecoMindScore: 0, kindnessIndex: 0},
      wards: [],
      geoJson: {type: "FeatureCollection", features: []},
      scenarios: [],
    };

    // Fetch ward data
    const wardsSnapshot = await db.collection("wards").get();
    data.wards = wardsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      population: doc.data().population || 0,
      area: doc.data().area || 0,
    }));

    // Fetch GeoJSON data
    const geoJsonSnapshot = await db.collection("wardGeoData").get();
    data.geoJson = {
      type: "FeatureCollection",
      features: geoJsonSnapshot.docs.map((doc) => doc.data()),
    };

    // Fetch scenario simulations
    const scenariosSnapshot = await db.collection("scenarioSimulations")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    data.scenarios = scenariosSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      parameters: doc.data().parameters,
      results: doc.data().results,
      createdAt: doc.data().createdAt.toDate().toISOString(),
    }));

    return data;
  }

  // Fetch admin dashboard data
  private async fetchAdminData(options: ExportOptions): Promise<any> {
    const data: any = {
      users: [],
      configs: {featureFlags: [], systemSettings: {}, limits: {}},
      rewards: [],
      transactions: [],
      errorStats: {totalErrors: 0, errorsByModule: [], errorsBySeverity: []},
      deployLogs: [],
    };

    // Fetch users
    const usersSnapshot = await db.collection("users")
      .orderBy("createdAt", "desc")
      .limit(1000)
      .get();

    data.users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email,
      name: doc.data().displayName || doc.data().email,
      role: doc.data().role || "user",
      createdAt: doc.data().createdAt.toDate().toISOString(),
      lastActive: doc.data().lastActive?.toDate().toISOString() || "Never",
      status: doc.data().status || "active",
    }));

    // Fetch rewards
    const rewardsSnapshot = await db.collection("rewards")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    data.rewards = rewardsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      coinCost: doc.data().coinCost || 0,
      stock: doc.data().stock || 0,
      redemptions: doc.data().redemptions || 0,
      status: doc.data().isActive ? "active" : "inactive",
    }));

    // Fetch error stats
    const errorSnapshot = await db.collection("errorLogs")
      .orderBy("timestamp", "desc")
      .limit(1000)
      .get();

    data.errorStats = this.aggregateErrorStats(errorSnapshot.docs);

    return data;
  }

  // Convert data to CSV format
  private convertToCSV(data: any, options: ExportOptions): string {
    const headers = this.getCSVHeaders(data, options);
    const rows = this.getCSVRows(data, options);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }

  // Get CSV headers based on data structure
  private getCSVHeaders(data: any, options: ExportOptions): string[] {
    if (options.customFields && options.customFields.length > 0) {
      return options.customFields;
    }

    // Default headers based on data structure
    if (data.wallet) {
      return ["Date", "HealCoins", "INR Balance", "EcoScore", "CO2 Saved", "Mood", "Kindness"];
    } else if (data.users) {
      return ["ID", "Email", "Name", "Role", "Created At", "Last Active", "Status"];
    } else if (data.rewards) {
      return ["ID", "Name", "Description", "Coin Cost", "Stock", "Redemptions", "Status"];
    } else {
      return Object.keys(data).slice(0, 10); // Limit to first 10 fields
    }
  }

  // Get CSV rows from data
  private getCSVRows(data: any, options: ExportOptions): string[][] {
    if (data.activities && Array.isArray(data.activities)) {
      return data.activities.map((activity: any) => [
        activity.timestamp,
        activity.coinsEarned?.toString() || "0",
        "0", // INR Balance
        "0", // EcoScore
        "0", // CO2 Saved
        "0", // Mood
        "0", // Kindness
      ]);
    } else if (data.users && Array.isArray(data.users)) {
      return data.users.map((user: any) => [
        user.id,
        user.email,
        user.name,
        user.role,
        user.createdAt,
        user.lastActive,
        user.status,
      ]);
    } else if (data.rewards && Array.isArray(data.rewards)) {
      return data.rewards.map((reward: any) => [
        reward.id,
        reward.name,
        reward.description,
        reward.coinCost?.toString() || "0",
        reward.stock?.toString() || "0",
        reward.redemptions?.toString() || "0",
        reward.status,
      ]);
    } else {
      return [Object.values(data).slice(0, 10).map((v) => String(v))];
    }
  }

  // Generate PDF HTML
  /*
  private generatePDFHTML(dashboardType: string, data: any, options: ExportOptions): string {
    const title = `${dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)} Dashboard Report`;
    const timestamp = new Date().toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #444; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; font-weight: bold; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${timestamp}</p>
          </div>

          ${this.generatePDFContent(dashboardType, data)}
        </body>
      </html>
    `;
  }
  */

  // Generate PDF content based on dashboard type
  /*
  private generatePDFContent(dashboardType: string, data: any): string {
    switch (dashboardType) {
      case 'citizen':
        return this.generateCitizenPDFContent(data);
      case 'entity':
        return this.generateEntityPDFContent(data);
      case 'government':
        return this.generateGovernmentPDFContent(data);
      case 'admin':
        return this.generateAdminPDFContent(data);
      default:
        return '<p>No data available</p>';
    }
  }
  */

  // Generate citizen PDF content
  /*
  private generateCitizenPDFContent(data: any): string {
    return `
      <div class="section">
        <h2>Wallet Summary</h2>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${data.wallet?.healCoins || 0}</div>
            <div class="stat-label">HealCoins</div>
          </div>
          <div class="stat">
            <div class="stat-value">₹${data.wallet?.inrBalance || 0}</div>
            <div class="stat-label">INR Balance</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Recent Activity</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Coins Earned</th>
            </tr>
          </thead>
          <tbody>
            ${(data.activities || []).slice(0, 10).map((activity: any) => `
              <tr>
                <td>${new Date(activity.timestamp).toLocaleDateString()}</td>
                <td>${activity.description || activity.type}</td>
                <td>${activity.coinsEarned || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Generate entity PDF content
  /*
  private generateEntityPDFContent(data: any): string {
    return `
      <div class="section">
        <h2>Entity KPIs</h2>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${data.kpis?.totalUsers || 0}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.kpis?.activeUsers || 0}</div>
            <div class="stat-label">Active Users</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.kpis?.totalCo2Saved || 0}kg</div>
            <div class="stat-label">CO2 Saved</div>
          </div>
        </div>
      </div>
    `;
  }
  */

  // Generate government PDF content
  /*
  private generateGovernmentPDFContent(data: any): string {
    return `
      <div class="section">
        <h2>Government KPIs</h2>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${data.kpis?.totalCo2Saved || 0}kg</div>
            <div class="stat-label">Total CO2 Saved</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.kpis?.adoptionRate || 0}%</div>
            <div class="stat-label">Adoption Rate</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.kpis?.ecoMindScore || 0}</div>
            <div class="stat-label">EcoMind Score</div>
          </div>
        </div>
      </div>
    `;
  }
  */

  // Generate admin PDF content
  /*
  private generateAdminPDFContent(data: any): string {
    return `
      <div class="section">
        <h2>System Overview</h2>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${data.users?.length || 0}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.rewards?.length || 0}</div>
            <div class="stat-label">Active Rewards</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.errorStats?.totalErrors || 0}</div>
            <div class="stat-label">Total Errors</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Recent Users</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(data.users || []).slice(0, 10).map((user: any) => `
              <tr>
                <td>${user.email}</td>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>${user.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  */

  // Calculate eco score from carbon logs
  private calculateEcoScore(carbonLogs: any[]): number {
    if (carbonLogs.length === 0) return 0;

    const totalCo2 = carbonLogs.reduce((sum, log) => sum + (log.data().co2Saved || 0), 0);
    return Math.min(Math.round(totalCo2 * 10), 100); // Scale to 0-100
  }

  // Aggregate game data for heatmap
  private aggregateGameData(gameLogs: any[]): any[] {
    const gameStats = new Map();

    gameLogs.forEach((log) => {
      const gameId = log.data().gameId;
      const score = log.data().score || 0;

      if (!gameStats.has(gameId)) {
        gameStats.set(gameId, {plays: 0, totalScore: 0, gameName: `Game ${gameId}`});
      }

      const stats = gameStats.get(gameId);
      stats.plays += 1;
      stats.totalScore += score;
    });

    return Array.from(gameStats.entries()).map(([gameId, stats]) => ({
      gameId,
      gameName: stats.gameName,
      plays: stats.plays,
      avgScore: Math.round(stats.totalScore / stats.plays),
    }));
  }

  // Aggregate error statistics
  private aggregateErrorStats(errorLogs: any[]): any {
    const moduleCounts = new Map();
    const severityCounts = new Map();

    errorLogs.forEach((log) => {
      const module = log.data().module || "unknown";
      const severity = log.data().severity || "low";

      moduleCounts.set(module, (moduleCounts.get(module) || 0) + 1);
      severityCounts.set(severity, (severityCounts.get(severity) || 0) + 1);
    });

    return {
      totalErrors: errorLogs.length,
      errorsByModule: Array.from(moduleCounts.entries()).map(([module, count]) => ({module, count})),
      errorsBySeverity: Array.from(severityCounts.entries()).map(([severity, count]) => ({severity, count})),
    };
  }

  // Clean up expired exports
  async cleanupExpiredExports(): Promise<void> {
    try {
      const expiredExports = await db.collection(this.exportsCollection)
        .where("expiresAt", "<", new Date())
        .get();

      const batch = db.batch();
      expiredExports.docs.forEach((doc) => {
        batch.delete(doc.ref);

        // Delete file if it exists
        const filePath = doc.data().filePath;
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      await batch.commit();

      await this.logActivity(
        "system",
        "expired_exports_cleaned",
        {
          count: expiredExports.size,
        },
        "export"
      );
    } catch (error) {
      console.error("Failed to cleanup expired exports:", error);
    }
  }
}

export const exportService = new ExportService();
