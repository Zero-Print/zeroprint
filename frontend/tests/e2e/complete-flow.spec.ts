/**
 * Complete E2E Flow Test
 * Tests the full user journey: game → earnCoins → logs → webhook → dashboards
 */

import { test, expect } from '@playwright/test';

test.describe('Complete E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('Complete user journey: game → earnCoins → logs → webhook → dashboards', async ({ page }) => {
    // Step 1: Login as a test user
    await test.step('Login as test user', async () => {
      // Mock authentication for testing
      await page.evaluate(() => {
        localStorage.setItem('authToken', 'mock-auth-token');
        localStorage.setItem('userId', 'test-user-123');
        localStorage.setItem('userRole', 'citizen');
      });
      
      // Reload to apply auth state
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    // Step 2: Play a game and earn coins
    await test.step('Play game and earn coins', async () => {
      // Navigate to games page
      await page.click('text=Games');
      await page.waitForLoadState('networkidle');
      
      // Select a game
      await page.click('text=Climate Change Quiz');
      await page.waitForLoadState('networkidle');
      
      // Mock game completion
      await page.evaluate(async () => {
        const response = await fetch('/api/games/quiz-climate/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          },
          body: JSON.stringify({
            score: 85,
            clientData: {
              answers: [
                { questionId: 'q1', answer: 'B', timeSpent: 10, isCorrect: true },
                { questionId: 'q2', answer: 'C', timeSpent: 15, isCorrect: true },
                { questionId: 'q3', answer: 'B', timeSpent: 12, isCorrect: true },
                { questionId: 'q4', answer: 'C', timeSpent: 8, isCorrect: true },
                { questionId: 'q5', answer: 'A', timeSpent: 20, isCorrect: true }
              ]
            },
            playTime: 120
          })
        });
        
        if (!response.ok) {
          throw new Error(`Game completion failed: ${response.status}`);
        }
        
        return await response.json();
      });
      
      // Verify game completion
      await expect(page.locator('text=Game Completed!')).toBeVisible();
      await expect(page.locator('text=You earned 85 coins')).toBeVisible();
    });

    // Step 3: Log carbon-saving action
    await test.step('Log carbon-saving action', async () => {
      // Navigate to trackers page
      await page.click('text=Trackers');
      await page.waitForLoadState('networkidle');
      
      // Click on carbon tracking
      await page.click('text=Carbon Tracking');
      await page.waitForLoadState('networkidle');
      
      // Log a carbon action
      await page.fill('[data-testid="carbon-action-input"]', 'Used public transport');
      await page.fill('[data-testid="co2-saved-input"]', '2.5');
      await page.fill('[data-testid="quantity-input"]', '12.5');
      await page.selectOption('[data-testid="unit-select"]', 'km');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Verify carbon action was logged
      await expect(page.locator('text=Carbon action logged successfully')).toBeVisible();
      await expect(page.locator('text=You earned 2 coins')).toBeVisible();
    });

    // Step 4: Log mood check-in
    await test.step('Log mood check-in', async () => {
      // Click on mood tracking
      await page.click('text=Mood Tracking');
      await page.waitForLoadState('networkidle');
      
      // Fill mood form
      await page.click('[data-testid="mood-4"]'); // Good mood
      await page.click('[data-testid="energy-4"]'); // High energy
      await page.click('[data-testid="stress-2"]'); // Low stress
      await page.fill('[data-testid="mood-notes"]', 'Feeling great after the game!');
      
      // Submit mood check-in
      await page.click('button[type="submit"]');
      
      // Verify mood was logged
      await expect(page.locator('text=Mood logged successfully')).toBeVisible();
      await expect(page.locator('text=You earned 5 coins')).toBeVisible();
    });

    // Step 5: Redeem a reward
    await test.step('Redeem a reward', async () => {
      // Navigate to rewards page
      await page.click('text=Rewards');
      await page.waitForLoadState('networkidle');
      
      // Select a reward
      await page.click('text=Eco-Friendly Water Bottle');
      await page.waitForLoadState('networkidle');
      
      // Redeem the reward
      await page.click('text=Redeem for 500 coins');
      
      // Confirm redemption
      await page.click('text=Confirm Redemption');
      
      // Verify redemption
      await expect(page.locator('text=Reward redeemed successfully')).toBeVisible();
      await expect(page.locator('text=You redeemed Eco-Friendly Water Bottle')).toBeVisible();
    });

    // Step 6: Check wallet balance
    await test.step('Check wallet balance', async () => {
      // Navigate to wallet page
      await page.click('text=Wallet');
      await page.waitForLoadState('networkidle');
      
      // Verify wallet balance
      await expect(page.locator('text=HealCoins')).toBeVisible();
      await expect(page.locator('text=Balance:')).toBeVisible();
      
      // Check transaction history
      await page.click('text=Transaction History');
      await page.waitForLoadState('networkidle');
      
      // Verify transactions are visible
      await expect(page.locator('text=Game Completion')).toBeVisible();
      await expect(page.locator('text=Carbon Action')).toBeVisible();
      await expect(page.locator('text=Mood Check-in')).toBeVisible();
      await expect(page.locator('text=Reward Redemption')).toBeVisible();
    });

    // Step 7: Check dashboard updates
    await test.step('Check dashboard updates', async () => {
      // Navigate to dashboard
      await page.click('text=Dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify dashboard metrics
      await expect(page.locator('text=Total CO₂ Saved')).toBeVisible();
      await expect(page.locator('text=Total Coins Earned')).toBeVisible();
      await expect(page.locator('text=Total Coins Redeemed')).toBeVisible();
      
      // Check carbon trends chart
      await expect(page.locator('[data-testid="carbon-trends-chart"]')).toBeVisible();
      
      // Check mood trends chart
      await expect(page.locator('[data-testid="mood-trends-chart"]')).toBeVisible();
      
      // Check game trends chart
      await expect(page.locator('[data-testid="game-trends-chart"]')).toBeVisible();
      
      // Check recent activity
      await expect(page.locator('text=Recent Activity')).toBeVisible();
      await expect(page.locator('text=Used public transport')).toBeVisible();
      await expect(page.locator('text=Completed Climate Change Quiz')).toBeVisible();
      await expect(page.locator('text=Redeemed Eco-Friendly Water Bottle')).toBeVisible();
    });

    // Step 8: Test subscription flow
    await test.step('Test subscription flow', async () => {
      // Navigate to subscriptions page
      await page.click('text=Subscriptions');
      await page.waitForLoadState('networkidle');
      
      // Select a plan
      await page.click('text=Premium Plan');
      await page.waitForLoadState('networkidle');
      
      // Start checkout
      await page.click('text=Subscribe Now');
      await page.waitForLoadState('networkidle');
      
      // Verify checkout page
      await expect(page.locator('text=Checkout')).toBeVisible();
      await expect(page.locator('text=Premium Plan')).toBeVisible();
      await expect(page.locator('text=₹599/month')).toBeVisible();
      
      // Mock successful payment
      await page.evaluate(async () => {
        const response = await fetch('/api/webhooks/razorpay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Razorpay-Signature': 'mock-signature'
          },
          body: JSON.stringify({
            event: 'payment.captured',
            payload: {
              payment: {
                entity: {
                  id: 'pay_mock123',
                  amount: 59900,
                  currency: 'INR',
                  status: 'captured'
                }
              },
              order: {
                entity: {
                  id: 'order_mock123',
                  amount: 59900,
                  currency: 'INR',
                  status: 'paid'
                }
              }
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.status}`);
        }
        
        return await response.json();
      });
      
      // Verify subscription success
      await expect(page.locator('text=Subscription activated successfully')).toBeVisible();
      await expect(page.locator('text=Premium Plan')).toBeVisible();
    });

    // Step 9: Test admin dashboard (if user is admin)
    await test.step('Test admin dashboard', async () => {
      // Switch to admin user
      await page.evaluate(() => {
        localStorage.setItem('userId', 'admin-123');
        localStorage.setItem('userRole', 'admin');
      });
      
      // Reload to apply admin state
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Navigate to admin dashboard
      await page.click('text=Admin Dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify admin metrics
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Total CO₂ Saved')).toBeVisible();
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('text=Active Subscriptions')).toBeVisible();
      
      // Check system health
      await expect(page.locator('text=System Health')).toBeVisible();
      await expect(page.locator('text=Status: Healthy')).toBeVisible();
      
      // Check error logs
      await page.click('text=Error Logs');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Error Logs')).toBeVisible();
      
      // Check performance metrics
      await page.click('text=Performance Metrics');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Performance Metrics')).toBeVisible();
      
      // Check fraud alerts
      await page.click('text=Fraud Alerts');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Fraud Alerts')).toBeVisible();
    });

    // Step 10: Test government dashboard
    await test.step('Test government dashboard', async () => {
      // Switch to government user
      await page.evaluate(() => {
        localStorage.setItem('userId', 'govt-123');
        localStorage.setItem('userRole', 'govt');
      });
      
      // Reload to apply government state
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Navigate to government dashboard
      await page.click('text=Government Dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify government metrics
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Total CO₂ Saved')).toBeVisible();
      await expect(page.locator('text=Ward Statistics')).toBeVisible();
      
      // Check ward selector
      await page.click('text=Select Ward');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Ward 1 - Central')).toBeVisible();
      await expect(page.locator('text=Ward 2 - North')).toBeVisible();
      
      // Select a ward
      await page.click('text=Ward 1 - Central');
      await page.waitForLoadState('networkidle');
      
      // Verify ward data
      await expect(page.locator('text=Ward 1 - Central')).toBeVisible();
      await expect(page.locator('text=Population: 50,000')).toBeVisible();
      await expect(page.locator('text=Area: 25.5 sq km')).toBeVisible();
      
      // Check scenario simulations
      await page.click('text=Scenario Simulations');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Scenario Simulations')).toBeVisible();
    });

    // Step 11: Test monitoring and analytics
    await test.step('Test monitoring and analytics', async () => {
      // Switch back to admin user
      await page.evaluate(() => {
        localStorage.setItem('userId', 'admin-123');
        localStorage.setItem('userRole', 'admin');
      });
      
      // Reload to apply admin state
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Navigate to monitoring page
      await page.click('text=Monitoring');
      await page.waitForLoadState('networkidle');
      
      // Verify monitoring metrics
      await expect(page.locator('text=System Health')).toBeVisible();
      await expect(page.locator('text=Analytics Overview')).toBeVisible();
      await expect(page.locator('text=Performance Metrics')).toBeVisible();
      await expect(page.locator('text=System Alerts')).toBeVisible();
      
      // Check health status
      await expect(page.locator('text=Status: Healthy')).toBeVisible();
      await expect(page.locator('text=Uptime:')).toBeVisible();
      
      // Check analytics
      await expect(page.locator('text=DAU:')).toBeVisible();
      await expect(page.locator('text=Total Coins:')).toBeVisible();
      await expect(page.locator('text=CO₂ Saved:')).toBeVisible();
      await expect(page.locator('text=Error Count:')).toBeVisible();
      
      // Check performance metrics table
      await expect(page.locator('text=Route')).toBeVisible();
      await expect(page.locator('text=Avg Latency (ms)')).toBeVisible();
      await expect(page.locator('text=P95 Latency (ms)')).toBeVisible();
      await expect(page.locator('text=P99 Latency (ms)')).toBeVisible();
      
      // Check system alerts
      await expect(page.locator('text=Type')).toBeVisible();
      await expect(page.locator('text=Severity')).toBeVisible();
      await expect(page.locator('text=Message')).toBeVisible();
      await expect(page.locator('text=Time')).toBeVisible();
      
      // Test export functionality
      await page.click('text=Export Data');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Data Export')).toBeVisible();
      await expect(page.locator('text=Time Range')).toBeVisible();
      await expect(page.locator('text=Format')).toBeVisible();
      
      // Test export
      await page.selectOption('[data-testid="time-range-select"]', '7d');
      await page.selectOption('[data-testid="format-select"]', 'csv');
      await page.click('text=Export');
      
      // Verify export
      await expect(page.locator('text=Export completed')).toBeVisible();
    });

    // Step 12: Test integrations
    await test.step('Test integrations', async () => {
      // Navigate to integrations page
      await page.click('text=Integrations');
      await page.waitForLoadState('networkidle');
      
      // Test notifications
      await page.click('text=Notifications');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Notification Templates')).toBeVisible();
      await expect(page.locator('text=Notification Logs')).toBeVisible();
      
      // Test partners
      await page.click('text=Partners');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=CSR Partners')).toBeVisible();
      await expect(page.locator('text=Partner Logs')).toBeVisible();
      
      // Test geo services
      await page.click('text=Geo Services');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Ward GeoJSON')).toBeVisible();
      await expect(page.locator('text=Reverse Geocoding')).toBeVisible();
      
      // Test feature flags
      await page.click('text=Feature Flags');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Push Notifications')).toBeVisible();
      await expect(page.locator('text=CSR Integration')).toBeVisible();
      await expect(page.locator('text=Geo Services')).toBeVisible();
    });

    // Step 13: Verify audit logs
    await test.step('Verify audit logs', async () => {
      // Navigate to audit logs
      await page.click('text=Audit Logs');
      await page.waitForLoadState('networkidle');
      
      // Verify audit logs are visible
      await expect(page.locator('text=Audit Logs')).toBeVisible();
      await expect(page.locator('text=Action')).toBeVisible();
      await expect(page.locator('text=User')).toBeVisible();
      await expect(page.locator('text=Timestamp')).toBeVisible();
      
      // Check for our test actions
      await expect(page.locator('text=COINS_EARNED')).toBeVisible();
      await expect(page.locator('text=carbonActionLogged')).toBeVisible();
      await expect(page.locator('text=moodLogged')).toBeVisible();
      await expect(page.locator('text=rewardRedeemed')).toBeVisible();
      await expect(page.locator('text=subscriptionActivated')).toBeVisible();
    });

    // Step 14: Test error handling
    await test.step('Test error handling', async () => {
      // Test invalid game completion
      await page.evaluate(async () => {
        const response = await fetch('/api/games/invalid-game/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          },
          body: JSON.stringify({
            score: 100,
            clientData: {},
            playTime: 60
          })
        });
        
        return response.status;
      });
      
      // Test insufficient balance for redemption
      await page.evaluate(async () => {
        const response = await fetch('/api/rewards/redeem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          },
          body: JSON.stringify({
            rewardId: 'expensive-reward',
            quantity: 1
          })
        });
        
        return response.status;
      });
      
      // Test duplicate action
      await page.evaluate(async () => {
        const response = await fetch('/api/trackers/carbon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          },
          body: JSON.stringify({
            categoryId: 'transportation',
            action: 'Used public transport',
            co2Saved: 2.5,
            quantity: 12.5,
            unit: 'km'
          })
        });
        
        return response.status;
      });
    });

    // Step 15: Test performance
    await test.step('Test performance', async () => {
      // Measure page load times
      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Verify load time is reasonable
      expect(loadTime).toBeLessThan(3000); // 3 seconds
      
      // Test API response times
      const apiStartTime = Date.now();
      await page.evaluate(async () => {
        const response = await fetch('/api/wallet/balance', {
          headers: {
            'Authorization': 'Bearer mock-auth-token'
          }
        });
        return response.ok;
      });
      const apiResponseTime = Date.now() - apiStartTime;
      
      // Verify API response time is reasonable
      expect(apiResponseTime).toBeLessThan(1000); // 1 second
    });
  });

  test('Test complete flow with different user roles', async ({ page }) => {
    const roles = ['citizen', 'school', 'msme', 'govt', 'admin'];
    
    for (const role of roles) {
      await test.step(`Test flow as ${role}`, async () => {
        // Set user role
        await page.evaluate((userRole) => {
          localStorage.setItem('userId', `test-${userRole}-123`);
          localStorage.setItem('userRole', userRole);
        }, role);
        
        // Reload to apply role
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Verify role-specific dashboard
        if (role === 'citizen') {
          await expect(page.locator('text=Citizen Dashboard')).toBeVisible();
        } else if (role === 'school') {
          await expect(page.locator('text=School Dashboard')).toBeVisible();
        } else if (role === 'msme') {
          await expect(page.locator('text=MSME Dashboard')).toBeVisible();
        } else if (role === 'govt') {
          await expect(page.locator('text=Government Dashboard')).toBeVisible();
        } else if (role === 'admin') {
          await expect(page.locator('text=Admin Dashboard')).toBeVisible();
        }
        
        // Test role-specific functionality
        if (role === 'admin') {
          await expect(page.locator('text=System Health')).toBeVisible();
          await expect(page.locator('text=Error Logs')).toBeVisible();
          await expect(page.locator('text=Performance Metrics')).toBeVisible();
        }
        
        if (role === 'govt') {
          await expect(page.locator('text=Ward Statistics')).toBeVisible();
          await expect(page.locator('text=Scenario Simulations')).toBeVisible();
        }
      });
    }
  });
});
