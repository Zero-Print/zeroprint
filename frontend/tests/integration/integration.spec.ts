import { test, expect } from '@playwright/test';
import { setupMockServer, teardownMockServer } from '../utils/mock-server';

/**
 * Integration Tests - End-to-End User Workflows
 *
 * These tests validate complete user journeys and integration
 * between frontend components and backend services.
 */

test.describe.skip('Integration Tests', () => {
  test.beforeAll(async () => {
    await setupMockServer();
  });

  test.afterAll(async () => {
    await teardownMockServer();
  });

  test.describe('User Authentication Flow', () => {
    test('complete user registration and login flow', async ({ page }) => {
      // Registration
      await page.goto('/auth/register');

      const timestamp = Date.now();
      const testEmail = `test${timestamp}@example.com`;

      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!');

      // Accept terms and conditions
      await page.check('[data-testid="terms-checkbox"]');

      await page.click('[data-testid="register-button"]');

      // Should redirect to email verification or dashboard
      await page.waitForURL(/\/(dashboard|auth\/verify-email)/);

      // If email verification is required
      if (page.url().includes('verify-email')) {
        // Simulate email verification (in real test, you'd check email)
        await page.goto('/auth/login');
      }

      // Login with new account
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');

      // Should redirect to dashboard
      await page.waitForURL('/dashboard');
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
    });

    test('password reset flow', async ({ page }) => {
      // Go to forgot password
      await page.goto('/auth/login');
      await page.click('[data-testid="forgot-password-link"]');

      await expect(page).toHaveURL('/auth/forgot-password');

      // Enter email
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.click('[data-testid="reset-password-button"]');

      // Should show success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText('reset link');

      // Simulate clicking reset link (in real test, you'd check email)
      await page.goto('/auth/reset-password?token=mock-reset-token');

      // Enter new password
      await page.fill('[data-testid="new-password-input"]', 'NewPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!');
      await page.click('[data-testid="update-password-button"]');

      // Should redirect to login
      await page.waitForURL('/auth/login');

      // Should show success message
      const loginSuccessMessage = page.locator('[data-testid="success-message"]');
      await expect(loginSuccessMessage).toContainText('password updated');
    });

    test('social authentication flow', async ({ page }) => {
      await page.goto('/auth/login');

      // Test Google OAuth (mock)
      await page.click('[data-testid="google-login-button"]');

      // Should redirect to OAuth provider (mocked)
      await page.waitForURL(/oauth|google/);

      // Simulate OAuth callback
      await page.goto('/auth/callback?provider=google&code=mock-auth-code');

      // Should redirect to dashboard
      await page.waitForURL('/dashboard');

      // User should be logged in
      const userMenu = page.locator('[data-testid="user-menu"]');
      await expect(userMenu).toBeVisible();
    });

    test('logout flow', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Should redirect to login
      await page.waitForURL('/auth/login');

      // Should show logout success message
      const logoutMessage = page.locator('[data-testid="success-message"]');
      await expect(logoutMessage).toContainText('logged out');

      // Try to access protected route
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Carbon Tracker Integration', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('complete carbon tracking workflow', async ({ page }) => {
      // Navigate to carbon tracker
      await page.click('[data-testid="carbon-tracker-nav"]');
      await page.waitForURL('/trackers/carbon');

      // Add new carbon activity
      await page.click('[data-testid="add-activity-button"]');

      // Fill activity form
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'car');
      await page.fill('[data-testid="distance-input"]', '25');
      await page.selectOption('[data-testid="fuel-type-select"]', 'gasoline');
      await page.fill('[data-testid="date-input"]', '2024-01-15');

      await page.click('[data-testid="save-activity-button"]');

      // Should show success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();

      // Activity should appear in list
      const activityList = page.locator('[data-testid="activity-list"]');
      await expect(activityList).toContainText('25 km');
      await expect(activityList).toContainText('Car');

      // Check carbon footprint calculation
      const carbonFootprint = page.locator('[data-testid="carbon-footprint"]');
      await expect(carbonFootprint).toBeVisible();

      // View detailed analytics
      await page.click('[data-testid="view-analytics-button"]');

      // Should show charts and insights
      const analyticsChart = page.locator('[data-testid="analytics-chart"]');
      await expect(analyticsChart).toBeVisible();

      const insights = page.locator('[data-testid="carbon-insights"]');
      await expect(insights).toBeVisible();
    });

    test('carbon offset purchase flow', async ({ page }) => {
      await page.goto('/trackers/carbon');

      // View carbon offset options
      await page.click('[data-testid="offset-carbon-button"]');

      // Should show offset marketplace
      await page.waitForURL('/offset-marketplace');

      // Select offset project
      const offsetProject = page.locator('[data-testid="offset-project"]').first();
      await offsetProject.click();

      // Enter offset amount
      await page.fill('[data-testid="offset-amount-input"]', '10');

      // Proceed to payment
      await page.click('[data-testid="purchase-offset-button"]');

      // Should redirect to payment
      await page.waitForURL('/payment');

      // Fill payment details (mock)
      await page.fill('[data-testid="card-number-input"]', '4242424242424242');
      await page.fill('[data-testid="expiry-input"]', '12/25');
      await page.fill('[data-testid="cvc-input"]', '123');

      await page.click('[data-testid="complete-payment-button"]');

      // Should show success page
      await page.waitForURL('/payment/success');

      const successMessage = page.locator('[data-testid="payment-success"]');
      await expect(successMessage).toContainText('offset purchased');
    });

    test('carbon goal setting and tracking', async ({ page }) => {
      await page.goto('/trackers/carbon');

      // Set carbon reduction goal
      await page.click('[data-testid="set-goal-button"]');

      await page.fill('[data-testid="goal-amount-input"]', '20');
      await page.selectOption('[data-testid="goal-period-select"]', 'monthly');
      await page.fill('[data-testid="goal-description-input"]', 'Reduce car usage');

      await page.click('[data-testid="save-goal-button"]');

      // Should show goal in dashboard
      const goalWidget = page.locator('[data-testid="carbon-goal-widget"]');
      await expect(goalWidget).toBeVisible();
      await expect(goalWidget).toContainText('20%');
      await expect(goalWidget).toContainText('monthly');

      // Add activities to track progress
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'bicycle');
      await page.fill('[data-testid="distance-input"]', '10');
      await page.click('[data-testid="save-activity-button"]');

      // Goal progress should update
      const goalProgress = page.locator('[data-testid="goal-progress"]');
      await expect(goalProgress).toBeVisible();
    });
  });

  test.describe('Mental Health Tracker Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('mood tracking workflow', async ({ page }) => {
      await page.click('[data-testid="mental-health-nav"]');
      await page.waitForURL('/trackers/mental-health');

      // Log daily mood
      await page.click('[data-testid="log-mood-button"]');

      // Select mood
      await page.click('[data-testid="mood-happy"]');

      // Add notes
      await page.fill('[data-testid="mood-notes-input"]', 'Had a great day at work');

      // Select activities
      await page.check('[data-testid="activity-exercise"]');
      await page.check('[data-testid="activity-meditation"]');

      await page.click('[data-testid="save-mood-button"]');

      // Should show in mood history
      const moodHistory = page.locator('[data-testid="mood-history"]');
      await expect(moodHistory).toContainText('Happy');
      await expect(moodHistory).toContainText('great day');

      // View mood trends
      await page.click('[data-testid="view-trends-button"]');

      const moodChart = page.locator('[data-testid="mood-chart"]');
      await expect(moodChart).toBeVisible();
    });

    test('meditation session tracking', async ({ page }) => {
      await page.goto('/trackers/mental-health');

      // Start meditation session
      await page.click('[data-testid="start-meditation-button"]');

      // Select meditation type
      await page.click('[data-testid="meditation-mindfulness"]');

      // Set duration
      await page.selectOption('[data-testid="duration-select"]', '10');

      await page.click('[data-testid="begin-session-button"]');

      // Should show meditation timer
      const meditationTimer = page.locator('[data-testid="meditation-timer"]');
      await expect(meditationTimer).toBeVisible();

      // Simulate session completion (skip timer for test)
      await page.click('[data-testid="complete-session-button"]');

      // Rate session
      await page.click('[data-testid="rating-4"]');
      await page.fill('[data-testid="session-notes-input"]', 'Very relaxing session');

      await page.click('[data-testid="save-session-button"]');

      // Should show in session history
      const sessionHistory = page.locator('[data-testid="session-history"]');
      await expect(sessionHistory).toContainText('10 minutes');
      await expect(sessionHistory).toContainText('Mindfulness');
    });

    test('mental health insights and recommendations', async ({ page }) => {
      await page.goto('/trackers/mental-health');

      // Add multiple mood entries to generate insights
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="log-mood-button"]');
        await page.click('[data-testid="mood-happy"]');
        await page.click('[data-testid="save-mood-button"]');
        await page.waitForTimeout(500);
      }

      // View insights
      await page.click('[data-testid="view-insights-button"]');

      const insights = page.locator('[data-testid="mental-health-insights"]');
      await expect(insights).toBeVisible();

      // Should show recommendations
      const recommendations = page.locator('[data-testid="recommendations"]');
      await expect(recommendations).toBeVisible();

      // Should show mood patterns
      const patterns = page.locator('[data-testid="mood-patterns"]');
      await expect(patterns).toBeVisible();
    });
  });

  test.describe('Animal Welfare Tracker Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('animal welfare activity tracking', async ({ page }) => {
      await page.click('[data-testid="animal-welfare-nav"]');
      await page.waitForURL('/trackers/animal-welfare');

      // Log animal welfare activity
      await page.click('[data-testid="log-activity-button"]');

      // Select activity type
      await page.selectOption('[data-testid="activity-type-select"]', 'volunteer');

      // Fill details
      await page.fill('[data-testid="organization-input"]', 'Local Animal Shelter');
      await page.fill('[data-testid="hours-input"]', '3');
      await page.fill('[data-testid="description-input"]', 'Helped with dog walking and feeding');
      await page.fill('[data-testid="date-input"]', '2024-01-15');

      await page.click('[data-testid="save-activity-button"]');

      // Should show in activity log
      const activityLog = page.locator('[data-testid="activity-log"]');
      await expect(activityLog).toContainText('Local Animal Shelter');
      await expect(activityLog).toContainText('3 hours');

      // Check impact metrics
      const impactMetrics = page.locator('[data-testid="impact-metrics"]');
      await expect(impactMetrics).toBeVisible();
    });

    test('animal welfare donation tracking', async ({ page }) => {
      await page.goto('/trackers/animal-welfare');

      // Log donation
      await page.click('[data-testid="log-donation-button"]');

      await page.fill('[data-testid="organization-input"]', 'Wildlife Conservation Fund');
      await page.fill('[data-testid="amount-input"]', '50');
      await page.selectOption('[data-testid="currency-select"]', 'USD');
      await page.fill('[data-testid="date-input"]', '2024-01-15');

      await page.click('[data-testid="save-donation-button"]');

      // Should show in donation history
      const donationHistory = page.locator('[data-testid="donation-history"]');
      await expect(donationHistory).toContainText('Wildlife Conservation Fund');
      await expect(donationHistory).toContainText('$50');

      // Check total impact
      const totalImpact = page.locator('[data-testid="total-impact"]');
      await expect(totalImpact).toBeVisible();
    });
  });

  test.describe('Gaming Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('sustainability quiz gameplay', async ({ page }) => {
      await page.click('[data-testid="games-nav"]');
      await page.waitForURL('/games');

      // Start sustainability quiz
      await page.click('[data-testid="sustainability-quiz-card"]');
      await page.click('[data-testid="start-quiz-button"]');

      // Answer quiz questions
      for (let i = 0; i < 5; i++) {
        const questionText = page.locator('[data-testid="question-text"]');
        await expect(questionText).toBeVisible();

        // Select first answer option
        await page.click('[data-testid="answer-option-0"]');
        await page.click('[data-testid="next-question-button"]');

        await page.waitForTimeout(500);
      }

      // Should show quiz results
      const quizResults = page.locator('[data-testid="quiz-results"]');
      await expect(quizResults).toBeVisible();

      // Should show score
      const score = page.locator('[data-testid="quiz-score"]');
      await expect(score).toBeVisible();

      // Should earn points
      const pointsEarned = page.locator('[data-testid="points-earned"]');
      await expect(pointsEarned).toBeVisible();
    });

    test('eco challenge completion', async ({ page }) => {
      await page.goto('/games');

      // Join eco challenge
      await page.click('[data-testid="eco-challenge-card"]');
      await page.click('[data-testid="join-challenge-button"]');

      // Should show challenge details
      const challengeDetails = page.locator('[data-testid="challenge-details"]');
      await expect(challengeDetails).toBeVisible();

      // Complete challenge task
      await page.click('[data-testid="complete-task-button"]');

      // Upload proof (if required)
      const fileInput = page.locator('[data-testid="proof-upload"]');
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles({
          name: 'proof.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
        });
      }

      await page.click('[data-testid="submit-completion-button"]');

      // Should show completion confirmation
      const completionMessage = page.locator('[data-testid="completion-message"]');
      await expect(completionMessage).toBeVisible();

      // Should update progress
      const challengeProgress = page.locator('[data-testid="challenge-progress"]');
      await expect(challengeProgress).toBeVisible();
    });

    test('leaderboard and achievements', async ({ page }) => {
      await page.goto('/games');

      // View leaderboard
      await page.click('[data-testid="leaderboard-tab"]');

      const leaderboard = page.locator('[data-testid="leaderboard"]');
      await expect(leaderboard).toBeVisible();

      // Should show user ranking
      const userRanking = page.locator('[data-testid="user-ranking"]');
      await expect(userRanking).toBeVisible();

      // View achievements
      await page.click('[data-testid="achievements-tab"]');

      const achievements = page.locator('[data-testid="achievements-list"]');
      await expect(achievements).toBeVisible();

      // Should show earned badges
      const earnedBadges = page.locator('[data-testid="earned-badges"]');
      await expect(earnedBadges).toBeVisible();
    });
  });

  test.describe('Wallet Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('wallet setup and verification', async ({ page }) => {
      await page.click('[data-testid="wallet-nav"]');
      await page.waitForURL('/wallet');

      // Setup wallet
      await page.click('[data-testid="setup-wallet-button"]');

      // Choose wallet type
      await page.click('[data-testid="digital-wallet-option"]');

      // Enter wallet details
      await page.fill('[data-testid="wallet-name-input"]', 'My Eco Wallet');
      await page.selectOption('[data-testid="currency-select"]', 'USD');

      await page.click('[data-testid="create-wallet-button"]');

      // Should show wallet dashboard
      const walletDashboard = page.locator('[data-testid="wallet-dashboard"]');
      await expect(walletDashboard).toBeVisible();

      // Should show wallet balance
      const walletBalance = page.locator('[data-testid="wallet-balance"]');
      await expect(walletBalance).toBeVisible();
    });

    test('eco token earning and spending', async ({ page }) => {
      await page.goto('/wallet');

      // Earn tokens through activities
      await page.goto('/trackers/carbon');
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'bicycle');
      await page.fill('[data-testid="distance-input"]', '5');
      await page.click('[data-testid="save-activity-button"]');

      // Check token reward
      const tokenReward = page.locator('[data-testid="token-reward"]');
      await expect(tokenReward).toBeVisible();

      // Go back to wallet
      await page.goto('/wallet');

      // Balance should have increased
      const updatedBalance = page.locator('[data-testid="wallet-balance"]');
      await expect(updatedBalance).toBeVisible();

      // Spend tokens in marketplace
      await page.click('[data-testid="marketplace-button"]');

      const marketplaceItem = page.locator('[data-testid="marketplace-item"]').first();
      await marketplaceItem.click();

      await page.click('[data-testid="purchase-with-tokens-button"]');

      // Should show purchase confirmation
      const purchaseConfirmation = page.locator('[data-testid="purchase-confirmation"]');
      await expect(purchaseConfirmation).toBeVisible();
    });

    test('payment processing integration', async ({ page }) => {
      await page.goto('/wallet');

      // Add funds to wallet
      await page.click('[data-testid="add-funds-button"]');

      await page.fill('[data-testid="amount-input"]', '25');
      await page.selectOption('[data-testid="payment-method-select"]', 'credit-card');

      // Fill payment details
      await page.fill('[data-testid="card-number-input"]', '4242424242424242');
      await page.fill('[data-testid="expiry-input"]', '12/25');
      await page.fill('[data-testid="cvc-input"]', '123');

      await page.click('[data-testid="add-funds-submit-button"]');

      // Should show payment processing
      const paymentProcessing = page.locator('[data-testid="payment-processing"]');
      await expect(paymentProcessing).toBeVisible();

      // Should show success message
      const paymentSuccess = page.locator('[data-testid="payment-success"]');
      await expect(paymentSuccess).toBeVisible();

      // Wallet balance should update
      const updatedBalance = page.locator('[data-testid="wallet-balance"]');
      await expect(updatedBalance).toContainText('25');
    });
  });

  test.describe('MSME ESG Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'business@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('ESG assessment workflow', async ({ page }) => {
      await page.click('[data-testid="esg-nav"]');
      await page.waitForURL('/esg');

      // Start ESG assessment
      await page.click('[data-testid="start-assessment-button"]');

      // Environmental section
      await page.click('[data-testid="environmental-section"]');

      // Answer environmental questions
      await page.selectOption('[data-testid="energy-usage-select"]', 'renewable');
      await page.selectOption('[data-testid="waste-management-select"]', 'recycling');
      await page.fill('[data-testid="carbon-emissions-input"]', '100');

      await page.click('[data-testid="next-section-button"]');

      // Social section
      await page.selectOption('[data-testid="employee-diversity-select"]', 'high');
      await page.selectOption('[data-testid="community-engagement-select"]', 'active');

      await page.click('[data-testid="next-section-button"]');

      // Governance section
      await page.selectOption('[data-testid="board-diversity-select"]', 'diverse');
      await page.selectOption('[data-testid="transparency-select"]', 'high');

      await page.click('[data-testid="submit-assessment-button"]');

      // Should show ESG score
      const esgScore = page.locator('[data-testid="esg-score"]');
      await expect(esgScore).toBeVisible();

      // Should show recommendations
      const recommendations = page.locator('[data-testid="esg-recommendations"]');
      await expect(recommendations).toBeVisible();
    });

    test('ESG reporting and certification', async ({ page }) => {
      await page.goto('/esg');

      // Generate ESG report
      await page.click('[data-testid="generate-report-button"]');

      // Select report parameters
      await page.selectOption('[data-testid="report-period-select"]', 'quarterly');
      await page.selectOption('[data-testid="report-format-select"]', 'pdf');

      await page.click('[data-testid="generate-button"]');

      // Should show report generation progress
      const reportProgress = page.locator('[data-testid="report-progress"]');
      await expect(reportProgress).toBeVisible();

      // Should show download link when ready
      const downloadLink = page.locator('[data-testid="report-download"]');
      await expect(downloadLink).toBeVisible();

      // Apply for ESG certification
      await page.click('[data-testid="apply-certification-button"]');

      // Fill certification application
      await page.fill('[data-testid="company-name-input"]', 'Test Company Ltd');
      await page.fill('[data-testid="industry-input"]', 'Technology');
      await page.selectOption('[data-testid="certification-level-select"]', 'bronze');

      await page.click('[data-testid="submit-application-button"]');

      // Should show application confirmation
      const applicationConfirmation = page.locator('[data-testid="application-confirmation"]');
      await expect(applicationConfirmation).toBeVisible();
    });
  });

  test.describe('Cross-Platform Data Sync', () => {
    test('data synchronization across modules', async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Add carbon activity
      await page.goto('/trackers/carbon');
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'bicycle');
      await page.fill('[data-testid="distance-input"]', '10');
      await page.click('[data-testid="save-activity-button"]');

      // Check if activity appears in dashboard
      await page.goto('/dashboard');
      const dashboardActivity = page.locator('[data-testid="recent-activities"]');
      await expect(dashboardActivity).toContainText('bicycle');

      // Check if tokens were earned in wallet
      await page.goto('/wallet');
      const tokenBalance = page.locator('[data-testid="token-balance"]');
      await expect(tokenBalance).toBeVisible();

      // Check if activity contributes to game progress
      await page.goto('/games');
      const gameProgress = page.locator('[data-testid="eco-challenge-progress"]');
      await expect(gameProgress).toBeVisible();
    });

    test('real-time updates across tabs', async ({ browser }) => {
      // Create two browser contexts to simulate multiple tabs
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      // Login in both tabs
      for (const page of [page1, page2]) {
        await page.goto('/auth/login');
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'password123');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('/dashboard');
      }

      // Navigate to different sections
      await page1.goto('/trackers/carbon');
      await page2.goto('/wallet');

      // Add activity in first tab
      await page1.click('[data-testid="add-activity-button"]');
      await page1.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page1.selectOption('[data-testid="transport-mode-select"]', 'bicycle');
      await page1.fill('[data-testid="distance-input"]', '15');
      await page1.click('[data-testid="save-activity-button"]');

      // Check if wallet balance updates in second tab
      await page2.reload();
      const updatedBalance = page2.locator('[data-testid="token-balance"]');
      await expect(updatedBalance).toBeVisible();

      await context1.close();
      await context2.close();
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('handles network errors gracefully', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Simulate network failure
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      // Try to perform action that requires API call
      await page.goto('/trackers/carbon');
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.click('[data-testid="save-activity-button"]');

      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('network');

      // Should show retry option
      const retryButton = page.locator('[data-testid="retry-button"]');
      await expect(retryButton).toBeVisible();

      // Restore network and retry
      await page.unroute('**/api/**');
      await retryButton.click();

      // Should succeed after retry
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
    });

    test('handles server errors appropriately', async ({ page }) => {
      // Mock server error responses
      await page.route('**/api/trackers/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      await page.goto('/trackers/carbon');

      // Should show error state
      const errorState = page.locator('[data-testid="error-state"]');
      await expect(errorState).toBeVisible();

      // Should provide helpful error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toContainText('temporarily unavailable');
    });

    test('maintains data integrity during errors', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Start filling a form
      await page.goto('/trackers/carbon');
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'car');
      await page.fill('[data-testid="distance-input"]', '25');

      // Simulate network interruption during save
      await page.route('**/api/activities', route => {
        route.abort('failed');
      });

      await page.click('[data-testid="save-activity-button"]');

      // Should show error but preserve form data
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();

      // Form data should still be there
      const distanceInput = page.locator('[data-testid="distance-input"]');
      await expect(distanceInput).toHaveValue('25');

      const transportSelect = page.locator('[data-testid="transport-mode-select"]');
      await expect(transportSelect).toHaveValue('car');
    });
  });
});
