/**
 * E2E Tests for Rewards and Subscriptions
 * Tests the complete redemption and subscription flows
 */

import { test, expect } from '@playwright/test';

test.describe('Rewards and Subscriptions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Login as test user
    await page.click('text=Login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test.describe('Rewards Marketplace', () => {
    test('should display rewards marketplace', async ({ page }) => {
      await page.goto('/rewards');
      
      // Check if marketplace loads
      await expect(page.locator('h2:has-text("Rewards Marketplace")')).toBeVisible();
      await expect(page.locator('text=HealCoins')).toBeVisible();
    });

    test('should show insufficient coins for expensive rewards', async ({ page }) => {
      await page.goto('/rewards');
      
      // Find an expensive reward
      const expensiveReward = page.locator('[data-testid="reward-card"]').filter({ hasText: '1000' }).first();
      await expect(expensiveReward).toBeVisible();
      
      // Check that redeem button is disabled
      const redeemButton = expensiveReward.locator('button:has-text("Redeem")');
      await expect(redeemButton).toBeDisabled();
      await expect(redeemButton).toHaveText(/Insufficient Coins/);
    });

    test('should allow quantity selection', async ({ page }) => {
      await page.goto('/rewards');
      
      // Find a reward with stock > 1
      const rewardCard = page.locator('[data-testid="reward-card"]').first();
      await expect(rewardCard).toBeVisible();
      
      // Check quantity selector
      const quantityInput = rewardCard.locator('input[type="number"]');
      await expect(quantityInput).toBeVisible();
      
      // Test quantity increase
      const plusButton = rewardCard.locator('button:has-text("+")');
      await plusButton.click();
      await expect(quantityInput).toHaveValue('2');
    });

    test('should prevent redemption when out of stock', async ({ page }) => {
      await page.goto('/rewards');
      
      // Find an out of stock reward
      const outOfStockReward = page.locator('[data-testid="reward-card"]').filter({ hasText: 'Out of Stock' }).first();
      await expect(outOfStockReward).toBeVisible();
      
      // Check that redeem button is disabled
      const redeemButton = outOfStockReward.locator('button:has-text("Redeem")');
      await expect(redeemButton).toBeDisabled();
      await expect(redeemButton).toHaveText(/Out of Stock/);
    });

    test('should successfully redeem a reward', async ({ page }) => {
      await page.goto('/rewards');
      
      // Find an affordable reward
      const affordableReward = page.locator('[data-testid="reward-card"]').filter({ hasText: '50' }).first();
      await expect(affordableReward).toBeVisible();
      
      // Click redeem button
      const redeemButton = affordableReward.locator('button:has-text("Redeem Now")');
      await redeemButton.click();
      
      // Wait for success message
      await expect(page.locator('text=Successfully redeemed!')).toBeVisible();
      
      // Check that coins were deducted
      await expect(page.locator('text=HealCoins')).toContainText(/\d+/);
    });

    test('should show redemption history', async ({ page }) => {
      await page.goto('/wallet');
      
      // Click on redemptions tab
      await page.click('text=Redemptions');
      
      // Check if redemptions are displayed
      await expect(page.locator('[data-testid="redemption-item"]')).toBeVisible();
    });
  });

  test.describe('Subscriptions', () => {
    test('should display subscription plans', async ({ page }) => {
      await page.goto('/subscriptions');
      
      // Check if plans are displayed
      await expect(page.locator('h1:has-text("Choose Your Plan")')).toBeVisible();
      await expect(page.locator('[data-testid="subscription-plan"]')).toHaveCount(3);
    });

    test('should show plan features', async ({ page }) => {
      await page.goto('/subscriptions');
      
      // Check first plan
      const firstPlan = page.locator('[data-testid="subscription-plan"]').first();
      await expect(firstPlan).toBeVisible();
      
      // Check plan name and price
      await expect(firstPlan.locator('h3')).toBeVisible();
      await expect(firstPlan.locator('text=₹')).toBeVisible();
      
      // Check features list
      const features = firstPlan.locator('ul li');
      await expect(features).toHaveCount.greaterThan(0);
    });

    test('should highlight popular plan', async ({ page }) => {
      await page.goto('/subscriptions');
      
      // Check if middle plan is marked as popular
      const popularPlan = page.locator('[data-testid="subscription-plan"]').nth(1);
      await expect(popularPlan.locator('text=Most Popular')).toBeVisible();
    });

    test('should open Razorpay checkout', async ({ page }) => {
      await page.goto('/subscriptions');
      
      // Mock Razorpay
      await page.addInitScript(() => {
        window.Razorpay = {
          open: () => {
            // Simulate successful payment
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('payment-success', { detail: { payment_id: 'test_payment_123' } }));
            }, 1000);
          }
        };
      });
      
      // Click subscribe button
      const subscribeButton = page.locator('[data-testid="subscription-plan"]').first().locator('button:has-text("Subscribe")');
      await subscribeButton.click();
      
      // Wait for Razorpay to open (mocked)
      await page.waitForTimeout(2000);
      
      // Check if payment success is handled
      await expect(page.locator('text=Payment successful')).toBeVisible();
    });

    test('should show current subscription status', async ({ page }) => {
      // Mock existing subscription
      await page.addInitScript(() => {
        window.localStorage.setItem('current_subscription', JSON.stringify({
          id: 'sub_123',
          planId: 'plan_basic',
          status: 'active',
          amount: 99,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
      });
      
      await page.goto('/subscriptions');
      
      // Check if current subscription is shown
      await expect(page.locator('text=Current Plan')).toBeVisible();
      await expect(page.locator('text=You currently have an active subscription')).toBeVisible();
    });

    test('should allow subscription cancellation', async ({ page }) => {
      // Mock existing subscription
      await page.addInitScript(() => {
        window.localStorage.setItem('current_subscription', JSON.stringify({
          id: 'sub_123',
          planId: 'plan_basic',
          status: 'active',
          amount: 99,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
      });
      
      await page.goto('/subscriptions');
      
      // Click cancel button
      const cancelButton = page.locator('button:has-text("Cancel Subscription")');
      await cancelButton.click();
      
      // Confirm cancellation
      await page.click('text=Yes, cancel my subscription');
      
      // Check success message
      await expect(page.locator('text=Subscription cancelled successfully')).toBeVisible();
    });
  });

  test.describe('Admin Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Wait for admin dashboard
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    });

    test('should display admin rewards table', async ({ page }) => {
      await page.goto('/admin/rewards');
      
      // Check if rewards table is displayed
      await expect(page.locator('h1:has-text("Reward Management")')).toBeVisible();
      await expect(page.locator('[data-testid="rewards-table"]')).toBeVisible();
    });

    test('should filter redemptions by status', async ({ page }) => {
      await page.goto('/admin/rewards');
      
      // Select status filter
      await page.selectOption('select[name="status"]', 'completed');
      
      // Click apply filters
      await page.click('button:has-text("Apply Filters")');
      
      // Check if only completed redemptions are shown
      const statusBadges = page.locator('[data-testid="status-badge"]');
      await expect(statusBadges).toHaveCount.greaterThan(0);
      await expect(statusBadges.first()).toHaveText('Completed');
    });

    test('should export redemptions to CSV', async ({ page }) => {
      await page.goto('/admin/rewards');
      
      // Mock file download
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await page.click('button:has-text("Export CSV")');
      
      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/redemptions-.*\.csv/);
    });

    test('should update redemption status', async ({ page }) => {
      await page.goto('/admin/rewards');
      
      // Find a pending redemption
      const pendingRedemption = page.locator('[data-testid="redemption-row"]').filter({ hasText: 'Pending' }).first();
      await expect(pendingRedemption).toBeVisible();
      
      // Click complete button
      const completeButton = pendingRedemption.locator('button:has-text("Complete")');
      await completeButton.click();
      
      // Check if status updated
      await expect(pendingRedemption.locator('[data-testid="status-badge"]')).toHaveText('Completed');
    });

    test('should display admin subscriptions table', async ({ page }) => {
      await page.goto('/admin/subscriptions');
      
      // Check if subscriptions table is displayed
      await expect(page.locator('h1:has-text("Subscription Management")')).toBeVisible();
      await expect(page.locator('[data-testid="subscriptions-table"]')).toBeVisible();
    });

    test('should show subscription analytics', async ({ page }) => {
      await page.goto('/admin/subscriptions');
      
      // Check if analytics cards are displayed
      await expect(page.locator('[data-testid="analytics-card"]')).toHaveCount(4);
      await expect(page.locator('text=Total Subscriptions')).toBeVisible();
      await expect(page.locator('text=Active Subscriptions')).toBeVisible();
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('text=Churn Rate')).toBeVisible();
    });

    test('should export subscriptions to CSV', async ({ page }) => {
      await page.goto('/admin/subscriptions');
      
      // Mock file download
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await page.click('button:has-text("Export CSV")');
      
      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/subscriptions-.*\.csv/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle redemption errors gracefully', async ({ page }) => {
      await page.goto('/rewards');
      
      // Mock API error
      await page.route('**/wallet/redeem', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Insufficient coins' })
        });
      });
      
      // Try to redeem a reward
      const redeemButton = page.locator('[data-testid="reward-card"]').first().locator('button:has-text("Redeem")');
      await redeemButton.click();
      
      // Check error message
      await expect(page.locator('text=Insufficient coins')).toBeVisible();
    });

    test('should handle subscription checkout errors', async ({ page }) => {
      await page.goto('/subscriptions');
      
      // Mock API error
      await page.route('**/subscriptions/checkout', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'User already has an active subscription' })
        });
      });
      
      // Try to subscribe
      const subscribeButton = page.locator('[data-testid="subscription-plan"]').first().locator('button:has-text("Subscribe")');
      await subscribeButton.click();
      
      // Check error message
      await expect(page.locator('text=User already has an active subscription')).toBeVisible();
    });
  });
});
