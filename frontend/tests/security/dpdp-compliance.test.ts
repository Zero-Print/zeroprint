import { test, expect } from '@playwright/test';
import { createHash, randomBytes } from 'crypto';

test.describe('DPDP (Digital Personal Data Protection) Compliance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment with privacy controls
    await page.goto('/');
  });

  test.describe('Data Collection and Consent', () => {
    test('should display privacy notice before data collection', async ({ page }) => {
      await page.goto('/register');

      // Check privacy notice is displayed
      await expect(page.locator('[data-testid="privacy-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="privacy-notice"]')).toContainText(
        'Data Protection Notice'
      );

      // Check consent checkboxes
      await expect(page.locator('[data-testid="consent-data-processing"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-marketing"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-analytics"]')).toBeVisible();

      // Verify registration is blocked without consent
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'testpassword123');
      await page.click('[data-testid="register-button"]');

      await expect(page.locator('[data-testid="consent-required-error"]')).toBeVisible();

      // Provide consent and register
      await page.check('[data-testid="consent-data-processing"]');
      await page.click('[data-testid="register-button"]');

      // Verify consent is recorded
      await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
    });

    test('should allow granular consent management', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Navigate to privacy settings
      await page.goto('/settings/privacy');

      // Check consent management interface
      await expect(page.locator('[data-testid="consent-management"]')).toBeVisible();

      // Check individual consent toggles
      await expect(page.locator('[data-testid="consent-essential"]')).toBeChecked();
      await expect(page.locator('[data-testid="consent-essential"]')).toBeDisabled(); // Essential cannot be disabled

      // Toggle optional consents
      await page.uncheck('[data-testid="consent-marketing"]');
      await page.uncheck('[data-testid="consent-analytics"]');
      await page.check('[data-testid="consent-personalization"]');

      await page.click('[data-testid="save-consent-preferences"]');
      await expect(page.locator('[data-testid="consent-updated-success"]')).toBeVisible();

      // Verify consent changes are reflected
      await page.reload();
      await expect(page.locator('[data-testid="consent-marketing"]')).not.toBeChecked();
      await expect(page.locator('[data-testid="consent-analytics"]')).not.toBeChecked();
      await expect(page.locator('[data-testid="consent-personalization"]')).toBeChecked();
    });

    test('should record consent history and audit trail', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      await page.goto('/settings/privacy/history');

      // Check consent history
      await expect(page.locator('[data-testid="consent-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-record"]')).toHaveCount.greaterThan(0);

      // Check audit trail details
      await page.click('[data-testid="consent-record"]').first();
      await expect(page.locator('[data-testid="consent-timestamp"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-ip-address"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-user-agent"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-changes"]')).toBeVisible();
    });

    test('should handle consent withdrawal', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      await page.goto('/settings/privacy');

      // Withdraw all non-essential consents
      await page.click('[data-testid="withdraw-all-consent"]');
      await page.fill('[data-testid="withdrawal-reason"]', 'No longer wish to share data');
      await page.click('[data-testid="confirm-withdrawal"]');

      await expect(page.locator('[data-testid="consent-withdrawn-success"]')).toBeVisible();

      // Verify data processing is limited
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="limited-functionality-notice"]')).toBeVisible();

      // Check that analytics and marketing features are disabled
      await expect(page.locator('[data-testid="analytics-disabled"]')).toBeVisible();
      await expect(page.locator('[data-testid="marketing-disabled"]')).toBeVisible();
    });
  });

  test.describe('Data Subject Rights', () => {
    test('should provide data portability (right to data portability)', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      await page.goto('/settings/privacy/data-export');

      // Request data export
      await page.click('[data-testid="request-data-export"]');

      // Select data categories
      await page.check('[data-testid="export-profile-data"]');
      await page.check('[data-testid="export-esg-data"]');
      await page.check('[data-testid="export-transaction-history"]');
      await page.check('[data-testid="export-activity-logs"]');

      await page.selectOption('[data-testid="export-format"]', 'json');
      await page.click('[data-testid="submit-export-request"]');

      await expect(page.locator('[data-testid="export-request-submitted"]')).toBeVisible();

      // Check export status
      await expect(page.locator('[data-testid="export-status"]')).toContainText('Processing');

      // Simulate export completion and download
      await page.goto('/settings/privacy/data-export?status=completed');
      await expect(page.locator('[data-testid="export-ready"]')).toBeVisible();

      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-data-export"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('personal-data-export');
    });

    test('should handle data rectification requests', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      await page.goto('/settings/privacy/data-correction');

      // Submit data correction request
      await page.click('[data-testid="request-data-correction"]');

      await page.selectOption('[data-testid="data-category"]', 'profile_information');
      await page.fill('[data-testid="incorrect-data"]', 'Name: John Smith');
      await page.fill('[data-testid="correct-data"]', 'Name: John Doe');
      await page.fill('[data-testid="correction-reason"]', 'Legal name change');

      // Upload supporting documents
      await page.setInputFiles(
        '[data-testid="supporting-documents"]',
        'tests/fixtures/name-change-certificate.pdf'
      );

      await page.click('[data-testid="submit-correction-request"]');
      await expect(page.locator('[data-testid="correction-request-submitted"]')).toBeVisible();

      // Check request status
      await expect(page.locator('[data-testid="correction-status"]')).toContainText('Under Review');
    });

    test('should process data deletion requests (right to erasure)', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      await page.goto('/settings/privacy/data-deletion');

      // Request account deletion
      await page.click('[data-testid="request-account-deletion"]');

      // Show deletion impact
      await expect(page.locator('[data-testid="deletion-impact-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-to-be-deleted"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-retention-notice"]')).toBeVisible();

      // Confirm deletion understanding
      await page.check('[data-testid="understand-deletion-impact"]');
      await page.check('[data-testid="confirm-data-loss"]');

      // Provide deletion reason
      await page.selectOption('[data-testid="deletion-reason"]', 'no_longer_need_service');
      await page.fill('[data-testid="additional-comments"]', 'Moving to a different platform');

      // Final confirmation
      await page.fill('[data-testid="confirm-email"]', 'user@example.com');
      await page.fill('[data-testid="confirm-password"]', 'password123');

      await page.click('[data-testid="submit-deletion-request"]');
      await expect(page.locator('[data-testid="deletion-request-submitted"]')).toBeVisible();

      // Check deletion timeline
      await expect(page.locator('[data-testid="deletion-timeline"]')).toContainText('30 days');
    });

    test('should provide data access transparency', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      await page.goto('/settings/privacy/data-access');

      // Check data categories and purposes
      await expect(page.locator('[data-testid="data-categories"]')).toBeVisible();
      await expect(page.locator('[data-testid="processing-purposes"]')).toBeVisible();
      await expect(page.locator('[data-testid="legal-basis"]')).toBeVisible();

      // Check data sharing information
      await expect(page.locator('[data-testid="third-party-sharing"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-transfers"]')).toBeVisible();

      // Check retention periods
      await expect(page.locator('[data-testid="retention-periods"]')).toBeVisible();

      // View detailed data inventory
      await page.click('[data-testid="view-data-inventory"]');
      await expect(page.locator('[data-testid="data-inventory-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="personal-identifiers"]')).toBeVisible();
      await expect(page.locator('[data-testid="behavioral-data"]')).toBeVisible();
      await expect(page.locator('[data-testid="technical-data"]')).toBeVisible();
    });
  });

  test.describe('Data Security and Protection', () => {
    test('should enforce data encryption in transit and at rest', async ({ page }) => {
      // Check HTTPS enforcement
      await page.goto('http://localhost:3000');
      expect(page.url()).toMatch(/^https:/);

      // Check secure headers
      const response = await page.goto('/api/health');
      const headers = response?.headers();

      expect(headers?.['strict-transport-security']).toBeDefined();
      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['x-frame-options']).toBe('DENY');
      expect(headers?.['x-xss-protection']).toBe('1; mode=block');

      // Check CSP header
      expect(headers?.['content-security-policy']).toBeDefined();
    });

    test('should implement secure authentication', async ({ page }) => {
      await page.goto('/login');

      // Test password requirements
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', '123'); // Weak password
      await page.click('[data-testid="login-button"]');

      // Should show password strength requirements
      await expect(page.locator('[data-testid="password-requirements"]')).toBeVisible();

      // Test rate limiting
      for (let i = 0; i < 6; i++) {
        await page.fill('[data-testid="password-input"]', `wrongpassword${i}`);
        await page.click('[data-testid="login-button"]');
      }

      await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();

      // Test account lockout
      await expect(page.locator('[data-testid="account-locked-notice"]')).toBeVisible();
    });

    test('should implement session security', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Check secure session cookie
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session'));

      expect(sessionCookie?.secure).toBe(true);
      expect(sessionCookie?.httpOnly).toBe(true);
      expect(sessionCookie?.sameSite).toBe('Strict');

      // Test session timeout
      await page.goto('/settings/security');
      await expect(page.locator('[data-testid="session-timeout"]')).toBeVisible();

      // Test concurrent session management
      await expect(page.locator('[data-testid="active-sessions"]')).toBeVisible();
      await page.click('[data-testid="terminate-other-sessions"]');
      await expect(page.locator('[data-testid="sessions-terminated"]')).toBeVisible();
    });

    test('should protect against common vulnerabilities', async ({ page }) => {
      // Test CSRF protection
      const response = await page.goto('/api/user/profile');
      const csrfToken = await page.locator('[data-csrf-token]').getAttribute('data-csrf-token');
      expect(csrfToken).toBeDefined();

      // Test XSS protection
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', '<script>alert("xss")</script>');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Should not execute script
      const alertDialogs = [];
      page.on('dialog', dialog => alertDialogs.push(dialog));
      expect(alertDialogs).toHaveLength(0);

      // Test SQL injection protection
      await page.fill('[data-testid="email-input"]', "'; DROP TABLE users; --");
      await page.click('[data-testid="login-button"]');

      // Should handle safely without database errors
      await expect(page.locator('[data-testid="invalid-credentials"]')).toBeVisible();
    });

    test('should implement data anonymization and pseudonymization', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Check analytics data anonymization
      await page.goto('/settings/privacy/analytics');
      await expect(page.locator('[data-testid="anonymized-analytics"]')).toBeVisible();

      // Verify IP address masking
      const analyticsData = await page.evaluate(() => {
        return window.analytics?.getAnonymizedData();
      });

      expect(analyticsData?.ipAddress).toMatch(/\d+\.\d+\.\d+\.0/); // Last octet should be masked

      // Check pseudonymized identifiers
      expect(analyticsData?.userId).toMatch(/^anon_[a-f0-9]{32}$/);
    });
  });

  test.describe('Data Processing Transparency', () => {
    test('should provide clear privacy policy', async ({ page }) => {
      await page.goto('/privacy-policy');

      // Check required sections
      await expect(page.locator('[data-testid="data-collection-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-usage-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-sharing-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-retention-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-rights-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-information-section"]')).toBeVisible();

      // Check last updated date
      await expect(page.locator('[data-testid="policy-last-updated"]')).toBeVisible();

      // Check version history
      await page.click('[data-testid="view-policy-history"]');
      await expect(page.locator('[data-testid="policy-versions"]')).toBeVisible();
    });

    test('should notify users of policy changes', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Simulate policy update notification
      await page.goto('/dashboard?policy_updated=true');

      await expect(page.locator('[data-testid="policy-update-notification"]')).toBeVisible();
      await expect(page.locator('[data-testid="review-changes-button"]')).toBeVisible();

      // Review policy changes
      await page.click('[data-testid="review-changes-button"]');
      await expect(page.locator('[data-testid="policy-changes-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="changes-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="changes-details"]')).toBeVisible();

      // Accept updated policy
      await page.check('[data-testid="accept-updated-policy"]');
      await page.click('[data-testid="confirm-policy-acceptance"]');

      await expect(page.locator('[data-testid="policy-accepted-success"]')).toBeVisible();
    });

    test('should provide data processing records', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      await page.goto('/settings/privacy/processing-records');

      // Check processing activities log
      await expect(page.locator('[data-testid="processing-activities"]')).toBeVisible();

      // Check data processing purposes
      await expect(page.locator('[data-testid="processing-purpose"]')).toHaveCount.greaterThan(0);

      // View detailed processing record
      await page.click('[data-testid="processing-record"]').first();
      await expect(page.locator('[data-testid="processing-details-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-categories-processed"]')).toBeVisible();
      await expect(page.locator('[data-testid="processing-legal-basis"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-recipients"]')).toBeVisible();
      await expect(page.locator('[data-testid="retention-period"]')).toBeVisible();
    });

    test('should handle cross-border data transfers', async ({ page }) => {
      await page.goto('/settings/privacy/data-transfers');

      // Check transfer disclosures
      await expect(page.locator('[data-testid="international-transfers"]')).toBeVisible();
      await expect(page.locator('[data-testid="transfer-safeguards"]')).toBeVisible();

      // Check adequacy decisions
      await expect(page.locator('[data-testid="adequacy-countries"]')).toBeVisible();

      // Check transfer mechanisms
      await expect(page.locator('[data-testid="transfer-mechanisms"]')).toBeVisible();

      // User control over transfers
      await page.click('[data-testid="manage-transfer-preferences"]');
      await expect(page.locator('[data-testid="transfer-preferences-modal"]')).toBeVisible();

      await page.uncheck('[data-testid="allow-non-adequate-transfers"]');
      await page.click('[data-testid="save-transfer-preferences"]');

      await expect(page.locator('[data-testid="transfer-preferences-updated"]')).toBeVisible();
    });
  });

  test.describe('Breach Notification and Incident Response', () => {
    test('should have breach notification system', async ({ page }) => {
      // Simulate admin access to breach management
      await page.goto('/admin/login');
      await page.fill('[data-testid="admin-email"]', 'admin@zeroprint.com');
      await page.fill('[data-testid="admin-password"]', 'adminpassword123');
      await page.click('[data-testid="admin-login-button"]');

      await page.goto('/admin/security/breach-management');

      // Check breach detection dashboard
      await expect(page.locator('[data-testid="breach-detection-dashboard"]')).toBeVisible();

      // Simulate breach incident
      await page.click('[data-testid="report-breach-button"]');

      await page.selectOption('[data-testid="breach-type"]', 'data_exposure');
      await page.selectOption('[data-testid="breach-severity"]', 'high');
      await page.fill('[data-testid="affected-users-count"]', '1500');
      await page.fill(
        '[data-testid="breach-description"]',
        'Unauthorized access to user profile data'
      );

      // Set notification requirements
      await page.check('[data-testid="notify-authorities"]');
      await page.check('[data-testid="notify-affected-users"]');

      await page.click('[data-testid="submit-breach-report"]');

      // Check breach response workflow
      await expect(page.locator('[data-testid="breach-response-initiated"]')).toBeVisible();
      await expect(page.locator('[data-testid="notification-timeline"]')).toContainText('72 hours');
    });

    test('should notify affected users of breaches', async ({ page }) => {
      // Simulate user receiving breach notification
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'affected-user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Check for breach notification
      await page.goto('/dashboard?breach_notification=true');

      await expect(page.locator('[data-testid="breach-notification-banner"]')).toBeVisible();
      await expect(page.locator('[data-testid="breach-details-link"]')).toBeVisible();

      // View breach details
      await page.click('[data-testid="breach-details-link"]');
      await expect(page.locator('[data-testid="breach-details-modal"]')).toBeVisible();

      // Check required information
      await expect(page.locator('[data-testid="breach-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-affected"]')).toBeVisible();
      await expect(page.locator('[data-testid="mitigation-steps"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-actions-required"]')).toBeVisible();

      // Acknowledge notification
      await page.click('[data-testid="acknowledge-breach-notification"]');
      await expect(page.locator('[data-testid="notification-acknowledged"]')).toBeVisible();
    });

    test('should provide incident response procedures', async ({ page }) => {
      await page.goto('/admin/login');
      await page.fill('[data-testid="admin-email"]', 'admin@zeroprint.com');
      await page.fill('[data-testid="admin-password"]', 'adminpassword123');
      await page.click('[data-testid="admin-login-button"]');

      await page.goto('/admin/security/incident-response');

      // Check incident response plan
      await expect(page.locator('[data-testid="incident-response-plan"]')).toBeVisible();

      // Check response team contacts
      await expect(page.locator('[data-testid="response-team-contacts"]')).toBeVisible();

      // Check escalation procedures
      await expect(page.locator('[data-testid="escalation-procedures"]')).toBeVisible();

      // Test incident simulation
      await page.click('[data-testid="run-incident-simulation"]');
      await page.selectOption('[data-testid="simulation-type"]', 'data_breach');

      await page.click('[data-testid="start-simulation"]');
      await expect(page.locator('[data-testid="simulation-running"]')).toBeVisible();

      // Check simulation results
      await expect(page.locator('[data-testid="simulation-results"]')).toBeVisible({
        timeout: 30000,
      });
      await expect(page.locator('[data-testid="response-time-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="improvement-recommendations"]')).toBeVisible();
    });
  });

  test.describe('Compliance Monitoring and Auditing', () => {
    test('should maintain compliance audit logs', async ({ page }) => {
      await page.goto('/admin/login');
      await page.fill('[data-testid="admin-email"]', 'admin@zeroprint.com');
      await page.fill('[data-testid="admin-password"]', 'adminpassword123');
      await page.click('[data-testid="admin-login-button"]');

      await page.goto('/admin/compliance/audit-logs');

      // Check audit log categories
      await expect(page.locator('[data-testid="data-access-logs"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-change-logs"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-processing-logs"]')).toBeVisible();
      await expect(page.locator('[data-testid="deletion-logs"]')).toBeVisible();

      // Filter audit logs
      await page.selectOption('[data-testid="log-category-filter"]', 'data_access');
      await page.fill('[data-testid="date-from-filter"]', '2024-06-01');
      await page.fill('[data-testid="date-to-filter"]', '2024-06-30');

      await page.click('[data-testid="apply-audit-filters"]');

      // Check audit log details
      await page.click('[data-testid="audit-log-entry"]').first();
      await expect(page.locator('[data-testid="audit-details-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-timestamp"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-user"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-action"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-data-affected"]')).toBeVisible();

      // Export audit logs
      await page.click('[data-testid="export-audit-logs"]');
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('audit-logs');
    });

    test('should generate compliance reports', async ({ page }) => {
      await page.goto('/admin/login');
      await page.fill('[data-testid="admin-email"]', 'admin@zeroprint.com');
      await page.fill('[data-testid="admin-password"]', 'adminpassword123');
      await page.click('[data-testid="admin-login-button"]');

      await page.goto('/admin/compliance/reports');

      // Generate DPDP compliance report
      await page.click('[data-testid="generate-dpdp-report"]');

      await page.selectOption('[data-testid="report-period"]', 'quarterly');
      await page.selectOption('[data-testid="report-quarter"]', 'q2-2024');

      await page.click('[data-testid="generate-report-button"]');

      // Wait for report generation
      await expect(page.locator('[data-testid="report-generating"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 30000 });

      // Check report sections
      await expect(page.locator('[data-testid="consent-compliance-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-subject-rights-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="security-measures-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="breach-incidents-section"]')).toBeVisible();

      // Download compliance report
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-compliance-report"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('dpdp-compliance-report');
    });

    test('should monitor compliance metrics', async ({ page }) => {
      await page.goto('/admin/login');
      await page.fill('[data-testid="admin-email"]', 'admin@zeroprint.com');
      await page.fill('[data-testid="admin-password"]', 'adminpassword123');
      await page.click('[data-testid="admin-login-button"]');

      await page.goto('/admin/compliance/metrics');

      // Check compliance dashboard
      await expect(page.locator('[data-testid="compliance-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-request-response-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="breach-response-time"]')).toBeVisible();

      // Check compliance trends
      await expect(page.locator('[data-testid="compliance-trend-chart"]')).toBeVisible();

      // Check risk indicators
      await expect(page.locator('[data-testid="compliance-risks"]')).toBeVisible();

      // Set compliance alerts
      await page.click('[data-testid="configure-compliance-alerts"]');

      await page.fill('[data-testid="consent-rate-threshold"]', '95');
      await page.fill('[data-testid="response-time-threshold"]', '72');

      await page.click('[data-testid="save-compliance-alerts"]');
      await expect(page.locator('[data-testid="alerts-configured-success"]')).toBeVisible();
    });
  });
});
