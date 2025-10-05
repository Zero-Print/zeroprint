import { test, expect } from '@playwright/test';
import { ResilientNavigation } from './utils/resilient-navigation';

test.describe('Admin Dashboard Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
    
    const navigation = new ResilientNavigation(page);
    
    try {
      // Attempt admin login with resilient approach
      const loginSuccess = await navigation.performLogin('admin@test.com', 'testpassword123');
      
      if (loginSuccess) {
        // Try to verify admin dashboard
        const dashboardSelectors = [
          '[data-testid="admin-dashboard"]',
          '[data-testid="dashboard"]',
          '.admin-dashboard',
          '.dashboard',
          'main',
          '[role="main"]'
        ];
        
        const dashboardElement = await navigation.waitForElement(dashboardSelectors);
        if (!dashboardElement) {
          console.log('Admin dashboard not found, but login completed');
        }
      } else {
        // Fallback: navigate directly to admin area
        console.log('Login failed, attempting direct navigation to admin area');
        await navigation.navigateToPage('/admin');
      }
    } catch (error) {
      // Ultimate fallback: just ensure page loaded
      console.log('Admin setup failed, using basic page verification');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test.describe('User Management', () => {
    test('should view and manage user accounts', async ({ page }) => {
      await page.goto('/admin/users');

      // Check user list
      await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount.greaterThan(0);

      // Search users
      await page.fill('[data-testid="user-search"]', 'john@example.com');
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount(1);

      // Filter users
      await page.selectOption('[data-testid="user-status-filter"]', 'active');
      await page.selectOption('[data-testid="user-type-filter"]', 'individual');
      await page.click('[data-testid="apply-filters-button"]');

      // View user details
      await page.click('[data-testid="user-row"]').first();
      await expect(page.locator('[data-testid="user-details-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-profile-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-activity-log"]')).toBeVisible();

      // Edit user
      await page.click('[data-testid="edit-user-button"]');
      await page.selectOption('[data-testid="user-status-select"]', 'suspended');
      await page.fill('[data-testid="suspension-reason"]', 'Policy violation');
      await page.click('[data-testid="save-user-changes"]');

      await expect(page.locator('[data-testid="user-updated-success"]')).toBeVisible();

      // Check audit log
      await page.click('[data-testid="audit-log-tab"]');
      await expect(page.locator('[data-testid="audit-entries"]')).toContainText(
        'User status changed to suspended'
      );
    });

    test('should manage user roles and permissions', async ({ page }) => {
      await page.goto('/admin/users/roles');

      // Check existing roles
      await expect(page.locator('[data-testid="role-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-role"]')).toBeVisible();
      await expect(page.locator('[data-testid="moderator-role"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-role"]')).toBeVisible();

      // Create new role
      await page.click('[data-testid="create-role-button"]');
      await page.fill('[data-testid="role-name"]', 'ESG Auditor');
      await page.fill('[data-testid="role-description"]', 'Can audit ESG reports and data');

      // Set permissions
      await page.check('[data-testid="permission-view-esg-reports"]');
      await page.check('[data-testid="permission-audit-data"]');
      await page.check('[data-testid="permission-generate-compliance-reports"]');

      await page.click('[data-testid="save-role-button"]');
      await expect(page.locator('[data-testid="role-created-success"]')).toBeVisible();

      // Assign role to user
      await page.goto('/admin/users');
      await page.click('[data-testid="user-row"]').first();
      await page.click('[data-testid="assign-role-button"]');
      await page.selectOption('[data-testid="role-select"]', 'ESG Auditor');
      await page.click('[data-testid="confirm-role-assignment"]');

      await expect(page.locator('[data-testid="role-assigned-success"]')).toBeVisible();
    });

    test('should handle bulk user operations', async ({ page }) => {
      await page.goto('/admin/users');

      // Select multiple users
      await page.check('[data-testid="user-checkbox"]').first();
      await page.check('[data-testid="user-checkbox"]').nth(1);
      await page.check('[data-testid="user-checkbox"]').nth(2);

      // Bulk status change
      await page.click('[data-testid="bulk-actions-dropdown"]');
      await page.click('[data-testid="bulk-suspend-users"]');
      await page.fill('[data-testid="bulk-suspension-reason"]', 'Maintenance period');
      await page.click('[data-testid="confirm-bulk-action"]');

      await expect(page.locator('[data-testid="bulk-action-success"]')).toContainText(
        '3 users suspended'
      );

      // Bulk email notification
      await page.check('[data-testid="select-all-users"]');
      await page.click('[data-testid="bulk-actions-dropdown"]');
      await page.click('[data-testid="bulk-send-notification"]');

      await page.fill('[data-testid="notification-subject"]', 'Platform Maintenance Notice');
      await page.fill(
        '[data-testid="notification-message"]',
        'We will be performing maintenance on...'
      );
      await page.click('[data-testid="send-bulk-notification"]');

      await expect(page.locator('[data-testid="notification-sent-success"]')).toBeVisible();
    });

    test('should export user data', async ({ page }) => {
      await page.goto('/admin/users/export');

      // Configure export
      await page.check('[data-testid="export-basic-info"]');
      await page.check('[data-testid="export-activity-data"]');
      await page.check('[data-testid="export-esg-scores"]');

      await page.selectOption('[data-testid="export-format"]', 'csv');
      await page.selectOption('[data-testid="date-range"]', 'last_30_days');

      // Start export
      await page.click('[data-testid="start-export-button"]');

      // Wait for export completion
      await expect(page.locator('[data-testid="export-in-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-complete"]')).toBeVisible({ timeout: 30000 });

      // Download export
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-export-button"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('users-export');
    });
  });

  test.describe('System Monitoring', () => {
    test('should monitor system health and performance', async ({ page }) => {
      await page.goto('/admin/monitoring');

      // Check system overview
      await expect(page.locator('[data-testid="system-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="uptime-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="response-time-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-rate-metric"]')).toBeVisible();

      // Check service health
      await expect(page.locator('[data-testid="database-status"]')).toContainText('Healthy');
      await expect(page.locator('[data-testid="api-status"]')).toContainText('Healthy');
      await expect(page.locator('[data-testid="cache-status"]')).toContainText('Healthy');
      await expect(page.locator('[data-testid="storage-status"]')).toContainText('Healthy');

      // Check performance charts
      await expect(page.locator('[data-testid="cpu-usage-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="memory-usage-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="disk-usage-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="network-traffic-chart"]')).toBeVisible();

      // Check alerts
      await page.click('[data-testid="alerts-tab"]');
      await expect(page.locator('[data-testid="active-alerts"]')).toBeVisible();

      // Acknowledge alert
      if ((await page.locator('[data-testid="alert-item"]').count()) > 0) {
        await page.click('[data-testid="alert-item"]').first();
        await page.click('[data-testid="acknowledge-alert-button"]');
        await page.fill('[data-testid="acknowledgment-note"]', 'Investigating the issue');
        await page.click('[data-testid="confirm-acknowledgment"]');

        await expect(page.locator('[data-testid="alert-acknowledged"]')).toBeVisible();
      }
    });

    test('should view and analyze system logs', async ({ page }) => {
      await page.goto('/admin/monitoring/logs');

      // Check log streams
      await expect(page.locator('[data-testid="log-streams"]')).toBeVisible();
      await expect(page.locator('[data-testid="application-logs"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-logs"]')).toBeVisible();
      await expect(page.locator('[data-testid="security-logs"]')).toBeVisible();

      // Filter logs
      await page.selectOption('[data-testid="log-level-filter"]', 'error');
      await page.selectOption('[data-testid="time-range-filter"]', 'last_hour');
      await page.fill('[data-testid="search-logs"]', 'payment');
      await page.click('[data-testid="apply-log-filters"]');

      // Check filtered results
      await expect(page.locator('[data-testid="log-entries"]')).toBeVisible();

      // View log details
      await page.click('[data-testid="log-entry"]').first();
      await expect(page.locator('[data-testid="log-details-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="log-timestamp"]')).toBeVisible();
      await expect(page.locator('[data-testid="log-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="log-stack-trace"]')).toBeVisible();

      // Export logs
      await page.click('[data-testid="export-logs-button"]');
      await page.selectOption('[data-testid="export-format"]', 'json');

      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="confirm-export"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('logs-export');
    });

    test('should configure monitoring alerts', async ({ page }) => {
      await page.goto('/admin/monitoring/alerts');

      // Create new alert rule
      await page.click('[data-testid="create-alert-button"]');

      await page.fill('[data-testid="alert-name"]', 'High Error Rate');
      await page.selectOption('[data-testid="alert-metric"]', 'error_rate');
      await page.selectOption('[data-testid="alert-condition"]', 'greater_than');
      await page.fill('[data-testid="alert-threshold"]', '5');
      await page.selectOption('[data-testid="alert-duration"]', '5_minutes');

      // Configure notifications
      await page.check('[data-testid="notify-email"]');
      await page.check('[data-testid="notify-slack"]');
      await page.fill(
        '[data-testid="notification-emails"]',
        'admin@zeroprint.com,ops@zeroprint.com'
      );

      await page.click('[data-testid="save-alert-rule"]');
      await expect(page.locator('[data-testid="alert-rule-created"]')).toBeVisible();

      // Test alert rule
      await page.click('[data-testid="test-alert-button"]');
      await expect(page.locator('[data-testid="alert-test-success"]')).toBeVisible();

      // Check alert history
      await page.click('[data-testid="alert-history-tab"]');
      await expect(page.locator('[data-testid="alert-history-list"]')).toBeVisible();
    });

    test('should manage system backups', async ({ page }) => {
      await page.goto('/admin/monitoring/backups');

      // Check backup status
      await expect(page.locator('[data-testid="backup-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="last-backup-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="backup-size"]')).toBeVisible();

      // Create manual backup
      await page.click('[data-testid="create-backup-button"]');
      await page.fill('[data-testid="backup-description"]', 'Pre-deployment backup');
      await page.check('[data-testid="include-user-data"]');
      await page.check('[data-testid="include-system-config"]');
      await page.check('[data-testid="include-logs"]');

      await page.click('[data-testid="start-backup"]');

      // Monitor backup progress
      await expect(page.locator('[data-testid="backup-in-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="backup-complete"]')).toBeVisible({ timeout: 60000 });

      // Check backup list
      await expect(page.locator('[data-testid="backup-list"]')).toContainText(
        'Pre-deployment backup'
      );

      // Test backup restoration
      await page.click('[data-testid="backup-item"]').first();
      await page.click('[data-testid="test-restore-button"]');
      await page.click('[data-testid="confirm-test-restore"]');

      await expect(page.locator('[data-testid="restore-test-success"]')).toBeVisible();
    });
  });

  test.describe('Platform Administration', () => {
    test('should manage platform settings', async ({ page }) => {
      await page.goto('/admin/settings');

      // General settings
      await page.click('[data-testid="general-settings-tab"]');
      await page.fill('[data-testid="platform-name"]', 'ZeroPrint ESG Platform');
      await page.fill('[data-testid="support-email"]', 'support@zeroprint.com');
      await page.fill('[data-testid="max-file-size"]', '50');
      await page.selectOption('[data-testid="default-timezone"]', 'Asia/Kolkata');

      // Security settings
      await page.click('[data-testid="security-settings-tab"]');
      await page.check('[data-testid="enable-2fa"]');
      await page.fill('[data-testid="session-timeout"]', '30');
      await page.fill('[data-testid="password-min-length"]', '8');
      await page.check('[data-testid="require-special-chars"]');

      // Email settings
      await page.click('[data-testid="email-settings-tab"]');
      await page.fill('[data-testid="smtp-server"]', 'smtp.gmail.com');
      await page.fill('[data-testid="smtp-port"]', '587');
      await page.fill('[data-testid="smtp-username"]', 'noreply@zeroprint.com');
      await page.check('[data-testid="enable-tls"]');

      // Save settings
      await page.click('[data-testid="save-settings-button"]');
      await expect(page.locator('[data-testid="settings-saved-success"]')).toBeVisible();

      // Test email configuration
      await page.click('[data-testid="test-email-button"]');
      await page.fill('[data-testid="test-email-recipient"]', 'admin@zeroprint.com');
      await page.click('[data-testid="send-test-email"]');

      await expect(page.locator('[data-testid="test-email-sent"]')).toBeVisible();
    });

    test('should manage content and announcements', async ({ page }) => {
      await page.goto('/admin/content');

      // Create announcement
      await page.click('[data-testid="create-announcement-button"]');

      await page.fill('[data-testid="announcement-title"]', 'Platform Maintenance Scheduled');
      await page.selectOption('[data-testid="announcement-type"]', 'maintenance');
      await page.selectOption('[data-testid="announcement-priority"]', 'high');

      await page.fill(
        '[data-testid="announcement-content"]',
        'We will be performing scheduled maintenance on...'
      );

      // Set display options
      await page.check('[data-testid="show-on-dashboard"]');
      await page.check('[data-testid="send-email-notification"]');
      await page.fill('[data-testid="display-start-date"]', '2024-07-01');
      await page.fill('[data-testid="display-end-date"]', '2024-07-03');

      await page.click('[data-testid="publish-announcement"]');
      await expect(page.locator('[data-testid="announcement-published"]')).toBeVisible();

      // Manage FAQ
      await page.click('[data-testid="faq-tab"]');
      await page.click('[data-testid="add-faq-button"]');

      await page.fill('[data-testid="faq-question"]', 'How do I calculate my carbon footprint?');
      await page.fill(
        '[data-testid="faq-answer"]',
        'To calculate your carbon footprint, you need to...'
      );
      await page.selectOption('[data-testid="faq-category"]', 'carbon_tracking');

      await page.click('[data-testid="save-faq"]');
      await expect(page.locator('[data-testid="faq-saved"]')).toBeVisible();

      // Update help documentation
      await page.click('[data-testid="help-docs-tab"]');
      await page.click('[data-testid="edit-doc-button"]').first();

      await page.fill('[data-testid="doc-content"]', 'Updated documentation content...');
      await page.click('[data-testid="save-doc"]');

      await expect(page.locator('[data-testid="doc-updated"]')).toBeVisible();
    });

    test('should manage integrations and APIs', async ({ page }) => {
      await page.goto('/admin/integrations');

      // Check existing integrations
      await expect(page.locator('[data-testid="integration-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="razorpay-integration"]')).toBeVisible();
      await expect(page.locator('[data-testid="firebase-integration"]')).toBeVisible();

      // Configure new integration
      await page.click('[data-testid="add-integration-button"]');
      await page.selectOption('[data-testid="integration-type"]', 'webhook');

      await page.fill('[data-testid="integration-name"]', 'ESG Data Webhook');
      await page.fill('[data-testid="webhook-url"]', 'https://api.partner.com/esg-data');
      await page.selectOption('[data-testid="webhook-method"]', 'POST');

      // Set authentication
      await page.selectOption('[data-testid="auth-type"]', 'bearer_token');
      await page.fill('[data-testid="auth-token"]', 'sk_test_webhook_token_123');

      // Configure events
      await page.check('[data-testid="event-user-registered"]');
      await page.check('[data-testid="event-esg-report-generated"]');
      await page.check('[data-testid="event-payment-completed"]');

      await page.click('[data-testid="save-integration"]');
      await expect(page.locator('[data-testid="integration-saved"]')).toBeVisible();

      // Test integration
      await page.click('[data-testid="test-integration-button"]');
      await expect(page.locator('[data-testid="integration-test-success"]')).toBeVisible();

      // Manage API keys
      await page.click('[data-testid="api-keys-tab"]');
      await page.click('[data-testid="generate-api-key-button"]');

      await page.fill('[data-testid="api-key-name"]', 'Mobile App API Key');
      await page.selectOption('[data-testid="api-key-scope"]', 'read_write');
      await page.fill('[data-testid="api-key-expiry"]', '2025-12-31');

      await page.click('[data-testid="generate-key"]');
      await expect(page.locator('[data-testid="api-key-generated"]')).toBeVisible();

      // Copy API key
      await page.click('[data-testid="copy-api-key-button"]');
      await expect(page.locator('[data-testid="api-key-copied"]')).toBeVisible();
    });

    test('should manage system maintenance', async ({ page }) => {
      await page.goto('/admin/maintenance');

      // Schedule maintenance
      await page.click('[data-testid="schedule-maintenance-button"]');

      await page.fill('[data-testid="maintenance-title"]', 'Database Optimization');
      await page.fill(
        '[data-testid="maintenance-description"]',
        'Optimizing database performance and indexes'
      );

      await page.fill('[data-testid="maintenance-start-time"]', '2024-07-01T02:00');
      await page.fill('[data-testid="maintenance-end-time"]', '2024-07-01T04:00');

      // Set maintenance options
      await page.check('[data-testid="enable-maintenance-mode"]');
      await page.check('[data-testid="notify-users"]');
      await page.fill('[data-testid="notification-advance-hours"]', '24');

      await page.click('[data-testid="schedule-maintenance"]');
      await expect(page.locator('[data-testid="maintenance-scheduled"]')).toBeVisible();

      // Check maintenance history
      await page.click('[data-testid="maintenance-history-tab"]');
      await expect(page.locator('[data-testid="maintenance-history-list"]')).toBeVisible();

      // Emergency maintenance mode
      await page.click('[data-testid="emergency-maintenance-tab"]');
      await page.click('[data-testid="enable-emergency-mode"]');

      await page.fill(
        '[data-testid="emergency-message"]',
        'Emergency maintenance in progress. Please try again later.'
      );
      await page.click('[data-testid="activate-emergency-mode"]');

      await expect(page.locator('[data-testid="emergency-mode-active"]')).toBeVisible();

      // Disable emergency mode
      await page.click('[data-testid="disable-emergency-mode"]');
      await expect(page.locator('[data-testid="emergency-mode-disabled"]')).toBeVisible();
    });
  });

  test.describe('Analytics and Reporting', () => {
    test('should view platform analytics', async ({ page }) => {
      await page.goto('/admin/analytics');

      // Check overview metrics
      await expect(page.locator('[data-testid="total-users-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-users-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="esg-reports-metric"]')).toBeVisible();

      // Check user analytics
      await page.click('[data-testid="user-analytics-tab"]');
      await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-engagement-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-retention-chart"]')).toBeVisible();

      // Check feature usage
      await page.click('[data-testid="feature-usage-tab"]');
      await expect(page.locator('[data-testid="feature-usage-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="most-used-features"]')).toBeVisible();
      await expect(page.locator('[data-testid="least-used-features"]')).toBeVisible();

      // Check performance metrics
      await page.click('[data-testid="performance-tab"]');
      await expect(page.locator('[data-testid="page-load-times"]')).toBeVisible();
      await expect(page.locator('[data-testid="api-response-times"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-rates"]')).toBeVisible();

      // Export analytics data
      await page.click('[data-testid="export-analytics-button"]');
      await page.selectOption('[data-testid="export-timeframe"]', 'last_30_days');
      await page.check('[data-testid="include-user-data"]');
      await page.check('[data-testid="include-performance-data"]');

      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-analytics"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('analytics-export');
    });

    test('should generate admin reports', async ({ page }) => {
      await page.goto('/admin/reports');

      // Generate user activity report
      await page.click('[data-testid="user-activity-report"]');
      await page.selectOption('[data-testid="report-period"]', 'monthly');
      await page.selectOption('[data-testid="report-month"]', '2024-06');

      await page.click('[data-testid="generate-report-button"]');
      await expect(page.locator('[data-testid="report-generating"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 30000 });

      // Check report content
      await expect(page.locator('[data-testid="report-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-statistics"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-trends"]')).toBeVisible();

      // Generate financial report
      await page.click('[data-testid="financial-report"]');
      await page.selectOption('[data-testid="financial-period"]', 'quarterly');
      await page.selectOption('[data-testid="financial-quarter"]', 'q2-2024');

      await page.click('[data-testid="generate-financial-report"]');
      await expect(page.locator('[data-testid="financial-report-ready"]')).toBeVisible({
        timeout: 30000,
      });

      // Check financial metrics
      await expect(page.locator('[data-testid="revenue-breakdown"]')).toBeVisible();
      await expect(page.locator('[data-testid="subscription-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-analytics"]')).toBeVisible();

      // Schedule automated reports
      await page.click('[data-testid="automated-reports-tab"]');
      await page.click('[data-testid="create-scheduled-report"]');

      await page.fill('[data-testid="report-name"]', 'Weekly User Activity');
      await page.selectOption('[data-testid="report-type"]', 'user_activity');
      await page.selectOption('[data-testid="report-frequency"]', 'weekly');
      await page.selectOption('[data-testid="report-day"]', 'monday');
      await page.fill(
        '[data-testid="report-recipients"]',
        'admin@zeroprint.com,management@zeroprint.com'
      );

      await page.click('[data-testid="save-scheduled-report"]');
      await expect(page.locator('[data-testid="scheduled-report-created"]')).toBeVisible();
    });
  });

  test.describe('Security and Compliance', () => {
    test('should monitor security events', async ({ page }) => {
      await page.goto('/admin/security');

      // Check security dashboard
      await expect(page.locator('[data-testid="security-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="failed-login-attempts"]')).toBeVisible();
      await expect(page.locator('[data-testid="suspicious-activities"]')).toBeVisible();
      await expect(page.locator('[data-testid="blocked-ips"]')).toBeVisible();

      // Check security events
      await page.click('[data-testid="security-events-tab"]');
      await expect(page.locator('[data-testid="security-events-list"]')).toBeVisible();

      // Filter security events
      await page.selectOption('[data-testid="event-type-filter"]', 'failed_login');
      await page.selectOption('[data-testid="severity-filter"]', 'high');
      await page.click('[data-testid="apply-security-filters"]');

      // Investigate security event
      await page.click('[data-testid="security-event"]').first();
      await expect(page.locator('[data-testid="event-details-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="event-timeline"]')).toBeVisible();
      await expect(page.locator('[data-testid="affected-user"]')).toBeVisible();

      // Block suspicious IP
      await page.click('[data-testid="block-ip-button"]');
      await page.fill('[data-testid="block-reason"]', 'Multiple failed login attempts');
      await page.click('[data-testid="confirm-ip-block"]');

      await expect(page.locator('[data-testid="ip-blocked-success"]')).toBeVisible();
    });

    test('should manage data privacy compliance', async ({ page }) => {
      await page.goto('/admin/privacy');

      // Check privacy dashboard
      await expect(page.locator('[data-testid="privacy-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-requests"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-status"]')).toBeVisible();

      // Handle data deletion request
      await page.click('[data-testid="data-requests-tab"]');
      await page.click('[data-testid="deletion-request"]').first();

      await expect(page.locator('[data-testid="request-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-data-summary"]')).toBeVisible();

      // Verify user identity
      await page.click('[data-testid="verify-identity-button"]');
      await page.check('[data-testid="identity-verified"]');

      // Process deletion
      await page.click('[data-testid="process-deletion-button"]');
      await page.check('[data-testid="confirm-data-deletion"]');
      await page.click('[data-testid="execute-deletion"]');

      await expect(page.locator('[data-testid="deletion-completed"]')).toBeVisible();

      // Generate privacy report
      await page.click('[data-testid="privacy-reports-tab"]');
      await page.click('[data-testid="generate-privacy-report"]');

      await page.selectOption('[data-testid="report-type"]', 'gdpr_compliance');
      await page.selectOption('[data-testid="report-period"]', 'monthly');

      await page.click('[data-testid="generate-report"]');
      await expect(page.locator('[data-testid="privacy-report-ready"]')).toBeVisible({
        timeout: 30000,
      });
    });

    test('should audit system access', async ({ page }) => {
      await page.goto('/admin/audit');

      // Check audit dashboard
      await expect(page.locator('[data-testid="audit-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-actions"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-access-logs"]')).toBeVisible();

      // Filter audit logs
      await page.selectOption('[data-testid="audit-action-filter"]', 'user_modification');
      await page.selectOption('[data-testid="audit-user-filter"]', 'admin@zeroprint.com');
      await page.fill('[data-testid="audit-date-from"]', '2024-06-01');
      await page.fill('[data-testid="audit-date-to"]', '2024-06-30');

      await page.click('[data-testid="apply-audit-filters"]');

      // Check audit results
      await expect(page.locator('[data-testid="audit-results"]')).toBeVisible();

      // Export audit log
      await page.click('[data-testid="export-audit-log"]');
      await page.selectOption('[data-testid="export-format"]', 'csv');

      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-audit-log"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('audit-log');

      // Create audit alert
      await page.click('[data-testid="audit-alerts-tab"]');
      await page.click('[data-testid="create-audit-alert"]');

      await page.fill('[data-testid="alert-name"]', 'Suspicious Admin Activity');
      await page.selectOption('[data-testid="alert-trigger"]', 'multiple_user_modifications');
      await page.fill('[data-testid="alert-threshold"]', '5');
      await page.selectOption('[data-testid="alert-timeframe"]', '1_hour');

      await page.click('[data-testid="save-audit-alert"]');
      await expect(page.locator('[data-testid="audit-alert-created"]')).toBeVisible();
    });
  });

  test.describe('Mobile and Accessibility', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/admin');

      // Assert core admin dashboard container and header
      await expect(page.getByTestId('admin-dashboard')).toBeVisible();
      await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

      // Tabs should be visible and operable on mobile
      await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'User Management' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Government Dashboard' })).toBeVisible();

      // Navigate to User Management tab and assert content
      await page.getByRole('button', { name: 'User Management' }).click();
      await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
      await expect(page.getByText('User Management Coming Soon')).toBeVisible();

      // Navigate to Government Dashboard tab and assert visible heading/text
      await page.getByRole('button', { name: 'Government Dashboard' }).click();
      await expect(page.getByText('Government Dashboard', { exact: false })).toBeVisible();

      // Back to Overview and check key sections render
      await page.getByRole('button', { name: 'Overview' }).click();
      await expect(page.getByRole('heading', { name: 'Recent System Alerts' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'System Status' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Administrative Tools' })).toBeVisible();
    });

    test('should be accessible to users with disabilities', async ({ page }) => {
      await page.goto('/admin');

      // Keyboard navigation: the Overview tab is focusable
      const overviewTab = page.getByRole('button', { name: 'Overview' });
      await overviewTab.focus();
      await expect(overviewTab).toBeFocused();

      // Headings are exposed to assistive tech
      await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Recent System Alerts' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'System Status' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Administrative Tools' })).toBeVisible();

      // High contrast/dark mode should not hide core UI
      await page.emulateMedia({ colorScheme: 'dark' });
      await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    });
  });
});
