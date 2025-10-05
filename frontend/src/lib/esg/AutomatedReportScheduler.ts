'use client';

import { ESGMetricsEngine, ESGRawData } from './ESGMetricsEngine';
import { PDFReportGenerator, ReportConfig } from './PDFReportGenerator';

// ============================================================================
// AUTOMATED REPORT SCHEDULER
// ============================================================================

export interface ScheduleConfig {
  entityId: string;
  entityName: string;
  entityType: 'school' | 'msme';
  frequency: 'monthly' | 'quarterly' | 'annually';
  dayOfMonth: number; // 1-28 for monthly, 1-31 for quarterly/annually
  recipients: EmailRecipient[];
  reportConfig: Partial<ReportConfig>;
  isActive: boolean;
  timezone: string;
  customMessage?: string;
}

export interface EmailRecipient {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'stakeholder' | 'board_member';
  includeExecutiveSummary: boolean;
  includeFullReport: boolean;
}

export interface ScheduledReport {
  id: string;
  scheduleId: string;
  entityId: string;
  reportType: 'esg_monthly' | 'esg_quarterly' | 'esg_annual';
  scheduledDate: Date;
  generatedDate?: Date;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';
  reportUrl?: string;
  emailsSent: number;
  emailsFailed: number;
  errorMessage?: string;
  retryCount: number;
  nextRetryDate?: Date;
}

export interface ReportDeliveryStatus {
  reportId: string;
  recipient: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sentDate?: Date;
  errorMessage?: string;
  openedDate?: Date;
  downloadedDate?: Date;
}

export class AutomatedReportScheduler {
  private static instance: AutomatedReportScheduler;
  private schedules: Map<string, ScheduleConfig> = new Map();
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private deliveryStatuses: Map<string, ReportDeliveryStatus[]> = new Map();
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;

  public static getInstance(): AutomatedReportScheduler {
    if (!AutomatedReportScheduler.instance) {
      AutomatedReportScheduler.instance = new AutomatedReportScheduler();
    }
    return AutomatedReportScheduler.instance;
  }

  /**
   * Initialize the scheduler
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadSchedulesFromStorage();
      await this.loadScheduledReportsFromStorage();
      this.startScheduler();
      console.log('Automated Report Scheduler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
      throw error;
    }
  }

  /**
   * Create a new report schedule
   */
  public async createSchedule(config: ScheduleConfig): Promise<string> {
    try {
      const scheduleId = this.generateScheduleId();
      
      // Validate configuration
      this.validateScheduleConfig(config);
      
      // Store schedule
      this.schedules.set(scheduleId, { ...config });
      
      // Save to persistent storage
      await this.saveSchedulesToStorage();
      
      // Generate upcoming scheduled reports
      await this.generateUpcomingReports(scheduleId, config);
      
      console.log(`Created schedule ${scheduleId} for ${config.entityName}`);
      return scheduleId;
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw error;
    }
  }

