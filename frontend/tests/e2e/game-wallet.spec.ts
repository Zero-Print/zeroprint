import { test, expect } from '@playwright/test';
import { ResilientNavigation } from './utils/resilient-navigation';

test.describe('Game and Wallet Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
    
    // Use resilient navigation for login
    const resilientNav = new ResilientNavigation(page);
    await resilientNav.performLogin('citizen@test.com', 'testpassword123');
    await resilientNav.waitForElement('[data-testid="dashboard"]');
  });

  test.describe('Game Workflows', () => {
    test('should complete carbon footprint quiz game', async ({ page }) => {
      // Navigate to games
      await page.goto('/games');
      await expect(page.locator('[data-testid="games-page"]')).toBeVisible();

      // Start carbon quiz
      await page.click('[data-testid="carbon-quiz-card"]');
      await expect(page.locator('[data-testid="game-intro"]')).toBeVisible();

      // Read instructions and start
      await page.click('[data-testid="start-game-button"]');

      // Answer quiz questions
      await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible();

      // Question 1: Transportation
      await page.click('[data-testid="answer-option-2"]');
      await page.click('[data-testid="next-question-button"]');

      // Question 2: Energy usage
      await page.click('[data-testid="answer-option-1"]');
      await page.click('[data-testid="next-question-button"]');

      // Question 3: Food choices
      await page.click('[data-testid="answer-option-3"]');
      await page.click('[data-testid="next-question-button"]');

      // Question 4: Waste management
      await page.click('[data-testid="answer-option-2"]');
      await page.click('[data-testid="next-question-button"]');

      // Question 5: Water usage
      await page.click('[data-testid="answer-option-1"]');
      await page.click('[data-testid="submit-quiz-button"]');

      // Check results
      await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="coins-earned"]')).toBeVisible();

      // Check coins were added to wallet
      await expect(page.locator('[data-testid="coins-earned"]')).toContainText('50 HealCoins');

      // View detailed feedback
      await page.click('[data-testid="view-feedback-button"]');
      await expect(page.locator('[data-testid="question-feedback"]')).toBeVisible();

      // Share results
      await page.click('[data-testid="share-results-button"]');
      await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    });

    test('should complete drag-and-drop recycling game', async ({ page }) => {
      await page.goto('/games');
      await page.click('[data-testid="recycling-game-card"]');

      // Start game
      await page.click('[data-testid="start-game-button"]');
      await expect(page.locator('[data-testid="recycling-game"]')).toBeVisible();

      // Drag items to correct bins
      const plasticBottle = page.locator('[data-testid="item-plastic-bottle"]');
      const plasticBin = page.locator('[data-testid="bin-plastic"]');
      await plasticBottle.dragTo(plasticBin);

      const paperBox = page.locator('[data-testid="item-paper-box"]');
      const paperBin = page.locator('[data-testid="bin-paper"]');
      await paperBox.dragTo(paperBin);

      const glassJar = page.locator('[data-testid="item-glass-jar"]');
      const glassBin = page.locator('[data-testid="bin-glass"]');
      await glassJar.dragTo(glassBin);

      const organicWaste = page.locator('[data-testid="item-organic-waste"]');
      const organicBin = page.locator('[data-testid="bin-organic"]');
      await organicWaste.dragTo(organicBin);

      // Check feedback for correct placements
      await expect(page.locator('[data-testid="correct-placement-feedback"]')).toHaveCount(4);

      // Complete level
      await page.click('[data-testid="next-level-button"]');

      // Level 2 with more complex items
      await expect(page.locator('[data-testid="level-2"]')).toBeVisible();

      // Complete game
      const compositeItem = page.locator('[data-testid="item-composite"]');
      const generalBin = page.locator('[data-testid="bin-general"]');
      await compositeItem.dragTo(generalBin);

      // Check final score
      await expect(page.locator('[data-testid="game-complete"]')).toBeVisible();
      await expect(page.locator('[data-testid="final-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="coins-earned"]')).toContainText('75 HealCoins');
    });

    test('should complete carbon simulation game', async ({ page }) => {
      await page.goto('/games');
      await page.click('[data-testid="carbon-simulation-card"]');

      await page.click('[data-testid="start-game-button"]');
      await expect(page.locator('[data-testid="simulation-game"]')).toBeVisible();

      // Make lifestyle choices
      await page.click('[data-testid="transport-choice-bicycle"]');
      await page.click('[data-testid="energy-choice-solar"]');
      await page.click('[data-testid="diet-choice-vegetarian"]');
      await page.click('[data-testid="housing-choice-apartment"]');

      // See real-time carbon impact
      await expect(page.locator('[data-testid="carbon-impact-meter"]')).toBeVisible();
      await expect(page.locator('[data-testid="annual-emissions"]')).toBeVisible();

      // Try different scenarios
      await page.click('[data-testid="scenario-button"]');
      await page.click('[data-testid="transport-choice-car"]');

      // Compare scenarios
      await expect(page.locator('[data-testid="scenario-comparison"]')).toBeVisible();

      // Submit final choices
      await page.click('[data-testid="submit-choices-button"]');

      // View impact report
      await expect(page.locator('[data-testid="impact-report"]')).toBeVisible();
      await expect(page.locator('[data-testid="coins-earned"]')).toContainText('100 HealCoins');

      // Get personalized recommendations
      await expect(page.locator('[data-testid="personalized-recommendations"]')).toBeVisible();
    });

    test('should track game progress and achievements', async ({ page }) => {
      await page.goto('/games/progress');

      // Check overall progress
      await expect(page.locator('[data-testid="games-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-coins-earned"]')).toBeVisible();
      await expect(page.locator('[data-testid="games-completed"]')).toBeVisible();

      // Check individual game progress
      await expect(page.locator('[data-testid="carbon-quiz-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="recycling-game-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="simulation-game-progress"]')).toBeVisible();

      // Check achievements
      await page.click('[data-testid="achievements-tab"]');
      await expect(page.locator('[data-testid="achievement-badges"]')).toBeVisible();

      // Check leaderboard
      await page.click('[data-testid="leaderboard-tab"]');
      await expect(page.locator('[data-testid="weekly-leaderboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="monthly-leaderboard"]')).toBeVisible();

      // Check personal stats
      await page.click('[data-testid="stats-tab"]');
      await expect(page.locator('[data-testid="games-played-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="streak-count"]')).toBeVisible();
    });

    test('should handle game errors gracefully', async ({ page }) => {
      await page.goto('/games');
      await page.click('[data-testid="carbon-quiz-card"]');

      // Simulate network error during game
      await page.route('**/api/games/**', route => route.abort());

      await page.click('[data-testid="start-game-button"]');

      // Should show error message
      await expect(page.locator('[data-testid="game-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

      // Should allow retry
      await page.unroute('**/api/games/**');
      await page.click('[data-testid="retry-button"]');

      await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible();
    });
  });

  test.describe('Wallet Workflows', () => {
    test('should display wallet balance and transactions', async ({ page }) => {
      await page.goto('/wallet');

      // Check wallet overview
      await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible();
      await expect(page.locator('[data-testid="healcoins-balance"]')).toBeVisible();

      // Check transaction history
      await expect(page.locator('[data-testid="transaction-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="transaction-item"]')).toHaveCount.greaterThan(0);

      // Filter transactions
      await page.selectOption('[data-testid="transaction-filter"]', 'earned');
      await expect(page.locator('[data-testid="transaction-item"]')).toContainText('Earned');

      await page.selectOption('[data-testid="transaction-filter"]', 'redeemed');
      await expect(page.locator('[data-testid="transaction-item"]')).toContainText('Redeemed');

      // Check date range filter
      await page.fill('[data-testid="date-from"]', '2024-01-01');
      await page.fill('[data-testid="date-to"]', '2024-01-31');
      await page.click('[data-testid="apply-filter-button"]');

      await expect(page.locator('[data-testid="filtered-transactions"]')).toBeVisible();
    });

    test('should earn coins from various activities', async ({ page }) => {
      // Check initial balance
      await page.goto('/wallet');
      const initialBalance = await page.locator('[data-testid="healcoins-balance"]').textContent();

      // Earn coins from tracker activity
      await page.goto('/trackers/carbon');
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'bicycle');
      await page.fill('[data-testid="distance-input"]', '5');
      await page.click('[data-testid="save-activity-button"]');

      // Check coins earned notification
      await expect(page.locator('[data-testid="coins-earned-notification"]')).toBeVisible();
      await expect(page.locator('[data-testid="coins-earned-notification"]')).toContainText(
        '10 HealCoins'
      );

      // Verify balance updated
      await page.goto('/wallet');
      const newBalance = await page.locator('[data-testid="healcoins-balance"]').textContent();
      expect(parseInt(newBalance!)).toBeGreaterThan(parseInt(initialBalance!));

      // Check transaction appears
      await expect(page.locator('[data-testid="transaction-history"]')).toContainText(
        'Carbon tracking activity'
      );
    });

    test('should redeem coins for rewards', async ({ page }) => {
      await page.goto('/wallet/rewards');

      // Check available rewards
      await expect(page.locator('[data-testid="rewards-catalog"]')).toBeVisible();
      await expect(page.locator('[data-testid="reward-item"]')).toHaveCount.greaterThan(0);

      // Filter rewards by category
      await page.click('[data-testid="category-vouchers"]');
      await expect(page.locator('[data-testid="voucher-rewards"]')).toBeVisible();

      // Select a reward
      await page.click('[data-testid="reward-item"]').first();
      await expect(page.locator('[data-testid="reward-details"]')).toBeVisible();

      // Check if user has enough coins
      const rewardCost = await page.locator('[data-testid="reward-cost"]').textContent();
      const userBalance = await page.locator('[data-testid="user-balance"]').textContent();

      if (parseInt(userBalance!) >= parseInt(rewardCost!)) {
        // Redeem reward
        await page.click('[data-testid="redeem-reward-button"]');

        // Confirm redemption
        await expect(page.locator('[data-testid="redemption-modal"]')).toBeVisible();
        await page.click('[data-testid="confirm-redemption-button"]');

        // Check success message
        await expect(page.locator('[data-testid="redemption-success"]')).toBeVisible();

        // Check balance updated
        await page.goto('/wallet');
        const newBalance = await page.locator('[data-testid="healcoins-balance"]').textContent();
        expect(parseInt(newBalance!)).toBeLessThan(parseInt(userBalance!));

        // Check redemption in transaction history
        await expect(page.locator('[data-testid="transaction-history"]')).toContainText(
          'Reward redemption'
        );
      }
    });

    test('should handle insufficient balance gracefully', async ({ page }) => {
      await page.goto('/wallet/rewards');

      // Find an expensive reward
      await page.click('[data-testid="sort-by-price-desc"]');
      await page.click('[data-testid="reward-item"]').first();

      // Try to redeem
      await page.click('[data-testid="redeem-reward-button"]');

      // Should show insufficient balance error
      await expect(page.locator('[data-testid="insufficient-balance-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="earn-more-coins-suggestion"]')).toBeVisible();

      // Should suggest ways to earn more coins
      await page.click('[data-testid="earn-coins-button"]');
      await expect(page.locator('[data-testid="earning-opportunities"]')).toBeVisible();
    });

    test('should track wallet limits and restrictions', async ({ page }) => {
      await page.goto('/wallet/limits');

      // Check daily limits
      await expect(page.locator('[data-testid="daily-earning-limit"]')).toBeVisible();
      await expect(page.locator('[data-testid="daily-spending-limit"]')).toBeVisible();

      // Check monthly limits
      await expect(page.locator('[data-testid="monthly-earning-limit"]')).toBeVisible();
      await expect(page.locator('[data-testid="monthly-spending-limit"]')).toBeVisible();

      // Check current usage
      await expect(page.locator('[data-testid="daily-usage-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="monthly-usage-progress"]')).toBeVisible();

      // Check rate limiting information
      await expect(page.locator('[data-testid="rate-limit-info"]')).toBeVisible();
    });

    test('should export wallet data', async ({ page }) => {
      await page.goto('/wallet/export');

      // Select export options
      await page.selectOption('[data-testid="export-format"]', 'csv');
      await page.fill('[data-testid="export-start-date"]', '2024-01-01');
      await page.fill('[data-testid="export-end-date"]', '2024-01-31');

      // Include transaction types
      await page.check('[data-testid="include-earnings"]');
      await page.check('[data-testid="include-redemptions"]');
      await page.check('[data-testid="include-transfers"]');

      // Start export
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-button"]');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('wallet-transactions');
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test.describe('Payment Workflows', () => {
    test('should handle subscription payments', async ({ page }) => {
      await page.goto('/subscription');

      // Check available plans
      await expect(page.locator('[data-testid="subscription-plans"]')).toBeVisible();

      // Select premium plan
      await page.click('[data-testid="premium-plan-button"]');

      // Review plan details
      await expect(page.locator('[data-testid="plan-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="plan-price"]')).toContainText('₹299');
      await expect(page.locator('[data-testid="plan-features"]')).toBeVisible();

      // Proceed to payment
      await page.click('[data-testid="subscribe-button"]');

      // Fill payment details
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
      await page.fill('[data-testid="cardholder-name"]', 'Test User');
      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="expiry-date"]', '12/25');
      await page.fill('[data-testid="cvv"]', '123');

      // Apply coupon if available
      await page.fill('[data-testid="coupon-code"]', 'WELCOME10');
      await page.click('[data-testid="apply-coupon-button"]');
      await expect(page.locator('[data-testid="discount-applied"]')).toBeVisible();

      // Complete payment
      await page.click('[data-testid="pay-button"]');

      // Handle 3D Secure (simulated)
      await expect(page.locator('[data-testid="3ds-verification"]')).toBeVisible();
      await page.fill('[data-testid="otp-input"]', '123456');
      await page.click('[data-testid="verify-otp-button"]');

      // Check payment success
      await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="subscription-active"]')).toBeVisible();

      // Verify subscription status
      await page.goto('/account/subscription');
      await expect(page.locator('[data-testid="active-subscription"]')).toContainText('Premium');
    });

    test('should handle payment failures', async ({ page }) => {
      await page.goto('/subscription');
      await page.click('[data-testid="premium-plan-button"]');
      await page.click('[data-testid="subscribe-button"]');

      // Use invalid card
      await page.fill('[data-testid="card-number"]', '4000000000000002');
      await page.fill('[data-testid="expiry-date"]', '12/25');
      await page.fill('[data-testid="cvv"]', '123');

      await page.click('[data-testid="pay-button"]');

      // Check error handling
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-payment-button"]')).toBeVisible();

      // Try different payment method
      await page.click('[data-testid="change-payment-method"]');
      await page.click('[data-testid="upi-payment-option"]');

      await page.fill('[data-testid="upi-id"]', 'test@paytm');
      await page.click('[data-testid="pay-with-upi-button"]');

      // Simulate UPI success
      await expect(page.locator('[data-testid="upi-payment-pending"]')).toBeVisible();
    });

    test('should handle refunds', async ({ page }) => {
      // Assume user has an active subscription
      await page.goto('/account/subscription');

      // Request refund
      await page.click('[data-testid="request-refund-button"]');

      // Fill refund form
      await expect(page.locator('[data-testid="refund-form"]')).toBeVisible();
      await page.selectOption('[data-testid="refund-reason"]', 'not_satisfied');
      await page.fill('[data-testid="refund-details"]', 'Service did not meet expectations');

      await page.click('[data-testid="submit-refund-request"]');

      // Check confirmation
      await expect(page.locator('[data-testid="refund-request-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="refund-timeline"]')).toContainText(
        '5-7 business days'
      );

      // Check refund status
      await page.goto('/account/refunds');
      await expect(page.locator('[data-testid="refund-status"]')).toContainText('Processing');
    });

    test('should manage payment methods', async ({ page }) => {
      await page.goto('/account/payment-methods');

      // Add new payment method
      await page.click('[data-testid="add-payment-method-button"]');

      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="expiry-date"]', '12/26');
      await page.fill('[data-testid="cvv"]', '456');
      await page.fill('[data-testid="cardholder-name"]', 'Test User');

      await page.click('[data-testid="save-payment-method"]');

      // Check method added
      await expect(page.locator('[data-testid="saved-payment-methods"]')).toContainText(
        '**** 1111'
      );

      // Set as default
      await page.click('[data-testid="set-default-button"]');
      await expect(page.locator('[data-testid="default-payment-method"]')).toContainText(
        '**** 1111'
      );

      // Delete payment method
      await page.click('[data-testid="delete-payment-method"]');
      await page.click('[data-testid="confirm-delete"]');

      await expect(page.locator('[data-testid="payment-method-deleted"]')).toBeVisible();
    });
  });

  test.describe('Integration Workflows', () => {
    test('should complete full user journey', async ({ page }) => {
      // Start with games to earn coins
      await page.goto('/games');
      await page.click('[data-testid="carbon-quiz-card"]');
      await page.click('[data-testid="start-game-button"]');

      // Complete quiz quickly
      for (let i = 1; i <= 5; i++) {
        await page.click(`[data-testid="answer-option-1"]`);
        if (i < 5) {
          await page.click('[data-testid="next-question-button"]');
        } else {
          await page.click('[data-testid="submit-quiz-button"]');
        }
      }

      // Check coins earned
      await expect(page.locator('[data-testid="coins-earned"]')).toBeVisible();

      // Go to wallet and check balance
      await page.goto('/wallet');
      const balance = await page.locator('[data-testid="healcoins-balance"]').textContent();
      expect(parseInt(balance!)).toBeGreaterThan(0);

      // Redeem coins for reward
      await page.goto('/wallet/rewards');
      await page.click('[data-testid="reward-item"]').first();
      await page.click('[data-testid="redeem-reward-button"]');
      await page.click('[data-testid="confirm-redemption-button"]');

      // Check redemption success
      await expect(page.locator('[data-testid="redemption-success"]')).toBeVisible();

      // Subscribe to premium
      await page.goto('/subscription');
      await page.click('[data-testid="premium-plan-button"]');
      await page.click('[data-testid="subscribe-button"]');

      // Complete payment
      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="expiry-date"]', '12/25');
      await page.fill('[data-testid="cvv"]', '123');
      await page.click('[data-testid="pay-button"]');

      // Verify premium features unlocked
      await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="premium-features"]')).toBeVisible();
    });

    test('should handle concurrent operations', async ({ page, context }) => {
      // Open multiple tabs
      const page2 = await context.newPage();

      // Login in both tabs
      await page.goto('/auth/login');
      await page2.goto('/auth/login');

      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'testpassword123');
      await page.click('[data-testid="login-submit-button"]');

      await page2.fill('[data-testid="email-input"]', 'test@example.com');
      await page2.fill('[data-testid="password-input"]', 'testpassword123');
      await page2.click('[data-testid="login-submit-button"]');

      // Perform actions simultaneously
      await Promise.all([
        // Tab 1: Play game
        page.goto('/games').then(() => page.click('[data-testid="carbon-quiz-card"]')),
        // Tab 2: Check wallet
        page2.goto('/wallet'),
      ]);

      // Both should work without conflicts
      await expect(page.locator('[data-testid="game-intro"]')).toBeVisible();
      await expect(page2.locator('[data-testid="wallet-balance"]')).toBeVisible();
    });

    test('should sync data across devices', async ({ page, context }) => {
      // Simulate different device by changing user agent
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        });
      });

      // Login and perform action
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'testpassword123');
      await page.click('[data-testid="login-submit-button"]');

      // Add tracker data
      await page.goto('/trackers/carbon');
      await page.click('[data-testid="add-activity-button"]');
      await page.selectOption('[data-testid="activity-type-select"]', 'transportation');
      await page.selectOption('[data-testid="transport-mode-select"]', 'car');
      await page.fill('[data-testid="distance-input"]', '20');
      await page.click('[data-testid="save-activity-button"]');

      // Create new context (simulate different device)
      const newContext = await page.context().browser()!.newContext();
      const newPage = await newContext.newPage();

      // Login on "new device"
      await newPage.goto('/login');
      await newPage.fill('[data-testid="email-input"]', 'test@example.com');
      await newPage.fill('[data-testid="password-input"]', 'testpassword123');
      await newPage.click('[data-testid="login-submit-button"]');

      // Check data is synced
      await newPage.goto('/trackers/carbon');
      await expect(newPage.locator('[data-testid="activity-list"]')).toContainText('Car - 20 km');

      await newContext.close();
    });
  });

  test.describe('Performance and Load', () => {
    test('should handle rapid interactions', async ({ page }) => {
      await page.goto('/games');

      // Rapidly click on different games
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="carbon-quiz-card"]');
        await page.goBack();
        await page.click('[data-testid="recycling-game-card"]');
        await page.goBack();
      }

      // Should still be responsive
      await expect(page.locator('[data-testid="games-page"]')).toBeVisible();
    });

    test('should handle large transaction history', async ({ page }) => {
      await page.goto('/wallet');

      // Load more transactions
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="load-more-transactions"]');
        await page.waitForTimeout(500);
      }

      // Should still be performant
      await expect(page.locator('[data-testid="transaction-item"]')).toHaveCount.greaterThan(50);

      // Search should work
      await page.fill('[data-testid="transaction-search"]', 'game');
      await expect(page.locator('[data-testid="transaction-item"]')).toContainText('game');
    });
  });
});
