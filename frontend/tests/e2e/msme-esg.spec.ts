import { test, expect } from '@playwright/test';
import { ResilientNavigation } from './utils/resilient-navigation';

test.describe('MSME ESG Reporting Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
    
    // Use resilient navigation for login
    const resilientNav = new ResilientNavigation(page);
    await resilientNav.performLogin('msme@test.com', 'testpassword123');
    await resilientNav.waitForElement('[data-testid="msme-dashboard"]');
  });

  test.describe('ESG Data Entry', () => {
    test('should complete environmental data entry', async ({ page }) => {
      await page.goto('/msme/esg/environmental');

      // Energy consumption section
      await page.click('[data-testid="energy-consumption-section"]');
      await page.fill('[data-testid="electricity-consumption"]', '15000');
      await page.selectOption('[data-testid="electricity-source"]', 'grid');
      await page.fill('[data-testid="renewable-energy-percentage"]', '25');
      await page.fill('[data-testid="fuel-consumption"]', '5000');
      await page.selectOption('[data-testid="fuel-type"]', 'diesel');

      // Water usage section
      await page.click('[data-testid="water-usage-section"]');
      await page.fill('[data-testid="water-consumption"]', '8000');
      await page.selectOption('[data-testid="water-source"]', 'municipal');
      await page.fill('[data-testid="water-recycled"]', '1500');
      await page.fill('[data-testid="wastewater-treated"]', '6000');

      // Waste management section
      await page.click('[data-testid="waste-management-section"]');
      await page.fill('[data-testid="total-waste-generated"]', '2500');
      await page.fill('[data-testid="waste-recycled"]', '1800');
      await page.fill('[data-testid="hazardous-waste"]', '200');
      await page.selectOption('[data-testid="waste-disposal-method"]', 'authorized_vendor');

      // Emissions section
      await page.click('[data-testid="emissions-section"]');
      await page.fill('[data-testid="scope1-emissions"]', '450');
      await page.fill('[data-testid="scope2-emissions"]', '320');
      await page.fill('[data-testid="scope3-emissions"]', '180');

      // Upload supporting documents
      await page.setInputFiles(
        '[data-testid="energy-bills-upload"]',
        'tests/fixtures/energy-bill.pdf'
      );
      await page.setInputFiles(
        '[data-testid="water-bills-upload"]',
        'tests/fixtures/water-bill.pdf'
      );
      await page.setInputFiles(
        '[data-testid="waste-certificates-upload"]',
        'tests/fixtures/waste-certificate.pdf'
      );

      // Save environmental data
      await page.click('[data-testid="save-environmental-data"]');

      // Check success message
      await expect(page.locator('[data-testid="data-saved-success"]')).toContainText(
        'Environmental data saved successfully'
      );

      // Verify data persistence
      await page.reload();
      await expect(page.locator('[data-testid="electricity-consumption"]')).toHaveValue('15000');
    });

    test('should complete social data entry', async ({ page }) => {
      await page.goto('/msme/esg/social');

      // Employee information
      await page.click('[data-testid="employee-info-section"]');
      await page.fill('[data-testid="total-employees"]', '45');
      await page.fill('[data-testid="male-employees"]', '28');
      await page.fill('[data-testid="female-employees"]', '17');
      await page.fill('[data-testid="differently-abled-employees"]', '2');
      await page.fill('[data-testid="average-age"]', '32');

      // Diversity and inclusion
      await page.click('[data-testid="diversity-section"]');
      await page.fill('[data-testid="women-in-leadership"]', '3');
      await page.fill('[data-testid="minority-employees"]', '8');
      await page.selectOption('[data-testid="diversity-policy"]', 'yes');
      await page.fill('[data-testid="diversity-training-hours"]', '120');

      // Health and safety
      await page.click('[data-testid="health-safety-section"]');
      await page.fill('[data-testid="safety-incidents"]', '1');
      await page.fill('[data-testid="safety-training-hours"]', '200');
      await page.selectOption('[data-testid="safety-certifications"]', 'iso45001');
      await page.fill('[data-testid="health-checkups-conducted"]', '45');

      // Employee benefits
      await page.click('[data-testid="benefits-section"]');
      await page.check('[data-testid="health-insurance"]');
      await page.check('[data-testid="life-insurance"]');
      await page.check('[data-testid="provident-fund"]');
      await page.check('[data-testid="maternity-leave"]');
      await page.check('[data-testid="paternity-leave"]');
      await page.fill('[data-testid="training-budget"]', '150000');

      // Community engagement
      await page.click('[data-testid="community-section"]');
      await page.fill('[data-testid="csr-spending"]', '250000');
      await page.fill('[data-testid="community-programs"]', '3');
      await page.fill('[data-testid="local-suppliers-percentage"]', '65');

      // Upload documents
      await page.setInputFiles(
        '[data-testid="employee-handbook-upload"]',
        'tests/fixtures/employee-handbook.pdf'
      );
      await page.setInputFiles(
        '[data-testid="safety-certificates-upload"]',
        'tests/fixtures/safety-cert.pdf'
      );

      // Save social data
      await page.click('[data-testid="save-social-data"]');

      await expect(page.locator('[data-testid="data-saved-success"]')).toContainText(
        'Social data saved successfully'
      );
    });

    test('should complete governance data entry', async ({ page }) => {
      await page.goto('/msme/esg/governance');

      // Board composition
      await page.click('[data-testid="board-composition-section"]');
      await page.fill('[data-testid="board-size"]', '5');
      await page.fill('[data-testid="independent-directors"]', '2');
      await page.fill('[data-testid="women-directors"]', '1');
      await page.selectOption('[data-testid="board-diversity-policy"]', 'yes');

      // Ethics and compliance
      await page.click('[data-testid="ethics-section"]');
      await page.selectOption('[data-testid="code-of-conduct"]', 'yes');
      await page.selectOption('[data-testid="whistleblower-policy"]', 'yes');
      await page.selectOption('[data-testid="anti-corruption-policy"]', 'yes');
      await page.fill('[data-testid="ethics-training-hours"]', '80');

      // Risk management
      await page.click('[data-testid="risk-management-section"]');
      await page.selectOption('[data-testid="risk-committee"]', 'yes');
      await page.selectOption('[data-testid="risk-assessment-frequency"]', 'quarterly');
      await page.fill('[data-testid="identified-risks"]', '12');
      await page.fill('[data-testid="mitigated-risks"]', '10');

      // Data privacy and security
      await page.click('[data-testid="data-privacy-section"]');
      await page.selectOption('[data-testid="data-protection-policy"]', 'yes');
      await page.selectOption('[data-testid="cybersecurity-framework"]', 'iso27001');
      await page.fill('[data-testid="data-breaches"]', '0');
      await page.fill('[data-testid="privacy-training-hours"]', '60');

      // Transparency and reporting
      await page.click('[data-testid="transparency-section"]');
      await page.selectOption('[data-testid="annual-report-published"]', 'yes');
      await page.selectOption('[data-testid="sustainability-report"]', 'yes');
      await page.selectOption('[data-testid="stakeholder-engagement"]', 'regular');

      // Upload governance documents
      await page.setInputFiles(
        '[data-testid="board-resolutions-upload"]',
        'tests/fixtures/board-resolutions.pdf'
      );
      await page.setInputFiles(
        '[data-testid="policies-upload"]',
        'tests/fixtures/company-policies.pdf'
      );

      // Save governance data
      await page.click('[data-testid="save-governance-data"]');

      await expect(page.locator('[data-testid="data-saved-success"]')).toContainText(
        'Governance data saved successfully'
      );
    });

    test('should validate data entry with business rules', async ({ page }) => {
      await page.goto('/msme/esg/environmental');

      // Test invalid data
      await page.fill('[data-testid="electricity-consumption"]', '-100');
      await page.blur('[data-testid="electricity-consumption"]');
      await expect(page.locator('[data-testid="electricity-error"]')).toContainText(
        'Value must be positive'
      );

      // Test percentage validation
      await page.fill('[data-testid="renewable-energy-percentage"]', '150');
      await page.blur('[data-testid="renewable-energy-percentage"]');
      await expect(page.locator('[data-testid="renewable-energy-error"]')).toContainText(
        'Percentage cannot exceed 100'
      );

      // Test required fields
      await page.click('[data-testid="save-environmental-data"]');
      await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();

      // Test data consistency
      await page.fill('[data-testid="total-waste-generated"]', '1000');
      await page.fill('[data-testid="waste-recycled"]', '1200');
      await page.blur('[data-testid="waste-recycled"]');
      await expect(page.locator('[data-testid="waste-recycled-error"]')).toContainText(
        'Recycled waste cannot exceed total waste'
      );
    });
  });

  test.describe('ESG Report Generation', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure test data exists
      await page.goto('/msme/esg/data-setup');
      await page.click('[data-testid="load-sample-data"]');
      await expect(page.locator('[data-testid="sample-data-loaded"]')).toBeVisible();
    });

    test('should generate comprehensive ESG report', async ({ page }) => {
      await page.goto('/msme/esg/reports');

      // Select report parameters
      await page.selectOption('[data-testid="report-period"]', 'annual');
      await page.selectOption('[data-testid="financial-year"]', '2023-24');
      await page.selectOption('[data-testid="report-format"]', 'comprehensive');

      // Include all sections
      await page.check('[data-testid="include-environmental"]');
      await page.check('[data-testid="include-social"]');
      await page.check('[data-testid="include-governance"]');
      await page.check('[data-testid="include-benchmarks"]');
      await page.check('[data-testid="include-recommendations"]');

      // Generate report
      await page.click('[data-testid="generate-report-button"]');

      // Wait for report generation
      await expect(page.locator('[data-testid="report-generating"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 30000 });

      // Check report sections
      await expect(page.locator('[data-testid="executive-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="environmental-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="social-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="governance-section"]')).toBeVisible();

      // Check key metrics
      await expect(page.locator('[data-testid="carbon-footprint"]')).toBeVisible();
      await expect(page.locator('[data-testid="water-intensity"]')).toBeVisible();
      await expect(page.locator('[data-testid="waste-diversion-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="employee-satisfaction"]')).toBeVisible();

      // Check visualizations
      await expect(page.locator('[data-testid="emissions-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="diversity-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="governance-score-chart"]')).toBeVisible();
    });

    test('should generate quarterly progress report', async ({ page }) => {
      await page.goto('/msme/esg/reports');

      // Select quarterly report
      await page.selectOption('[data-testid="report-period"]', 'quarterly');
      await page.selectOption('[data-testid="quarter"]', 'q2-2024');
      await page.selectOption('[data-testid="report-format"]', 'progress');

      await page.click('[data-testid="generate-report-button"]');

      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 30000 });

      // Check progress tracking
      await expect(page.locator('[data-testid="quarterly-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="target-vs-actual"]')).toBeVisible();
      await expect(page.locator('[data-testid="improvement-areas"]')).toBeVisible();

      // Check trend analysis
      await expect(page.locator('[data-testid="trend-charts"]')).toBeVisible();
      await expect(page.locator('[data-testid="performance-indicators"]')).toBeVisible();
    });

    test('should generate regulatory compliance report', async ({ page }) => {
      await page.goto('/msme/esg/reports');

      // Select compliance report
      await page.selectOption('[data-testid="report-format"]', 'compliance');
      await page.selectOption('[data-testid="regulation-framework"]', 'brsr');

      await page.click('[data-testid="generate-report-button"]');

      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 30000 });

      // Check compliance sections
      await expect(page.locator('[data-testid="principle-1-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="principle-2-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="principle-3-section"]')).toBeVisible();

      // Check compliance status
      await expect(page.locator('[data-testid="compliance-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="non-compliance-areas"]')).toBeVisible();
      await expect(page.locator('[data-testid="action-items"]')).toBeVisible();
    });

    test('should export reports in multiple formats', async ({ page }) => {
      await page.goto('/msme/esg/reports');

      // Generate a report first
      await page.selectOption('[data-testid="report-period"]', 'annual');
      await page.click('[data-testid="generate-report-button"]');
      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 30000 });

      // Export as PDF
      const pdfDownload = page.waitForEvent('download');
      await page.click('[data-testid="export-pdf-button"]');
      const pdf = await pdfDownload;
      expect(pdf.suggestedFilename()).toContain('.pdf');

      // Export as Excel
      const excelDownload = page.waitForEvent('download');
      await page.click('[data-testid="export-excel-button"]');
      const excel = await excelDownload;
      expect(excel.suggestedFilename()).toContain('.xlsx');

      // Export as PowerPoint
      const pptDownload = page.waitForEvent('download');
      await page.click('[data-testid="export-ppt-button"]');
      const ppt = await pptDownload;
      expect(ppt.suggestedFilename()).toContain('.pptx');
    });

    test('should customize report branding', async ({ page }) => {
      await page.goto('/msme/esg/reports/branding');

      // Upload company logo
      await page.setInputFiles(
        '[data-testid="company-logo-upload"]',
        'tests/fixtures/company-logo.png'
      );

      // Set brand colors
      await page.fill('[data-testid="primary-color"]', '#1E40AF');
      await page.fill('[data-testid="secondary-color"]', '#059669');

      // Set company information
      await page.fill('[data-testid="company-tagline"]', 'Sustainable Manufacturing Solutions');
      await page.fill('[data-testid="report-footer"]', 'Committed to Environmental Excellence');

      // Save branding
      await page.click('[data-testid="save-branding-button"]');
      await expect(page.locator('[data-testid="branding-saved"]')).toBeVisible();

      // Generate report with branding
      await page.goto('/msme/esg/reports');
      await page.click('[data-testid="generate-report-button"]');
      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 30000 });

      // Check branding applied
      await expect(page.locator('[data-testid="company-logo"]')).toBeVisible();
      await expect(page.locator('[data-testid="branded-header"]')).toHaveCSS(
        'color',
        'rgb(30, 64, 175)'
      );
    });
  });

  test.describe('ESG Analytics and Benchmarking', () => {
    test('should show industry benchmarks', async ({ page }) => {
      await page.goto('/msme/esg/analytics');

      // Select industry for comparison
      await page.selectOption('[data-testid="industry-select"]', 'manufacturing');
      await page.selectOption('[data-testid="company-size-select"]', 'small');

      // View benchmarks
      await page.click('[data-testid="load-benchmarks-button"]');

      // Check benchmark data
      await expect(page.locator('[data-testid="industry-average-emissions"]')).toBeVisible();
      await expect(page.locator('[data-testid="industry-average-water"]')).toBeVisible();
      await expect(page.locator('[data-testid="industry-average-waste"]')).toBeVisible();

      // Check performance comparison
      await expect(page.locator('[data-testid="performance-vs-industry"]')).toBeVisible();
      await expect(page.locator('[data-testid="percentile-ranking"]')).toBeVisible();

      // Check improvement opportunities
      await expect(page.locator('[data-testid="improvement-recommendations"]')).toBeVisible();
      await expect(page.locator('[data-testid="best-practices"]')).toBeVisible();
    });

    test('should track ESG score trends', async ({ page }) => {
      await page.goto('/msme/esg/analytics/trends');

      // Check overall ESG score
      await expect(page.locator('[data-testid="overall-esg-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="score-trend-chart"]')).toBeVisible();

      // Check individual pillar scores
      await expect(page.locator('[data-testid="environmental-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="social-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="governance-score"]')).toBeVisible();

      // Check score breakdown
      await page.click('[data-testid="environmental-score"]');
      await expect(page.locator('[data-testid="environmental-breakdown"]')).toBeVisible();
      await expect(page.locator('[data-testid="emissions-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="water-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="waste-score"]')).toBeVisible();

      // Check historical trends
      await page.selectOption('[data-testid="trend-period"]', '12months');
      await expect(page.locator('[data-testid="historical-trend-chart"]')).toBeVisible();
    });

    test('should provide actionable insights', async ({ page }) => {
      await page.goto('/msme/esg/analytics/insights');

      // Check AI-powered insights
      await expect(page.locator('[data-testid="ai-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="insight-card"]')).toHaveCount.greaterThan(0);

      // Check priority actions
      await expect(page.locator('[data-testid="priority-actions"]')).toBeVisible();
      await expect(page.locator('[data-testid="high-impact-actions"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-wins"]')).toBeVisible();

      // Check cost-benefit analysis
      await page.click('[data-testid="action-item"]').first();
      await expect(page.locator('[data-testid="cost-benefit-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="implementation-cost"]')).toBeVisible();
      await expect(page.locator('[data-testid="expected-savings"]')).toBeVisible();
      await expect(page.locator('[data-testid="payback-period"]')).toBeVisible();

      // Add action to plan
      await page.click('[data-testid="add-to-plan-button"]');
      await expect(page.locator('[data-testid="action-added-success"]')).toBeVisible();
    });

    test('should create improvement roadmap', async ({ page }) => {
      await page.goto('/msme/esg/roadmap');

      // Set improvement targets
      await page.fill('[data-testid="emissions-reduction-target"]', '20');
      await page.fill('[data-testid="water-reduction-target"]', '15');
      await page.fill('[data-testid="waste-reduction-target"]', '25');
      await page.selectOption('[data-testid="target-timeline"]', '2years');

      // Generate roadmap
      await page.click('[data-testid="generate-roadmap-button"]');

      // Check roadmap phases
      await expect(page.locator('[data-testid="phase-1-actions"]')).toBeVisible();
      await expect(page.locator('[data-testid="phase-2-actions"]')).toBeVisible();
      await expect(page.locator('[data-testid="phase-3-actions"]')).toBeVisible();

      // Check timeline
      await expect(page.locator('[data-testid="roadmap-timeline"]')).toBeVisible();
      await expect(page.locator('[data-testid="milestone-markers"]')).toBeVisible();

      // Check resource requirements
      await expect(page.locator('[data-testid="budget-requirements"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-requirements"]')).toBeVisible();

      // Export roadmap
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-roadmap-button"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('esg-roadmap');
    });
  });

  test.describe('Compliance and Audit', () => {
    test('should track regulatory compliance', async ({ page }) => {
      await page.goto('/msme/esg/compliance');

      // Check compliance dashboard
      await expect(page.locator('[data-testid="compliance-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="compliance-score"]')).toBeVisible();

      // Check specific regulations
      await expect(page.locator('[data-testid="environmental-clearance"]')).toBeVisible();
      await expect(page.locator('[data-testid="water-consent"]')).toBeVisible();
      await expect(page.locator('[data-testid="air-consent"]')).toBeVisible();
      await expect(page.locator('[data-testid="waste-authorization"]')).toBeVisible();

      // Check compliance status
      await expect(page.locator('[data-testid="compliant-items"]')).toBeVisible();
      await expect(page.locator('[data-testid="non-compliant-items"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-items"]')).toBeVisible();

      // Check upcoming deadlines
      await expect(page.locator('[data-testid="upcoming-deadlines"]')).toBeVisible();
      await expect(page.locator('[data-testid="deadline-item"]')).toHaveCount.greaterThan(0);

      // Set compliance reminders
      await page.click('[data-testid="deadline-item"]').first();
      await page.click('[data-testid="set-reminder-button"]');
      await page.selectOption('[data-testid="reminder-frequency"]', 'weekly');
      await page.click('[data-testid="save-reminder-button"]');

      await expect(page.locator('[data-testid="reminder-set-success"]')).toBeVisible();
    });

    test('should prepare for ESG audits', async ({ page }) => {
      await page.goto('/msme/esg/audit-prep');

      // Check audit readiness score
      await expect(page.locator('[data-testid="audit-readiness-score"]')).toBeVisible();

      // Check document checklist
      await expect(page.locator('[data-testid="document-checklist"]')).toBeVisible();
      await expect(page.locator('[data-testid="checklist-item"]')).toHaveCount.greaterThan(0);

      // Upload audit documents
      await page.setInputFiles(
        '[data-testid="environmental-policy-upload"]',
        'tests/fixtures/env-policy.pdf'
      );
      await page.setInputFiles(
        '[data-testid="safety-manual-upload"]',
        'tests/fixtures/safety-manual.pdf'
      );

      // Mark items as complete
      await page.check('[data-testid="checklist-item-1"]');
      await page.check('[data-testid="checklist-item-2"]');

      // Check progress update
      await expect(page.locator('[data-testid="completion-progress"]')).toContainText('40%');

      // Generate audit package
      await page.click('[data-testid="generate-audit-package-button"]');

      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('audit-package');
    });

    test('should manage corrective actions', async ({ page }) => {
      await page.goto('/msme/esg/corrective-actions');

      // Add new corrective action
      await page.click('[data-testid="add-action-button"]');

      await page.fill('[data-testid="action-title"]', 'Improve waste segregation process');
      await page.selectOption('[data-testid="action-category"]', 'environmental');
      await page.selectOption('[data-testid="action-priority"]', 'high');
      await page.fill(
        '[data-testid="action-description"]',
        'Implement better waste segregation at source'
      );
      await page.fill('[data-testid="target-date"]', '2024-06-30');
      await page.fill('[data-testid="responsible-person"]', 'Environmental Manager');

      await page.click('[data-testid="save-action-button"]');

      // Check action appears in list
      await expect(page.locator('[data-testid="action-list"]')).toContainText(
        'Improve waste segregation process'
      );

      // Update action progress
      await page.click('[data-testid="action-item"]').first();
      await page.selectOption('[data-testid="action-status"]', 'in_progress');
      await page.fill('[data-testid="progress-notes"]', 'Purchased new segregation bins');
      await page.fill('[data-testid="completion-percentage"]', '30');

      await page.click('[data-testid="update-action-button"]');

      // Check progress tracking
      await expect(page.locator('[data-testid="action-progress"]')).toContainText('30%');

      // Complete action
      await page.selectOption('[data-testid="action-status"]', 'completed');
      await page.fill(
        '[data-testid="completion-notes"]',
        'All areas now have proper segregation bins'
      );
      await page.setInputFiles(
        '[data-testid="evidence-upload"]',
        'tests/fixtures/segregation-evidence.jpg'
      );

      await page.click('[data-testid="complete-action-button"]');

      await expect(page.locator('[data-testid="action-completed-success"]')).toBeVisible();
    });
  });

  test.describe('Stakeholder Engagement', () => {
    test('should manage stakeholder communications', async ({ page }) => {
      await page.goto('/msme/esg/stakeholders');

      // Check stakeholder groups
      await expect(page.locator('[data-testid="stakeholder-groups"]')).toBeVisible();
      await expect(page.locator('[data-testid="employees-group"]')).toBeVisible();
      await expect(page.locator('[data-testid="customers-group"]')).toBeVisible();
      await expect(page.locator('[data-testid="suppliers-group"]')).toBeVisible();
      await expect(page.locator('[data-testid="community-group"]')).toBeVisible();

      // Send ESG update to stakeholders
      await page.click('[data-testid="send-update-button"]');

      await page.fill('[data-testid="update-subject"]', 'Q2 2024 ESG Progress Update');
      await page.fill(
        '[data-testid="update-content"]',
        'We are pleased to share our ESG progress for Q2 2024...'
      );

      // Select stakeholder groups
      await page.check('[data-testid="send-to-employees"]');
      await page.check('[data-testid="send-to-customers"]');

      // Schedule or send immediately
      await page.selectOption('[data-testid="send-timing"]', 'immediate');

      await page.click('[data-testid="send-update-button"]');

      await expect(page.locator('[data-testid="update-sent-success"]')).toBeVisible();

      // Check communication history
      await page.click('[data-testid="communication-history-tab"]');
      await expect(page.locator('[data-testid="sent-communications"]')).toContainText(
        'Q2 2024 ESG Progress Update'
      );
    });

    test('should collect stakeholder feedback', async ({ page }) => {
      await page.goto('/msme/esg/stakeholders/feedback');

      // Create feedback survey
      await page.click('[data-testid="create-survey-button"]');

      await page.fill('[data-testid="survey-title"]', 'ESG Priorities Survey 2024');
      await page.fill(
        '[data-testid="survey-description"]',
        'Help us understand your ESG priorities'
      );

      // Add questions
      await page.click('[data-testid="add-question-button"]');
      await page.selectOption('[data-testid="question-type"]', 'multiple_choice');
      await page.fill('[data-testid="question-text"]', 'Which ESG area is most important to you?');
      await page.fill('[data-testid="option-1"]', 'Environmental protection');
      await page.fill('[data-testid="option-2"]', 'Employee welfare');
      await page.fill('[data-testid="option-3"]', 'Community development');

      await page.click('[data-testid="add-question-button"]');
      await page.selectOption('[data-testid="question-type"]', 'rating');
      await page.fill(
        '[data-testid="question-text"]',
        'How would you rate our current ESG performance?'
      );

      // Set survey settings
      await page.selectOption('[data-testid="target-audience"]', 'all_stakeholders');
      await page.fill('[data-testid="survey-deadline"]', '2024-07-31');

      await page.click('[data-testid="launch-survey-button"]');

      await expect(page.locator('[data-testid="survey-launched-success"]')).toBeVisible();

      // Check survey responses (simulated)
      await page.goto('/msme/esg/stakeholders/feedback/responses');
      await expect(page.locator('[data-testid="response-analytics"]')).toBeVisible();
      await expect(page.locator('[data-testid="response-charts"]')).toBeVisible();
    });

    test('should publish ESG transparency reports', async ({ page }) => {
      await page.goto('/msme/esg/transparency');

      // Check public ESG page
      await expect(page.locator('[data-testid="public-esg-page"]')).toBeVisible();

      // Update public commitments
      await page.click('[data-testid="edit-commitments-button"]');

      await page.fill(
        '[data-testid="environmental-commitment"]',
        'Achieve carbon neutrality by 2030'
      );
      await page.fill('[data-testid="social-commitment"]', 'Maintain 100% employee satisfaction');
      await page.fill(
        '[data-testid="governance-commitment"]',
        'Ensure transparent and ethical operations'
      );

      await page.click('[data-testid="save-commitments-button"]');

      // Publish latest ESG data
      await page.click('[data-testid="publish-data-button"]');

      await page.check('[data-testid="publish-emissions-data"]');
      await page.check('[data-testid="publish-diversity-data"]');
      await page.check('[data-testid="publish-governance-score"]');

      await page.click('[data-testid="confirm-publish-button"]');

      await expect(page.locator('[data-testid="data-published-success"]')).toBeVisible();

      // Check public view
      await page.goto('/public/esg/msme-example-company');
      await expect(page.locator('[data-testid="public-esg-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="published-commitments"]')).toBeVisible();
      await expect(page.locator('[data-testid="published-metrics"]')).toBeVisible();
    });
  });

  test.describe('Integration and Data Management', () => {
    test('should import data from external systems', async ({ page }) => {
      await page.goto('/msme/esg/data-import');

      // Import from ERP system
      await page.click('[data-testid="erp-import-tab"]');
      await page.selectOption('[data-testid="erp-system"]', 'sap');
      await page.fill('[data-testid="erp-connection-string"]', 'server=localhost;database=erp');

      await page.click('[data-testid="test-connection-button"]');
      await expect(page.locator('[data-testid="connection-success"]')).toBeVisible();

      // Map data fields
      await page.selectOption('[data-testid="energy-field-mapping"]', 'electricity_consumption');
      await page.selectOption('[data-testid="water-field-mapping"]', 'water_usage');
      await page.selectOption('[data-testid="waste-field-mapping"]', 'waste_generated');

      await page.click('[data-testid="import-data-button"]');
      await expect(page.locator('[data-testid="import-success"]')).toBeVisible();

      // Import from CSV
      await page.click('[data-testid="csv-import-tab"]');
      await page.setInputFiles('[data-testid="csv-file-upload"]', 'tests/fixtures/esg-data.csv');

      // Map CSV columns
      await page.selectOption('[data-testid="column-1-mapping"]', 'electricity_consumption');
      await page.selectOption('[data-testid="column-2-mapping"]', 'water_consumption');

      await page.click('[data-testid="import-csv-button"]');
      await expect(page.locator('[data-testid="csv-import-success"]')).toBeVisible();
    });

    test('should validate and clean imported data', async ({ page }) => {
      await page.goto('/msme/esg/data-validation');

      // Check data quality dashboard
      await expect(page.locator('[data-testid="data-quality-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-completeness"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-accuracy"]')).toBeVisible();

      // Check validation issues
      await expect(page.locator('[data-testid="validation-issues"]')).toBeVisible();

      // Fix data issues
      await page.click('[data-testid="issue-item"]').first();
      await page.selectOption('[data-testid="fix-action"]', 'interpolate');
      await page.click('[data-testid="apply-fix-button"]');

      await expect(page.locator('[data-testid="issue-fixed-success"]')).toBeVisible();

      // Bulk data cleaning
      await page.click('[data-testid="bulk-clean-button"]');
      await page.check('[data-testid="remove-outliers"]');
      await page.check('[data-testid="fill-missing-values"]');
      await page.check('[data-testid="standardize-units"]');

      await page.click('[data-testid="apply-cleaning-button"]');
      await expect(page.locator('[data-testid="cleaning-complete"]')).toBeVisible();
    });

    test('should backup and restore ESG data', async ({ page }) => {
      await page.goto('/msme/esg/data-management');

      // Create backup
      await page.click('[data-testid="create-backup-button"]');
      await page.fill('[data-testid="backup-name"]', 'Monthly Backup - June 2024');
      await page.selectOption('[data-testid="backup-scope"]', 'all_data');

      await page.click('[data-testid="start-backup-button"]');
      await expect(page.locator('[data-testid="backup-in-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="backup-complete"]')).toBeVisible({ timeout: 30000 });

      // Check backup list
      await expect(page.locator('[data-testid="backup-list"]')).toContainText(
        'Monthly Backup - June 2024'
      );

      // Download backup
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-backup-button"]').first();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('esg-backup');

      // Restore from backup
      await page.click('[data-testid="restore-backup-button"]').first();
      await page.click('[data-testid="confirm-restore-button"]');

      await expect(page.locator('[data-testid="restore-complete"]')).toBeVisible({
        timeout: 30000,
      });
    });
  });

  test.describe('Mobile and Accessibility', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/msme/esg');

      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible();
      await page.click('[data-testid="mobile-nav-toggle"]');
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();

      // Check mobile-optimized forms
      await page.click('[data-testid="environmental-data-link"]');
      await expect(page.locator('[data-testid="mobile-data-form"]')).toBeVisible();

      // Check mobile charts
      await page.goto('/msme/esg/analytics');
      await expect(page.locator('[data-testid="mobile-chart"]')).toBeVisible();

      // Check touch interactions
      await page.touchscreen.tap(200, 300);
      await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
    });

    test('should be accessible to users with disabilities', async ({ page }) => {
      await page.goto('/msme/esg');

      // Check keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="main-nav"]')).toBeFocused();

      // Check ARIA labels
      await expect(page.locator('[data-testid="esg-score"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="data-entry-form"]')).toHaveAttribute('role', 'form');

      // Check screen reader support
      await expect(page.locator('[data-testid="page-title"]')).toHaveAttribute('role', 'heading');
      await expect(page.locator('[data-testid="status-message"]')).toHaveAttribute(
        'role',
        'status'
      );

      // Check high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });
  });
});