  /**
   * Update an existing schedule
   */
  public async updateSchedule(scheduleId: string, updates: Partial<ScheduleConfig>): Promise<void> {
    try {
      const existingSchedule = this.schedules.get(scheduleId);
      if (!existingSchedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      const updatedSchedule = { ...existingSchedule, ...updates };
      this.validateScheduleConfig(updatedSchedule);
      
      this.schedules.set(scheduleId, updatedSchedule);
      await this.saveSchedulesToStorage();
      
      // Regenerate upcoming reports if schedule changed
      if (updates.frequency || updates.dayOfMonth || updates.isActive !== undefined) {
        await this.regenerateUpcomingReports(scheduleId, updatedSchedule);
      }
      
      console.log(`Updated schedule ${scheduleId}`);
    } catch (error) {
      console.error('Failed to update schedule:', error);
      throw error;
    }
  }

  /**
   * Delete a schedule
   */
  public async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      if (!this.schedules.has(scheduleId)) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      // Cancel pending reports for this schedule
      await this.cancelPendingReports(scheduleId);
      
      // Remove schedule
      this.schedules.delete(scheduleId);
      await this.saveSchedulesToStorage();
      
      console.log(`Deleted schedule ${scheduleId}`);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      throw error;
    }
  }

  /**
   * Get all schedules
   */
  public getSchedules(): ScheduleConfig[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Get schedule by ID
   */
  public getSchedule(scheduleId: string): ScheduleConfig | undefined {
    return this.schedules.get(scheduleId);
  }

  /**
   * Get scheduled reports
   */
  public getScheduledReports(entityId?: string): ScheduledReport[] {
    const reports = Array.from(this.scheduledReports.values());
    return entityId ? reports.filter(r => r.entityId === entityId) : reports;
  }

  /**
   * Get report delivery status
   */
  public getDeliveryStatus(reportId: string): ReportDeliveryStatus[] {
    return this.deliveryStatuses.get(reportId) || [];
  }

  /**
   * Manually trigger report generation
   */
  public async generateReportNow(scheduleId: string): Promise<string> {
    try {
      const schedule = this.schedules.get(scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      const reportId = this.generateReportId();
      const scheduledReport: ScheduledReport = {
        id: reportId,
        scheduleId,
        entityId: schedule.entityId,
        reportType: this.getReportType(schedule.frequency),
        scheduledDate: new Date(),
        status: 'pending',
        emailsSent: 0,
        emailsFailed: 0,
        retryCount: 0
      };

      this.scheduledReports.set(reportId, scheduledReport);
      await this.processReport(reportId);
      
      return reportId;
    } catch (error) {
      console.error('Failed to generate report manually:', error);
      throw error;
    }
  }

  /**
   * Start the scheduler
   */
  private startScheduler(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Check for pending reports every minute
    this.intervalId = setInterval(async () => {
      try {
        await this.processPendingReports();
      } catch (error) {
        console.error('Error processing pending reports:', error);
      }
    }, 60000); // 1 minute

    console.log('Report scheduler started');
  }

  /**
   * Stop the scheduler
   */
  public stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log('Report scheduler stopped');
  }

  /**
   * Process pending reports
   */
  private async processPendingReports(): Promise<void> {
    const now = new Date();
    const pendingReports = Array.from(this.scheduledReports.values())
      .filter(report => 
        report.status === 'pending' && 
        report.scheduledDate <= now
      );

    for (const report of pendingReports) {
      try {
        await this.processReport(report.id);
      } catch (error) {
        console.error(`Failed to process report ${report.id}:`, error);
        await this.handleReportError(report.id, error as Error);
      }
    }
  }

  /**
   * Process a single report
   */
  private async processReport(reportId: string): Promise<void> {
    const report = this.scheduledReports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    const schedule = this.schedules.get(report.scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${report.scheduleId} not found`);
    }

    try {
      // Update status to generating
      report.status = 'generating';
      this.scheduledReports.set(reportId, report);

      // Fetch entity data
      const rawData = await this.fetchEntityData(schedule.entityId);
      
      // Calculate metrics
      const metricsEngine = ESGMetricsEngine.getInstance();
      const calculatedMetrics = metricsEngine.calculateESGMetrics(rawData);
      
      // Generate PDF report
      const pdfGenerator = PDFReportGenerator.getInstance();
      const reportConfig: ReportConfig = {
        entityName: schedule.entityName,
        entityType: schedule.entityType,
        reportingPeriod: this.getReportingPeriod(report.reportType),
        includeCharts: true,
        includeBenchmarks: true,
        includeRecommendations: true,
        includeExecutiveSummary: true,
        ...schedule.reportConfig
      };
      
      const reportUrl = await pdfGenerator.generateESGReport(rawData, calculatedMetrics, reportConfig);
      
      // Update report with generated URL
      report.reportUrl = reportUrl;
      report.generatedDate = new Date();
      report.status = 'completed';
      this.scheduledReports.set(reportId, report);
      
      // Send emails to recipients
      await this.sendReportEmails(reportId, schedule, reportUrl);
      
      console.log(`Successfully processed report ${reportId}`);
    } catch (error) {
      await this.handleReportError(reportId, error as Error);
      throw error;
    }
  }

  /**
   * Send report emails to recipients
   */
  private async sendReportEmails(reportId: string, schedule: ScheduleConfig, reportUrl: string): Promise<void> {
    const deliveryStatuses: ReportDeliveryStatus[] = [];
    
    for (const recipient of schedule.recipients) {
      try {
        const status: ReportDeliveryStatus = {
          reportId,
          recipient: recipient.email,
          status: 'pending'
        };

        // Simulate email sending (in real implementation, use email service)
        await this.sendEmail(recipient, schedule, reportUrl);
        
        status.status = 'sent';
        status.sentDate = new Date();
        
        deliveryStatuses.push(status);
        
        // Update report email count
        const report = this.scheduledReports.get(reportId)!;
        report.emailsSent++;
        this.scheduledReports.set(reportId, report);
        
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        
        deliveryStatuses.push({
          reportId,
          recipient: recipient.email,
          status: 'failed',
          errorMessage: (error as Error).message
        });
        
        // Update report email failed count
        const report = this.scheduledReports.get(reportId)!;
        report.emailsFailed++;
        this.scheduledReports.set(reportId, report);
      }
    }
    
    this.deliveryStatuses.set(reportId, deliveryStatuses);
  }

  /**
   * Send email to recipient (mock implementation)
   */
  private async sendEmail(recipient: EmailRecipient, schedule: ScheduleConfig, reportUrl: string): Promise<void> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailContent = this.generateEmailContent(recipient, schedule, reportUrl);
    
    // In real implementation, use email service like SendGrid, AWS SES, etc.
    console.log(`Email sent to ${recipient.email}:`, emailContent.subject);
  }

  /**
   * Generate email content
   */
  private generateEmailContent(recipient: EmailRecipient, schedule: ScheduleConfig, reportUrl: string) {
    const subject = `ESG Report - ${schedule.entityName} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    
    const body = `
Dear ${recipient.name},

Your automated ESG report for ${schedule.entityName} is now available.

Report Details:
- Entity: ${schedule.entityName}
- Type: ${schedule.entityType.toUpperCase()}
- Period: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
- Generated: ${new Date().toLocaleString()}

${schedule.customMessage || ''}

You can download the full report using the link below:
${reportUrl}

This report includes:
${recipient.includeExecutiveSummary ? '✓ Executive Summary\n' : ''}
${recipient.includeFullReport ? '✓ Complete ESG Analysis\n' : ''}
✓ Performance Metrics
✓ Industry Benchmarks
✓ Strategic Recommendations

If you have any questions about this report, please contact our ESG team.

Best regards,
ZeroPrint ESG Platform
    `;

    return { subject, body };
  }

  /**
   * Handle report generation errors
   */
  private async handleReportError(reportId: string, error: Error): Promise<void> {
    const report = this.scheduledReports.get(reportId);
    if (!report) return;

    report.status = 'failed';
    report.errorMessage = error.message;
    report.retryCount++;

    // Schedule retry if under retry limit
    if (report.retryCount < 3) {
      report.nextRetryDate = new Date(Date.now() + (report.retryCount * 60 * 60 * 1000)); // Exponential backoff
      report.status = 'pending';
    }

    this.scheduledReports.set(reportId, report);
    await this.saveScheduledReportsToStorage();
  }

  /**
   * Generate upcoming reports for a schedule
   */
  private async generateUpcomingReports(scheduleId: string, schedule: ScheduleConfig): Promise<void> {
    if (!schedule.isActive) return;

    const now = new Date();
    const upcomingDates = this.calculateUpcomingDates(schedule, now, 12); // Next 12 periods

    for (const date of upcomingDates) {
      const reportId = this.generateReportId();
      const scheduledReport: ScheduledReport = {
        id: reportId,
        scheduleId,
        entityId: schedule.entityId,
        reportType: this.getReportType(schedule.frequency),
        scheduledDate: date,
        status: 'pending',
        emailsSent: 0,
        emailsFailed: 0,
        retryCount: 0
      };

      this.scheduledReports.set(reportId, scheduledReport);
    }

    await this.saveScheduledReportsToStorage();
  }

  /**
   * Calculate upcoming report dates
   */
  private calculateUpcomingDates(schedule: ScheduleConfig, startDate: Date, count: number): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      let nextDate: Date;

      switch (schedule.frequency) {
        case 'monthly':
          nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, schedule.dayOfMonth);
          break;
        case 'quarterly':
          nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (i * 3) + 3, schedule.dayOfMonth);
          break;
        case 'annually':
          nextDate = new Date(currentDate.getFullYear() + i + 1, currentDate.getMonth(), schedule.dayOfMonth);
          break;
        default:
          throw new Error(`Unsupported frequency: ${schedule.frequency}`);
      }

      // Ensure date is in the future
      if (nextDate > startDate) {
        dates.push(nextDate);
      }
    }

    return dates;
  }

  /**
   * Fetch entity data (mock implementation)
   */
  private async fetchEntityData(entityId: string): Promise<ESGRawData> {
    // In real implementation, fetch from API
    const metricsEngine = ESGMetricsEngine.getInstance();
    return metricsEngine.generateMockData('msme');
  }

  /**
   * Helper methods
   */
  private validateScheduleConfig(config: ScheduleConfig): void {
    if (!config.entityId || !config.entityName) {
      throw new Error('Entity ID and name are required');
    }
    if (!['school', 'msme'].includes(config.entityType)) {
      throw new Error('Invalid entity type');
    }
    if (!['monthly', 'quarterly', 'annually'].includes(config.frequency)) {
      throw new Error('Invalid frequency');
    }
    if (config.dayOfMonth < 1 || config.dayOfMonth > 28) {
      throw new Error('Day of month must be between 1 and 28');
    }
    if (!config.recipients || config.recipients.length === 0) {
      throw new Error('At least one recipient is required');
    }
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getReportType(frequency: string): 'esg_monthly' | 'esg_quarterly' | 'esg_annual' {
    switch (frequency) {
      case 'monthly': return 'esg_monthly';
      case 'quarterly': return 'esg_quarterly';
      case 'annually': return 'esg_annual';
      default: return 'esg_monthly';
    }
  }

  private getReportingPeriod(reportType: string): string {
    const now = new Date();
    switch (reportType) {
      case 'esg_monthly':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'esg_quarterly':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter} ${now.getFullYear()}`;
      case 'esg_annual':
        return now.getFullYear().toString();
      default:
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  private async cancelPendingReports(scheduleId: string): Promise<void> {
    const reportsToCancel = Array.from(this.scheduledReports.values())
      .filter(report => report.scheduleId === scheduleId && report.status === 'pending');

    for (const report of reportsToCancel) {
      report.status = 'cancelled';
      this.scheduledReports.set(report.id, report);
    }

    await this.saveScheduledReportsToStorage();
  }

  private async regenerateUpcomingReports(scheduleId: string, schedule: ScheduleConfig): Promise<void> {
    await this.cancelPendingReports(scheduleId);
    await this.generateUpcomingReports(scheduleId, schedule);
  }

  /**
   * Storage methods (mock implementation)
   */
  private async loadSchedulesFromStorage(): Promise<void> {
    // In real implementation, load from database or local storage
    const stored = localStorage.getItem('esg_report_schedules');
    if (stored) {
      const schedules = JSON.parse(stored);
      this.schedules = new Map(Object.entries(schedules));
    }
  }

  private async saveSchedulesToStorage(): Promise<void> {
    // In real implementation, save to database
    const schedulesObj = Object.fromEntries(this.schedules);
    localStorage.setItem('esg_report_schedules', JSON.stringify(schedulesObj));
  }

  private async loadScheduledReportsFromStorage(): Promise<void> {
    // In real implementation, load from database
    const stored = localStorage.getItem('esg_scheduled_reports');
    if (stored) {
      const reports = JSON.parse(stored);
      this.scheduledReports = new Map(Object.entries(reports));
    }
  }

  private async saveScheduledReportsToStorage(): Promise<void> {
    // In real implementation, save to database
    const reportsObj = Object.fromEntries(this.scheduledReports);
    localStorage.setItem('esg_scheduled_reports', JSON.stringify(reportsObj));
  }
}

export default AutomatedReportScheduler;