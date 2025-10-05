import { test, expect } from '@playwright/test';
import { ResilientNavigation } from './utils/resilient-navigation';

test.describe('Tracker Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
    
    // Use resilient navigation for login
    const resilientNav = new ResilientNavigation(page);
    await resilientNav.performLogin('citizen@test.com', 'testpassword123');
    await resilientNav.waitForElement('[data-testid="dashboard"]');
  });

  test.describe('Carbon Tracker', () => {
    test.beforeEach(async ({ page }) => {
      const resilientNav = new ResilientNavigation(page);
      await resilientNav.navigateToPage('/trackers/carbon');
    });

    test('should log daily carbon activities', async ({ page }) => {
      // Wait for carbon tracker to load
      await expect(page.locator('[data-testid="carbon-tracker"]')).toBeVisible();

      // Add transportation activity
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'car');
      await page.fill('[data-testid="distance-input"]', '25');
      await page.selectOption('[data-testid="fuel-type-select"]', 'petrol');
      await page.fill('[data-testid="activity-notes"]', 'Daily commute to office');

      // Submit activity
      await page.click('[data-testid="save-activity-button"]');

      // Check success message
      await expect(page.locator('[data-testid="activity-saved-success"]')).toContainText(
        'Activity logged successfully'
      );

      // Verify activity appears in list
      await expect(page.locator('[data-testid="activity-list"]')).toContainText('Car - 25 km');
      await expect(page.locator('[data-testid="carbon-footprint-value"]')).not.toContainText(
        '0.00'
      );
    });

    test('should log energy consumption', async ({ page }) => {
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'energy');
      await page.selectOption('[data-testid="energy-type-select"]', 'electricity');
      await page.fill('[data-testid="consumption-input"]', '15');
      await page.selectOption('[data-testid="energy-source-select"]', 'grid');

      await page.click('[data-testid="save-activity-button"]');

      await expect(page.locator('[data-testid="activity-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-list"]')).toContainText(
        'Electricity - 15 kWh'
      );
    });

    test('should log food consumption', async ({ page }) => {
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'food');
      await page.selectOption('[data-testid="meal-type-select"]', 'lunch');
      await page.selectOption('[data-testid="food-category-select"]', 'meat');
      await page.fill('[data-testid="quantity-input"]', '200');
      await page.selectOption('[data-testid="meat-type-select"]', 'chicken');

      await page.click('[data-testid="save-activity-button"]');

      await expect(page.locator('[data-testid="activity-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-list"]')).toContainText('Chicken - 200g');
    });

    test('should show carbon footprint analytics', async ({ page }) => {
      // Check daily summary
      await expect(page.locator('[data-testid="daily-carbon-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-emissions-today"]')).toBeVisible();

      // Navigate to analytics
      await page.click('[data-testid="view-analytics-button"]');

      // Check weekly chart
      await expect(page.locator('[data-testid="weekly-emissions-chart"]')).toBeVisible();

      // Check monthly trends
      await page.click('[data-testid="monthly-view-tab"]');
      await expect(page.locator('[data-testid="monthly-emissions-chart"]')).toBeVisible();

      // Check category breakdown
      await page.click('[data-testid="category-breakdown-tab"]');
      await expect(page.locator('[data-testid="emissions-by-category-chart"]')).toBeVisible();

      // Check goals progress
      await page.click('[data-testid="goals-progress-tab"]');
      await expect(page.locator('[data-testid="carbon-reduction-goal"]')).toBeVisible();
      await expect(page.locator('[data-testid="goal-progress-bar"]')).toBeVisible();
    });

    test('should set and track carbon reduction goals', async ({ page }) => {
      // Navigate to goals section
      await page.click('[data-testid="carbon-goals-tab"]');

      // Set monthly goal
      await page.click('[data-testid="set-monthly-goal-button"]');
      await page.fill('[data-testid="monthly-target-input"]', '500');
      await page.selectOption('[data-testid="goal-type-select"]', 'reduction');
      await page.fill('[data-testid="baseline-emissions"]', '800');

      await page.click('[data-testid="save-goal-button"]');

      // Check goal is set
      await expect(page.locator('[data-testid="active-goal"]')).toContainText(
        'Reduce emissions by 37.5%'
      );
      await expect(page.locator('[data-testid="goal-progress"]')).toBeVisible();

      // Check recommendations
      await expect(page.locator('[data-testid="goal-recommendations"]')).toBeVisible();
      await expect(page.locator('[data-testid="recommendation-item"]')).toHaveCount.greaterThan(0);
    });

    test('should export carbon data', async ({ page }) => {
      // Navigate to export section
      await page.click('[data-testid="export-data-tab"]');

      // Select date range
      await page.fill('[data-testid="export-start-date"]', '2024-01-01');
      await page.fill('[data-testid="export-end-date"]', '2024-01-31');

      // Select format
      await page.selectOption('[data-testid="export-format-select"]', 'csv');

      // Include categories
      await page.check('[data-testid="include-transportation"]');
      await page.check('[data-testid="include-energy"]');
      await page.check('[data-testid="include-food"]');

      // Start export
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-button"]');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('carbon-data');
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test.describe('Mental Health Tracker', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/trackers/mental-health');
    });

    test('should log daily mood', async ({ page }) => {
      await expect(page.locator('[data-testid="mental-health-tracker"]')).toBeVisible();

      // Log mood
      await page.click('[data-testid="log-mood-button"]');
      await page.click('[data-testid="mood-happy"]');
      await page.fill('[data-testid="mood-notes"]', 'Had a great day at work');
      await page.selectOption('[data-testid="energy-level-select"]', 'high');
      await page.selectOption('[data-testid="stress-level-select"]', 'low');

      await page.click('[data-testid="save-mood-button"]');

      await expect(page.locator('[data-testid="mood-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="today-mood"]')).toContainText('Happy');
    });

    test('should track activities and their impact', async ({ page }) => {
      // Log activity
      await page.click('[data-testid="log-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'exercise');
      await page.selectOption('[data-testid="exercise-type-select"]', 'running');
      await page.fill('[data-testid="duration-input"]', '30');
      await page.selectOption('[data-testid="intensity-select"]', 'moderate');

      // Rate mood impact
      await page.click('[data-testid="mood-impact-positive"]');
      await page.fill('[data-testid="activity-notes"]', 'Morning run in the park');

      await page.click('[data-testid="save-activity-button"]');

      await expect(page.locator('[data-testid="activity-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-activities"]')).toContainText(
        'Running - 30 min'
      );
    });

    test('should complete wellness assessments', async ({ page }) => {
      // Start assessment
      await page.click('[data-testid="wellness-assessment-tab"]');
      await page.click('[data-testid="start-assessment-button"]');

      // Answer questions
      await page.click('[data-testid="question-1-option-3"]'); // Sleep quality
      await page.click('[data-testid="question-2-option-2"]'); // Anxiety level
      await page.click('[data-testid="question-3-option-4"]'); // Social connections
      await page.click('[data-testid="question-4-option-3"]'); // Work satisfaction
      await page.click('[data-testid="question-5-option-2"]'); // Physical health

      await page.click('[data-testid="submit-assessment-button"]');

      // Check results
      await expect(page.locator('[data-testid="assessment-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="wellness-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="recommendations"]')).toBeVisible();
    });

    test('should set and track mental health goals', async ({ page }) => {
      await page.click('[data-testid="mental-health-goals-tab"]');

      // Set meditation goal
      await page.click('[data-testid="add-goal-button"]');
      await page.selectOption('[data-testid="goal-type-select"]', 'meditation');
      await page.fill('[data-testid="target-minutes"]', '20');
      await page.selectOption('[data-testid="frequency-select"]', 'daily');

      await page.click('[data-testid="save-goal-button"]');

      // Check goal appears
      await expect(page.locator('[data-testid="active-goals"]')).toContainText(
        'Meditate 20 minutes daily'
      );

      // Log progress
      await page.click('[data-testid="log-meditation-button"]');
      await page.fill('[data-testid="meditation-duration"]', '15');
      await page.selectOption('[data-testid="meditation-type"]', 'mindfulness');

      await page.click('[data-testid="save-meditation-button"]');

      // Check progress update
      await expect(page.locator('[data-testid="goal-progress"]')).toContainText('75%');
    });

    test('should view mental health insights', async ({ page }) => {
      await page.click('[data-testid="insights-tab"]');

      // Check mood trends
      await expect(page.locator('[data-testid="mood-trends-chart"]')).toBeVisible();

      // Check activity correlations
      await expect(page.locator('[data-testid="activity-mood-correlation"]')).toBeVisible();

      // Check weekly summary
      await expect(page.locator('[data-testid="weekly-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="mood-average"]')).toBeVisible();
      await expect(page.locator('[data-testid="stress-average"]')).toBeVisible();

      // Check personalized insights
      await expect(page.locator('[data-testid="personalized-insights"]')).toBeVisible();
      await expect(page.locator('[data-testid="insight-item"]')).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Animal Welfare Tracker', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/trackers/animal-welfare');
    });

    test('should log animal welfare activities', async ({ page }) => {
      await expect(page.locator('[data-testid="animal-welfare-tracker"]')).toBeVisible();

      // Log feeding activity
      await page.click('[data-testid="log-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'feeding');
      await page.selectOption('[data-testid="animal-type-select"]', 'stray_dogs');
      await page.fill('[data-testid="animal-count"]', '5');
      await page.fill('[data-testid="food-quantity"]', '2');
      await page.selectOption('[data-testid="food-type-select"]', 'dry_food');
      await page.fill('[data-testid="location-input"]', 'Local park near office');

      await page.click('[data-testid="save-activity-button"]');

      await expect(page.locator('[data-testid="activity-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-activities"]')).toContainText(
        'Fed 5 stray dogs'
      );
    });

    test('should log rescue activities', async ({ page }) => {
      await page.click('[data-testid="log-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'rescue');
      await page.selectOption('[data-testid="animal-type-select"]', 'cats');
      await page.fill('[data-testid="animal-count"]', '1');
      await page.selectOption('[data-testid="rescue-type-select"]', 'injured');
      await page.fill('[data-testid="veterinary-care"]', 'Taken to nearby vet clinic');
      await page.fill(
        '[data-testid="rescue-notes"]',
        'Found injured kitten, provided immediate care'
      );

      await page.click('[data-testid="save-activity-button"]');

      await expect(page.locator('[data-testid="activity-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-activities"]')).toContainText(
        'Rescued 1 cat'
      );
    });

    test('should track shelter volunteering', async ({ page }) => {
      await page.click('[data-testid="log-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'volunteering');
      await page.selectOption('[data-testid="volunteer-type-select"]', 'shelter_work');
      await page.fill('[data-testid="hours-volunteered"]', '4');
      await page.fill('[data-testid="shelter-name"]', 'City Animal Shelter');
      await page.fill(
        '[data-testid="tasks-performed"]',
        'Cleaning kennels, feeding animals, socializing with dogs'
      );

      await page.click('[data-testid="save-activity-button"]');

      await expect(page.locator('[data-testid="activity-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="volunteer-hours-total"]')).toContainText('4 hours');
    });

    test('should log donations and fundraising', async ({ page }) => {
      await page.click('[data-testid="log-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'donation');
      await page.selectOption('[data-testid="donation-type-select"]', 'monetary');
      await page.fill('[data-testid="donation-amount"]', '500');
      await page.fill('[data-testid="recipient-organization"]', 'Animal Welfare Foundation');
      await page.selectOption('[data-testid="donation-purpose-select"]', 'medical_care');

      await page.click('[data-testid="save-activity-button"]');

      await expect(page.locator('[data-testid="activity-saved-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-donations"]')).toContainText('₹500');
    });

    test('should view animal welfare impact', async ({ page }) => {
      await page.click('[data-testid="impact-tab"]');

      // Check impact summary
      await expect(page.locator('[data-testid="animals-helped-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="volunteer-hours-total"]')).toBeVisible();
      await expect(page.locator('[data-testid="donations-total"]')).toBeVisible();

      // Check monthly trends
      await expect(page.locator('[data-testid="monthly-impact-chart"]')).toBeVisible();

      // Check activity breakdown
      await expect(page.locator('[data-testid="activity-breakdown-chart"]')).toBeVisible();

      // Check achievements
      await expect(page.locator('[data-testid="welfare-achievements"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievement-badge"]')).toHaveCount.greaterThan(0);
    });

    test('should connect with local organizations', async ({ page }) => {
      await page.click('[data-testid="organizations-tab"]');

      // View nearby organizations
      await expect(page.locator('[data-testid="nearby-organizations"]')).toBeVisible();
      await expect(page.locator('[data-testid="organization-card"]')).toHaveCount.greaterThan(0);

      // Follow an organization
      await page.click('[data-testid="follow-organization-button"]').first();
      await expect(page.locator('[data-testid="follow-success"]')).toBeVisible();

      // View events
      await page.click('[data-testid="events-tab"]');
      await expect(page.locator('[data-testid="upcoming-events"]')).toBeVisible();

      // Register for event
      await page.click('[data-testid="register-event-button"]').first();
      await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
    });
  });

  test.describe('Cross-Tracker Integration', () => {
    test('should show unified dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Check all tracker widgets are present
      await expect(page.locator('[data-testid="carbon-tracker-widget"]')).toBeVisible();
      await expect(page.locator('[data-testid="mental-health-widget"]')).toBeVisible();
      await expect(page.locator('[data-testid="animal-welfare-widget"]')).toBeVisible();

      // Check overall sustainability score
      await expect(page.locator('[data-testid="sustainability-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="score-breakdown"]')).toBeVisible();
    });

    test('should show cross-tracker insights', async ({ page }) => {
      await page.goto('/insights');

      // Check correlation insights
      await expect(page.locator('[data-testid="cross-tracker-correlations"]')).toBeVisible();
      await expect(page.locator('[data-testid="mood-carbon-correlation"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-welfare-correlation"]')).toBeVisible();

      // Check holistic recommendations
      await expect(page.locator('[data-testid="holistic-recommendations"]')).toBeVisible();
      await expect(page.locator('[data-testid="recommendation-card"]')).toHaveCount.greaterThan(0);
    });

    test('should sync data across trackers', async ({ page }) => {
      // Log activity that affects multiple trackers
      await page.goto('/trackers/carbon');
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'bicycle');
      await page.fill('[data-testid="distance-input"]', '10');
      await page.check('[data-testid="exercise-benefit-checkbox"]');

      await page.click('[data-testid="save-activity-button"]');

      // Check it appears in mental health tracker
      await page.goto('/trackers/mental-health');
      await expect(page.locator('[data-testid="recent-activities"]')).toContainText(
        'Cycling - 10 km'
      );

      // Check it contributes to sustainability score
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="sustainability-score"]')).not.toContainText('0');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/trackers/carbon');

      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible();
      await page.click('[data-testid="mobile-nav-toggle"]');
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();

      // Check mobile-optimized forms
      await page.click('[data-testid="add-activity-button"]');
      await expect(page.locator('[data-testid="mobile-activity-form"]')).toBeVisible();

      // Check swipe gestures work
      await page.goto('/dashboard');
      await page.touchscreen.tap(200, 300);
      await page.touchscreen.tap(100, 300);

      // Check mobile charts
      await expect(page.locator('[data-testid="mobile-chart"]')).toBeVisible();
    });

    test('should support touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/trackers/mental-health');

      // Test touch mood selection
      await page.click('[data-testid="log-mood-button"]');
      await page.touchscreen.tap(200, 400); // Tap on mood emoji

      // Test touch slider for stress level
      await page.locator('[data-testid="stress-level-slider"]').click();

      // Test pull-to-refresh
      await page.touchscreen.tap(200, 100);
      await page.mouse.move(200, 300);

      await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
    });
  });

  test.describe('Offline Support', () => {
    test('should work offline', async ({ page, context }) => {
      // Go offline
      await context.setOffline(true);

      await page.goto('/trackers/carbon');

      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

      // Should allow logging activities offline
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'car');
      await page.fill('[data-testid="distance-input"]', '15');

      await page.click('[data-testid="save-activity-button"]');

      // Should show offline save message
      await expect(page.locator('[data-testid="offline-save-message"]')).toContainText(
        'Saved offline'
      );

      // Go back online
      await context.setOffline(false);

      // Should sync data
      await page.reload();
      await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-list"]')).toContainText('Car - 15 km');
    });
  });
});
