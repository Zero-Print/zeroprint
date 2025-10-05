import {db} from "./firebase";
import {DeploymentLog, ErrorLog} from "../types";

export interface NotificationConfig {
  slack?: {
    webhookUrl: string;
    channel: string;
  };
  discord?: {
    webhookUrl: string;
  };
}

export class LoggingService {
  private notificationConfig: NotificationConfig;

  constructor(config: NotificationConfig = {}) {
    this.notificationConfig = config;
  }

  /**
   * Log deployment events
   */
  async logDeployment(data: {
    environment: "staging" | "production";
    service: "frontend" | "backend";
    version: string;
    status: "started" | "success" | "failed";
    branch: string;
    commitHash: string;
    deployedBy?: string;
    duration?: number;
    details?: any;
  }): Promise<void> {
    try {
      const deploymentLog: DeploymentLog = {
        id: `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        environment: data.environment,
        service: data.service,
        version: data.version,
        status: data.status,
        branch: data.branch,
        commitHash: data.commitHash,
        deployedBy: data.deployedBy,
        duration: data.duration,
        details: data.details,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      await db.collection("deployLogs").doc(deploymentLog.id).set(deploymentLog);

      // Send notifications for important events
      if (data.status === "failed" || (data.status === "success" && data.environment === "production")) {
        await this.sendNotification({
          type: "deployment",
          title: `Deployment ${data.status.toUpperCase()}`,
          message: `${data.service} deployment to ${data.environment} ${data.status}`,
          details: {
            version: data.version,
            branch: data.branch,
            duration: data.duration,
          },
          severity: data.status === "failed" ? "error" : "info",
        });
      }

      console.log(`Deployment log created: ${deploymentLog.id}`);
    } catch (error) {
      console.error("Failed to log deployment:", error);
    }
  }

  /**
   * Log application errors
   */
  async logError(data: {
    service: "frontend" | "backend";
    environment: string;
    errorType: "runtime" | "build" | "api" | "database" | "auth";
    message: string;
    stack?: string;
    userId?: string;
    requestId?: string;
    endpoint?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        service: data.service,
        environment: data.environment,
        errorType: data.errorType,
        message: data.message,
        stack: data.stack,
        userId: data.userId,
        requestId: data.requestId,
        endpoint: data.endpoint,
        userAgent: data.userAgent,
        metadata: data.metadata,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      await db.collection("errorLogs").doc(errorLog.id).set(errorLog);

      // Send notifications for critical errors
      if (data.errorType === "database" || data.errorType === "auth") {
        await this.sendNotification({
          type: "error",
          title: `Critical Error - ${data.errorType.toUpperCase()}`,
          message: data.message,
          details: {
            service: data.service,
            environment: data.environment,
            endpoint: data.endpoint,
            userId: data.userId,
          },
          severity: "error",
        });
      }

      console.log(`Error log created: ${errorLog.id}`);
    } catch (error) {
      console.error("Failed to log error:", error);
    }
  }

  /**
   * Send notifications to Slack/Discord
   */
  private async sendNotification(notification: {
    type: "deployment" | "error" | "alert";
    title: string;
    message: string;
    details?: any;
    severity: "info" | "warning" | "error";
  }): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const color = this.getSeverityColor(notification.severity);

      // Send to Slack
      if (this.notificationConfig.slack) {
        await this.sendSlackNotification({
          ...notification,
          color,
          timestamp,
        });
      }

      // Send to Discord
      if (this.notificationConfig.discord) {
        await this.sendDiscordNotification({
          ...notification,
          color,
          timestamp,
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  private async sendSlackNotification(data: any): Promise<void> {
    if (!this.notificationConfig.slack) return;

    const payload = {
      channel: this.notificationConfig.slack.channel,
      username: "ZeroPrint Bot",
      icon_emoji: ":herb:",
      attachments: [
        {
          color: data.color,
          title: data.title,
          text: data.message,
          fields: data.details ? Object.entries(data.details).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true,
          })) : [],
          footer: "ZeroPrint Monitoring",
          ts: Math.floor(new Date(data.timestamp).getTime() / 1000),
        },
      ],
    };

    await fetch(this.notificationConfig.slack.webhookUrl, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });
  }

  private async sendDiscordNotification(data: any): Promise<void> {
    if (!this.notificationConfig.discord) return;

    const payload = {
      embeds: [
        {
          title: data.title,
          description: data.message,
          color: parseInt(data.color.replace("#", ""), 16),
          fields: data.details ? Object.entries(data.details).map(([key, value]) => ({
            name: key,
            value: String(value),
            inline: true,
          })) : [],
          footer: {
            text: "ZeroPrint Monitoring",
          },
          timestamp: data.timestamp,
        },
      ],
    };

    await fetch(this.notificationConfig.discord.webhookUrl, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      info: "#36a64f",
      warning: "#ff9500",
      error: "#ff0000",
    };
    return colors[severity as keyof typeof colors] || colors.info;
  }

  /**
   * Get deployment logs with filtering
   */
  async getDeploymentLogs(filters: {
    environment?: string;
    service?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}, limit: number = 100): Promise<DeploymentLog[]> {
    try {
      let query = db.collection("deployLogs").orderBy("timestamp", "desc");

      if (filters.environment) {
        query = query.where("environment", "==", filters.environment);
      }
      if (filters.service) {
        query = query.where("service", "==", filters.service);
      }
      if (filters.status) {
        query = query.where("status", "==", filters.status);
      }
      if (filters.startDate) {
        query = query.where("timestamp", ">=", filters.startDate);
      }
      if (filters.endDate) {
        query = query.where("timestamp", "<=", filters.endDate);
      }

      const snapshot = await query.limit(limit).get();
      return snapshot.docs.map((doc) => doc.data() as DeploymentLog);
    } catch (error) {
      throw new Error(`Failed to get deployment logs: ${error}`);
    }
  }

  /**
   * Get error logs with filtering
   */
  async getErrorLogs(filters: {
    service?: string;
    environment?: string;
    errorType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}, limit: number = 100): Promise<ErrorLog[]> {
    try {
      let query = db.collection("errorLogs").orderBy("timestamp", "desc");

      if (filters.service) {
        query = query.where("service", "==", filters.service);
      }
      if (filters.environment) {
        query = query.where("environment", "==", filters.environment);
      }
      if (filters.errorType) {
        query = query.where("errorType", "==", filters.errorType);
      }
      if (filters.userId) {
        query = query.where("userId", "==", filters.userId);
      }
      if (filters.startDate) {
        query = query.where("timestamp", ">=", filters.startDate);
      }
      if (filters.endDate) {
        query = query.where("timestamp", "<=", filters.endDate);
      }

      const snapshot = await query.limit(limit).get();
      return snapshot.docs.map((doc) => doc.data() as ErrorLog);
    } catch (error) {
      throw new Error(`Failed to get error logs: ${error}`);
    }
  }
}

// Initialize logging service with environment variables
export const loggingService = new LoggingService({
  slack: process.env.SLACK_WEBHOOK_URL ? {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: process.env.SLACK_CHANNEL || "#zeroprint-alerts",
  } : undefined,
  discord: process.env.DISCORD_WEBHOOK_URL ? {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
  } : undefined,
});

// Export convenience functions
export const logDeployment = (data: any) => loggingService.logDeployment(data);
export const logError = (data: any) => loggingService.logError(data);
