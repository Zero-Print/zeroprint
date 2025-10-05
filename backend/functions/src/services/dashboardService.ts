/**
 * Dashboard Service
 * Handles data aggregation for various dashboards
 */

import {BaseService} from "./baseService";
import {User, CarbonLog, GameScore, Wallet, Subscription, Redemption} from "../types";
import {validateRequiredFields} from "../lib/validators";

export class DashboardService extends BaseService {
  /**
   * Get citizen dashboard data
   */
  async getCitizenDashboard(userId: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId}, ["userId"]);

        const [
          wallet,
          carbonLogs,
          gameScores,
          redemptions,
          subscriptions,
          carbonStats,
          moodLogs,
        ] = await Promise.all([
          this.getUserWallet(userId),
          this.getUserCarbonLogs(userId),
          this.getUserGameScores(userId),
          this.getUserRedemptions(userId),
          this.getUserSubscriptions(userId),
          this.getUserCarbonStats(userId),
          this.getUserMoodLogs(userId),
          this.getUserAnimalWelfareLogs(userId),
        ]);

        // Calculate metrics
        const totalCo2Saved = carbonLogs.reduce((sum, log) => sum + log.co2Saved, 0);
        const totalCoinsEarned = gameScores.reduce((sum, score) => sum + score.score, 0);
        const totalCoinsRedeemed = redemptions.reduce((sum, redemption) => sum + redemption.cost, 0);

        // Calculate trends
        const carbonTrends = this.calculateCarbonTrends(carbonLogs);
        const moodTrends = this.calculateMoodTrends(moodLogs);
        const gameTrends = this.calculateGameTrends(gameScores);

        // Get leaderboard position
        const leaderboardPosition = await this.getUserLeaderboardPosition(userId);

        return {
          wallet,
          totalCo2Saved,
          totalCoinsEarned,
          totalCoinsRedeemed,
          carbonTrends,
          moodTrends,
          gameTrends,
          leaderboardPosition,
          recentActivity: this.getRecentActivity(carbonLogs, gameScores, redemptions),
          achievements: this.getUserAchievements(carbonStats, gameScores, redemptions),
          subscriptions,
        };
      },
      "dashboard_get_citizen",
      {userId},
      "dashboard"
    );
  }

  /**
   * Get entity dashboard data
   */
  async getEntityDashboard(userId: string, entityType: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, entityType}, ["userId", "entityType"]);

        const [
          wallet,
          carbonLogs,
          gameScores,
          redemptions,
          subscriptions,
          carbonStats,
          teamMembers,
        ] = await Promise.all([
          this.getUserWallet(userId),
          this.getUserCarbonLogs(userId),
          this.getUserGameScores(userId),
          this.getUserRedemptions(userId),
          this.getUserSubscriptions(userId),
          this.getUserCarbonStats(userId),
          this.getTeamMembers(userId, entityType),
        ]);

        // Calculate team metrics
        const teamMetrics = await this.calculateTeamMetrics(teamMembers);

        // Calculate entity-specific metrics
        const entityMetrics = this.calculateEntityMetrics(entityType, carbonLogs, gameScores);

        return {
          wallet,
          teamMetrics,
          entityMetrics,
          carbonStats,
          subscriptions,
          recentActivity: this.getRecentActivity(carbonLogs, gameScores, redemptions),
        };
      },
      "dashboard_get_entity",
      {userId, entityType},
      "dashboard"
    );
  }

  /**
   * Get government dashboard data
   */
  async getGovernmentDashboard(userId: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId}, ["userId"]);

        const [
          totalUsers,
          totalCo2Saved,
          totalCoinsEarned,
          totalCoinsRedeemed,
          activeSubscriptions,
          wardStats,
          carbonTrends,
          gameTrends,
          userTrends,
        ] = await Promise.all([
          this.getTotalUsers(),
          this.getTotalCo2Saved(),
          this.getTotalCoinsEarned(),
          this.getTotalCoinsRedeemed(),
          this.getActiveSubscriptions(),
          this.getWardStats(),
          this.getCarbonTrends(),
          this.getGameTrends(),
          this.getUserTrends(),
        ]);

        return {
          totalUsers,
          totalCo2Saved,
          totalCoinsEarned,
          totalCoinsRedeemed,
          activeSubscriptions,
          wardStats,
          carbonTrends,
          gameTrends,
          userTrends,
          kpis: this.calculateGovernmentKPIs(totalUsers, totalCo2Saved, activeSubscriptions),
        };
      },
      "dashboard_get_government",
      {userId},
      "dashboard"
    );
  }

  /**
   * Get admin dashboard data
   */
  async getAdminDashboard(userId: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId}, ["userId"]);

        const [
          totalUsers,
          totalCo2Saved,
          totalCoinsEarned,
          totalCoinsRedeemed,
          activeSubscriptions,
          totalRevenue,
          systemHealth,
          errorLogs,
          performanceMetrics,
          fraudAlerts,
        ] = await Promise.all([
          this.getTotalUsers(),
          this.getTotalCo2Saved(),
          this.getTotalCoinsEarned(),
          this.getTotalCoinsRedeemed(),
          this.getActiveSubscriptions(),
          this.getTotalRevenue(),
          this.getSystemHealth(),
          this.getErrorLogs(),
          this.getPerformanceMetrics(),
          this.getFraudAlerts(),
        ]);

        return {
          totalUsers,
          totalCo2Saved,
          totalCoinsEarned,
          totalCoinsRedeemed,
          activeSubscriptions,
          totalRevenue,
          systemHealth,
          errorLogs,
          performanceMetrics,
          fraudAlerts,
          analytics: this.calculateAdminAnalytics(totalUsers, totalCo2Saved, activeSubscriptions, totalRevenue),
        };
      },
      "dashboard_get_admin",
      {userId},
      "dashboard"
    );
  }

  /**
   * Get user wallet
   */
  private async getUserWallet(userId: string): Promise<Wallet> {
    const walletDoc = await this.db.collection("wallets").doc(userId).get();

    if (!walletDoc.exists) {
      return {
        id: userId,
        userId,
        walletId: `wallet_${userId}`,
        entityId: userId,
        healCoins: 0,
        inrBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        lastUpdated: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return this.convertFromFirestore(walletDoc.data()) as Wallet;
  }

  /**
   * Get user carbon logs
   */
  private async getUserCarbonLogs(userId: string): Promise<CarbonLog[]> {
    const snapshot = await this.db
      .collection("carbonLogs")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    return snapshot.docs.map((doc) =>
      this.convertFromFirestore(doc.data()) as CarbonLog
    );
  }

  /**
   * Get user game scores
   */
  private async getUserGameScores(userId: string): Promise<GameScore[]> {
    const snapshot = await this.db
      .collection("gameScores")
      .where("userId", "==", userId)
      .orderBy("completedAt", "desc")
      .limit(100)
      .get();

    return snapshot.docs.map((doc) =>
      this.convertFromFirestore(doc.data()) as GameScore
    );
  }

  /**
   * Get user redemptions
   */
  private async getUserRedemptions(userId: string): Promise<Redemption[]> {
    const snapshot = await this.db
      .collection("redemptions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    return snapshot.docs.map((doc) =>
      this.convertFromFirestore(doc.data()) as Redemption
    );
  }

  /**
   * Get user subscriptions
   */
  private async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const snapshot = await this.db
      .collection("subscriptions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    return snapshot.docs.map((doc) =>
      this.convertFromFirestore(doc.data()) as Subscription
    );
  }

  /**
   * Get user carbon stats
   */
  private async getUserCarbonStats(userId: string): Promise<any> {
    const statsDoc = await this.db.collection("carbonStats").doc(userId).get();

    if (!statsDoc.exists) {
      return {
        totalCo2Saved: 0,
        lastUpdated: new Date(),
      };
    }

    return this.convertFromFirestore(statsDoc.data());
  }

  /**
   * Get user mood logs
   */
  private async getUserMoodLogs(userId: string): Promise<any[]> {
    const snapshot = await this.db
      .collection("moodLogs")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(30)
      .get();

    return snapshot.docs.map((doc) =>
      this.convertFromFirestore(doc.data())
    );
  }

  /**
   * Get user animal welfare logs
   */
  private async getUserAnimalWelfareLogs(userId: string): Promise<any[]> {
    const snapshot = await this.db
      .collection("animalWelfareLogs")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(30)
      .get();

    return snapshot.docs.map((doc) =>
      this.convertFromFirestore(doc.data())
    );
  }

  /**
   * Calculate carbon trends
   */
  private calculateCarbonTrends(carbonLogs: CarbonLog[]): any[] {
    const trends = new Map<string, number>();

    carbonLogs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      trends.set(date, (trends.get(date) || 0) + log.co2Saved);
    });

    return Array.from(trends.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, co2Saved]) => ({date, co2Saved}));
  }

  /**
   * Calculate mood trends
   */
  private calculateMoodTrends(moodLogs: any[]): any[] {
    const trends = new Map<string, { mood: number; energy: number; stress: number; count: number }>();

    moodLogs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      const current = trends.get(date) || {mood: 0, energy: 0, stress: 0, count: 0};
      trends.set(date, {
        mood: current.mood + log.mood,
        energy: current.energy + log.energy,
        stress: current.stress + log.stress,
        count: current.count + 1,
      });
    });

    return Array.from(trends.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        mood: data.count > 0 ? data.mood / data.count : 0,
        energy: data.count > 0 ? data.energy / data.count : 0,
        stress: data.count > 0 ? data.stress / data.count : 0,
      }));
  }

  /**
   * Calculate game trends
   */
  private calculateGameTrends(gameScores: GameScore[]): any[] {
    const trends = new Map<string, { score: number; count: number }>();

    gameScores.forEach((score) => {
      const date = new Date(score.completedAt).toISOString().split("T")[0];
      const current = trends.get(date) || {score: 0, count: 0};
      trends.set(date, {
        score: current.score + score.score,
        count: current.count + 1,
      });
    });

    return Array.from(trends.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        score: data.count > 0 ? data.score / data.count : 0,
        count: data.count,
      }));
  }

  /**
   * Get recent activity
   */
  private getRecentActivity(carbonLogs: CarbonLog[], gameScores: GameScore[], redemptions: Redemption[]): any[] {
    const activities: any[] = [];

    // Add carbon activities
    carbonLogs.slice(0, 5).forEach((log) => {
      activities.push({
        type: "carbon",
        action: log.action,
        co2Saved: log.co2Saved,
        timestamp: log.timestamp,
      });
    });

    // Add game activities
    gameScores.slice(0, 5).forEach((score) => {
      activities.push({
        type: "game",
        action: `Completed ${score.gameName}`,
        score: score.score,
        timestamp: score.completedAt,
      });
    });

    // Add redemption activities
    redemptions.slice(0, 5).forEach((redemption) => {
      activities.push({
        type: "redemption",
        action: `Redeemed ${redemption.rewardName}`,
        cost: redemption.cost,
        timestamp: redemption.createdAt,
      });
    });

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())
      .slice(0, 10);
  }

  /**
   * Get user achievements
   */
  private getUserAchievements(carbonStats: any, gameScores: GameScore[], redemptions: Redemption[]): any[] {
    const achievements = [];

    // Carbon achievements
    if (carbonStats.totalCo2Saved >= 100) {
      achievements.push({
        id: "carbon_100",
        name: "Carbon Saver",
        description: "Saved 100kg of CO2",
        icon: "🌱",
        unlocked: true,
      });
    }

    if (carbonStats.totalCo2Saved >= 500) {
      achievements.push({
        id: "carbon_500",
        name: "Climate Champion",
        description: "Saved 500kg of CO2",
        icon: "🌍",
        unlocked: true,
      });
    }

    // Game achievements
    if (gameScores.length >= 10) {
      achievements.push({
        id: "games_10",
        name: "Game Master",
        description: "Completed 10 games",
        icon: "🎮",
        unlocked: true,
      });
    }

    // Redemption achievements
    if (redemptions.length >= 5) {
      achievements.push({
        id: "redemptions_5",
        name: "Reward Hunter",
        description: "Redeemed 5 rewards",
        icon: "🎁",
        unlocked: true,
      });
    }

    return achievements;
  }

  /**
   * Get user leaderboard position
   */
  private async getUserLeaderboardPosition(userId: string): Promise<number> {
    const userStats = await this.getUserCarbonStats(userId);
    const totalCo2Saved = userStats.totalCo2Saved || 0;

    const higherUsers = await this.db
      .collection("carbonStats")
      .where("totalCo2Saved", ">", totalCo2Saved)
      .get();

    return higherUsers.size + 1;
  }

  /**
   * Get team members
   */
  private async getTeamMembers(userId: string, entityType: string): Promise<User[]> {
    // This would need to be implemented based on your team structure
    // For now, return empty array
    return [];
  }

  /**
   * Calculate team metrics
   */
  private async calculateTeamMetrics(teamMembers: User[]): Promise<any> {
    // This would calculate team-wide metrics
    return {
      totalMembers: teamMembers.length,
      totalCo2Saved: 0,
      totalCoinsEarned: 0,
      averageScore: 0,
    };
  }

  /**
   * Calculate entity metrics
   */
  private calculateEntityMetrics(entityType: string, carbonLogs: CarbonLog[], gameScores: GameScore[]): any {
    const totalCo2Saved = carbonLogs.reduce((sum, log) => sum + log.co2Saved, 0);
    const totalCoinsEarned = gameScores.reduce((sum, score) => sum + score.score, 0);

    return {
      totalCo2Saved,
      totalCoinsEarned,
      averageCo2PerAction: carbonLogs.length > 0 ? totalCo2Saved / carbonLogs.length : 0,
      averageScorePerGame: gameScores.length > 0 ? totalCoinsEarned / gameScores.length : 0,
    };
  }

  /**
   * Get total users
   */
  private async getTotalUsers(): Promise<number> {
    const snapshot = await this.db.collection("users").get();
    return snapshot.size;
  }

  /**
   * Get total CO2 saved
   */
  private async getTotalCo2Saved(): Promise<number> {
    const snapshot = await this.db.collection("carbonStats").get();
    return snapshot.docs.reduce((sum, doc) => {
      const stats = doc.data();
      return sum + (stats.totalCo2Saved || 0);
    }, 0);
  }

  /**
   * Get total coins earned
   */
  private async getTotalCoinsEarned(): Promise<number> {
    const snapshot = await this.db.collection("wallets").get();
    return snapshot.docs.reduce((sum, doc) => {
      const wallet = doc.data();
      return sum + (wallet.totalEarned || 0);
    }, 0);
  }

  /**
   * Get total coins redeemed
   */
  private async getTotalCoinsRedeemed(): Promise<number> {
    const snapshot = await this.db.collection("wallets").get();
    return snapshot.docs.reduce((sum, doc) => {
      const wallet = doc.data();
      return sum + (wallet.totalRedeemed || 0);
    }, 0);
  }

  /**
   * Get active subscriptions
   */
  private async getActiveSubscriptions(): Promise<number> {
    const snapshot = await this.db.collection("subscriptions").where("status", "==", "active").get();
    return snapshot.size;
  }

  /**
   * Get ward stats
   */
  private async getWardStats(): Promise<any[]> {
    const snapshot = await this.db.collection("wards").get();
    return snapshot.docs.map((doc) => this.convertFromFirestore(doc.data()));
  }

  /**
   * Get carbon trends
   */
  private async getCarbonTrends(): Promise<any[]> {
    // This would calculate global carbon trends
    return [];
  }

  /**
   * Get game trends
   */
  private async getGameTrends(): Promise<any[]> {
    // This would calculate global game trends
    return [];
  }

  /**
   * Get user trends
   */
  private async getUserTrends(): Promise<any[]> {
    // This would calculate user growth trends
    return [];
  }

  /**
   * Calculate government KPIs
   */
  private calculateGovernmentKPIs(totalUsers: number, totalCo2Saved: number, activeSubscriptions: number): any {
    return {
      userEngagement: activeSubscriptions / totalUsers,
      co2PerUser: totalUsers > 0 ? totalCo2Saved / totalUsers : 0,
      adoptionRate: totalUsers / 100000, // Assuming 100k target population
    };
  }

  /**
   * Get total revenue
   */
  private async getTotalRevenue(): Promise<number> {
    const snapshot = await this.db.collection("payments").where("status", "==", "completed").get();
    return snapshot.docs.reduce((sum, doc) => {
      const payment = doc.data();
      return sum + (payment.amount || 0);
    }, 0);
  }

  /**
   * Get system health
   */
  private async getSystemHealth(): Promise<any> {
    // This would calculate system health metrics
    return {
      status: "healthy",
      uptime: 99.9,
      responseTime: 150,
    };
  }

  /**
   * Get error logs
   */
  private async getErrorLogs(): Promise<any[]> {
    const snapshot = await this.db.collection("errorLogs").orderBy("timestamp", "desc").limit(10).get();
    return snapshot.docs.map((doc) => this.convertFromFirestore(doc.data()));
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(): Promise<any> {
    const snapshot = await this.db.collection("perfMetrics").orderBy("timestamp", "desc").limit(10).get();
    return snapshot.docs.map((doc) => this.convertFromFirestore(doc.data()));
  }

  /**
   * Get fraud alerts
   */
  private async getFraudAlerts(): Promise<any[]> {
    const snapshot = await this.db.collection("fraudAlerts").orderBy("timestamp", "desc").limit(10).get();
    return snapshot.docs.map((doc) => this.convertFromFirestore(doc.data()));
  }

  /**
   * Calculate admin analytics
   */
  private calculateAdminAnalytics(totalUsers: number, totalCo2Saved: number, activeSubscriptions: number, totalRevenue: number): any {
    return {
      userEngagement: activeSubscriptions / totalUsers,
      co2PerUser: totalUsers > 0 ? totalCo2Saved / totalUsers : 0,
      revenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
      conversionRate: activeSubscriptions / totalUsers,
    };
  }
}

export const dashboardService = new DashboardService();
