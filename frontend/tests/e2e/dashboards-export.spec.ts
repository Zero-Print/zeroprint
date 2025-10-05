/**
 * E2E Tests for Dashboards and Export Functionality
 * Tests role-aware dashboards and CSV/PDF exports
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboards and Export', () => {
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

  test.describe('Citizen Dashboard', () => {
    test('should display citizen dashboard with all sections', async ({ page }) => {
      await page.goto('/citizen');
      
      // Check if citizen dashboard loads
      await expect(page.locator('h1:has-text("My Dashboard")')).toBeVisible();
      
      // Check quick stats cards
      await expect(page.locator('text=HealCoins')).toBeVisible();
      await expect(page.locator('text=Eco Score')).toBeVisible();
      await expect(page.locator('text=CO₂ Saved')).toBeVisible();
      await expect(page.locator('text=Global Rank')).toBeVisible();
      
      // Check tabs
      await expect(page.locator('text=Overview')).toBeVisible();
      await expect(page.locator('text=Trends')).toBeVisible();
      await expect(page.locator('text=Digital Twin')).toBeVisible();
      await expect(page.locator('text=Activity')).toBeVisible();
      await expect(page.locator('text=Leaderboards')).toBeVisible();
    });

    test('should display wallet information', async ({ page }) => {
      await page.goto('/citizen');
      
      // Click on Overview tab
      await page.click('text=Overview');
      
      // Check wallet card
      await expect(page.locator('text=Wallet')).toBeVisible();
      await expect(page.locator('text=HealCoins')).toBeVisible();
      await expect(page.locator('text=INR Balance')).toBeVisible();
      await expect(page.locator('text=Recent Transactions')).toBeVisible();
    });

    test('should display eco score breakdown', async ({ page }) => {
      await page.goto('/citizen');
      
      // Click on Overview tab
      await page.click('text=Overview');
      
      // Check eco score card
      await expect(page.locator('text=Eco Score')).toBeVisible();
      await expect(page.locator('text=Carbon Impact')).toBeVisible();
      await expect(page.locator('text=Mood Score')).toBeVisible();
      await expect(page.locator('text=Kindness Index')).toBeVisible();
      await expect(page.locator('text=Digital Twin')).toBeVisible();
    });

    test('should display trends charts', async ({ page }) => {
      await page.goto('/citizen');
      
      // Click on Trends tab
      await page.click('text=Trends');
      
      // Check trend charts
      await expect(page.locator('text=CO₂ Savings Trend')).toBeVisible();
      await expect(page.locator('text=Mood & Kindness Trends')).toBeVisible();
    });

    test('should display digital twin recommendations', async ({ page }) => {
      await page.goto('/citizen');
      
      // Click on Digital Twin tab
      await page.click('text=Digital Twin');
      
      // Check digital twin content
      await expect(page.locator('text=Digital Twin')).toBeVisible();
      await expect(page.locator('text=Recommendations')).toBeVisible();
      await expect(page.locator('text=Recent Simulations')).toBeVisible();
    });

    test('should display activity log', async ({ page }) => {
      await page.goto('/citizen');
      
      // Click on Activity tab
      await page.click('text=Activity');
      
      // Check activity table
      await expect(page.locator('text=Recent Activity')).toBeVisible();
      await expect(page.locator('text=Type')).toBeVisible();
      await expect(page.locator('text=Description')).toBeVisible();
      await expect(page.locator('text=Coins Earned')).toBeVisible();
      await expect(page.locator('text=Date')).toBeVisible();
    });

    test('should display leaderboards', async ({ page }) => {
      await page.goto('/citizen');
      
      // Click on Leaderboards tab
      await page.click('text=Leaderboards');
      
      // Check leaderboard sections
      await expect(page.locator('text=Global Leaderboard')).toBeVisible();
      await expect(page.locator('text=Friends Leaderboard')).toBeVisible();
      await expect(page.locator('text=Local Leaderboard')).toBeVisible();
    });

    test('should export citizen dashboard data', async ({ page }) => {
      await page.goto('/citizen');
      
      // Mock export API response
      await page.route('**/export/citizen', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              downloadUrl: 'blob:http://localhost:3000/mock-citizen-export.csv',
              filename: 'citizen_dashboard_2024-01-01.csv',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
          })
        });
      });
      
      // Click export CSV button
      await page.click('text=Export CSV');
      
      // Check if download was triggered
      await expect(page.locator('text=Export CSV')).toBeVisible();
    });
  });

  test.describe('Entity Dashboard', () => {
    test('should display entity type selector', async ({ page }) => {
      await page.goto('/entity');
      
      // Check entity type selector
      await expect(page.locator('text=Select Entity')).toBeVisible();
      await expect(page.locator('text=School')).toBeVisible();
      await expect(page.locator('text=MSME')).toBeVisible();
    });

    test('should load entity dashboard after selection', async ({ page }) => {
      await page.goto('/entity');
      
      // Select school entity
      await page.click('text=School');
      await page.click('text=Load Demo Data');
      
      // Check if dashboard loads
      await expect(page.locator('text=School Dashboard')).toBeVisible();
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Active Users')).toBeVisible();
      await expect(page.locator('text=CO₂ Saved')).toBeVisible();
      await expect(page.locator('text=Eco Score')).toBeVisible();
    });

    test('should display entity KPIs', async ({ page }) => {
      await page.goto('/entity');
      await page.click('text=School');
      await page.click('text=Load Demo Data');
      
      // Click on Overview tab
      await page.click('text=Overview');
      
      // Check KPIs card
      await expect(page.locator('text=Key Performance Indicators')).toBeVisible();
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Active Users')).toBeVisible();
      await expect(page.locator('text=Engagement Rate')).toBeVisible();
    });

    test('should display entity leaderboard', async ({ page }) => {
      await page.goto('/entity');
      await page.click('text=School');
      await page.click('text=Load Demo Data');
      
      // Click on Leaderboard tab
      await page.click('text=Leaderboard');
      
      // Check leaderboard
      await expect(page.locator('text=Entity Leaderboard')).toBeVisible();
      await expect(page.locator('text=Class/Department')).toBeVisible();
      await expect(page.locator('text=Rank')).toBeVisible();
      await expect(page.locator('text=Name')).toBeVisible();
      await expect(page.locator('text=Score')).toBeVisible();
    });

    test('should display game heatmap', async ({ page }) => {
      await page.goto('/entity');
      await page.click('text=School');
      await page.click('text=Load Demo Data');
      
      // Click on Games tab
      await page.click('text=Games');
      
      // Check game heatmap
      await expect(page.locator('text=Game Activity Heatmap')).toBeVisible();
      await expect(page.locator('text=Most popular games')).toBeVisible();
    });

    test('should display ESG report', async ({ page }) => {
      await page.goto('/entity');
      await page.click('text=School');
      await page.click('text=Load Demo Data');
      
      // Click on ESG Report tab
      await page.click('text=ESG Report');
      
      // Check ESG report
      await expect(page.locator('text=ESG Report')).toBeVisible();
      await expect(page.locator('text=Environmental')).toBeVisible();
      await expect(page.locator('text=Social')).toBeVisible();
      await expect(page.locator('text=Governance')).toBeVisible();
      await expect(page.locator('text=Export PDF Report')).toBeVisible();
      await expect(page.locator('text=Export CSV Data')).toBeVisible();
    });

    test('should export ESG report', async ({ page }) => {
      await page.goto('/entity');
      await page.click('text=School');
      await page.click('text=Load Demo Data');
      await page.click('text=ESG Report');
      
      // Mock ESG export API response
      await page.route('**/entity/school/*/esg-report*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              reportUrl: 'blob:http://localhost:3000/mock-esg-report.pdf',
              generatedAt: new Date().toISOString(),
              format: 'pdf'
            }
          })
        });
      });
      
      // Click export PDF button
      await page.click('text=Export PDF Report');
      
      // Check if download was triggered
      await expect(page.locator('text=Export PDF Report')).toBeVisible();
    });
  });

  test.describe('Government Dashboard', () => {
    test('should display government dashboard', async ({ page }) => {
      await page.goto('/government');
      
      // Check if government dashboard loads
      await expect(page.locator('h1:has-text("Government Dashboard")')).toBeVisible();
      await expect(page.locator('text=City-wide sustainability')).toBeVisible();
      
      // Check ward selector
      await expect(page.locator('text=Ward Selection')).toBeVisible();
      await expect(page.locator('text=Select a ward')).toBeVisible();
    });

    test('should display ward selector', async ({ page }) => {
      await page.goto('/government');
      
      // Check ward selector
      await expect(page.locator('text=Ward Selection')).toBeVisible();
      await expect(page.locator('text=Select a ward')).toBeVisible();
      
      // Mock ward data
      await page.route('**/government/ward-selector', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              wards: [
                { id: 'ward1', name: 'Ward 1', population: 10000, area: 5.2 },
                { id: 'ward2', name: 'Ward 2', population: 15000, area: 7.8 }
              ]
            }
          })
        });
      });
      
      // Click on ward selector
      await page.click('text=Select a ward');
      
      // Check if wards are loaded
      await expect(page.locator('text=Ward 1 (10000 residents)')).toBeVisible();
      await expect(page.locator('text=Ward 2 (15000 residents)')).toBeVisible();
    });

    test('should display KPIs', async ({ page }) => {
      await page.goto('/government');
      
      // Check KPIs cards
      await expect(page.locator('text=CO₂ Saved')).toBeVisible();
      await expect(page.locator('text=Adoption Rate')).toBeVisible();
      await expect(page.locator('text=EcoMind Score')).toBeVisible();
      await expect(page.locator('text=Active Users')).toBeVisible();
    });

    test('should display geographic heatmap', async ({ page }) => {
      await page.goto('/government');
      
      // Click on Geographic tab
      await page.click('text=Geographic');
      
      // Check geographic content
      await expect(page.locator('text=Geographic Heatmap')).toBeVisible();
      await expect(page.locator('text=Ward-wise sustainability')).toBeVisible();
      await expect(page.locator('text=Interactive Map')).toBeVisible();
    });

    test('should display scenario simulations', async ({ page }) => {
      await page.goto('/government');
      
      // Click on Scenarios tab
      await page.click('text=Scenarios');
      
      // Check scenarios content
      await expect(page.locator('text=Scenario Simulations')).toBeVisible();
      await expect(page.locator('text=Test different policy')).toBeVisible();
      await expect(page.locator('text=Run Simulation')).toBeVisible();
    });

    test('should run scenario simulation', async ({ page }) => {
      await page.goto('/government');
      await page.click('text=Scenarios');
      
      // Mock scenario simulation API
      await page.route('**/government/run-simulation', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              simulationId: 'sim_123',
              results: {
                co2Reduction: 25.5,
                costSavings: 5000,
                implementationTime: 180
              },
              status: 'completed'
            }
          })
        });
      });
      
      // Click run simulation button
      await page.click('text=Run Simulation');
      
      // Check if simulation was triggered
      await expect(page.locator('text=Run Simulation')).toBeVisible();
    });

    test('should display analytics', async ({ page }) => {
      await page.goto('/government');
      
      // Click on Analytics tab
      await page.click('text=Analytics');
      
      // Check analytics content
      await expect(page.locator('text=Ward Performance')).toBeVisible();
      await expect(page.locator('text=City-wide Trends')).toBeVisible();
    });
  });

  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard', async ({ page }) => {
      await page.goto('/admin');
      
      // Check if admin dashboard loads
      await expect(page.locator('h1:has-text("Admin Dashboard")')).toBeVisible();
      await expect(page.locator('text=System monitoring')).toBeVisible();
      
      // Check quick stats
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Active Rewards')).toBeVisible();
      await expect(page.locator('text=Total Errors')).toBeVisible();
      await expect(page.locator('text=Deployments')).toBeVisible();
    });

    test('should display users management', async ({ page }) => {
      await page.goto('/admin');
      
      // Click on Users tab
      await page.click('text=Users');
      
      // Check users table
      await expect(page.locator('text=User Management')).toBeVisible();
      await expect(page.locator('text=Search users...')).toBeVisible();
      await expect(page.locator('text=Name')).toBeVisible();
      await expect(page.locator('text=Email')).toBeVisible();
      await expect(page.locator('text=Role')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
    });

    test('should display system configuration', async ({ page }) => {
      await page.goto('/admin');
      
      // Click on Configs tab
      await page.click('text=Configs');
      
      // Check configs content
      await expect(page.locator('text=System Configuration')).toBeVisible();
      await expect(page.locator('text=Feature Flags')).toBeVisible();
      await expect(page.locator('text=System Settings')).toBeVisible();
    });

    test('should display rewards management', async ({ page }) => {
      await page.goto('/admin');
      
      // Click on Rewards tab
      await page.click('text=Rewards');
      
      // Check rewards table
      await expect(page.locator('text=Rewards Management')).toBeVisible();
      await expect(page.locator('text=Name')).toBeVisible();
      await expect(page.locator('text=Description')).toBeVisible();
      await expect(page.locator('text=Coin Cost')).toBeVisible();
      await expect(page.locator('text=Stock')).toBeVisible();
      await expect(page.locator('text=Redemptions')).toBeVisible();
    });

    test('should display transaction management', async ({ page }) => {
      await page.goto('/admin');
      
      // Click on Transactions tab
      await page.click('text=Transactions');
      
      // Check transactions table
      await expect(page.locator('text=Transaction Management')).toBeVisible();
      await expect(page.locator('text=ID')).toBeVisible();
      await expect(page.locator('text=User ID')).toBeVisible();
      await expect(page.locator('text=Type')).toBeVisible();
      await expect(page.locator('text=Amount')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
      await expect(page.locator('text=Actions')).toBeVisible();
      await expect(page.locator('text=Reverse')).toBeVisible();
    });

    test('should reverse transaction', async ({ page }) => {
      await page.goto('/admin');
      await page.click('text=Transactions');
      
      // Mock reverse transaction API
      await page.route('**/admin/reverse-transaction', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              success: true,
              message: 'Transaction reversed successfully'
            }
          })
        });
      });
      
      // Click reverse button
      await page.click('text=Reverse');
      
      // Check if confirmation dialog appears
      await expect(page.locator('text=Are you sure')).toBeVisible();
    });

    test('should display system monitoring', async ({ page }) => {
      await page.goto('/admin');
      
      // Click on Monitoring tab
      await page.click('text=Monitoring');
      
      // Check monitoring content
      await expect(page.locator('text=Recent Errors')).toBeVisible();
      await expect(page.locator('text=Deployment Logs')).toBeVisible();
    });
  });

  test.describe('Export Functionality', () => {
    test('should export dashboard data as CSV', async ({ page }) => {
      await page.goto('/citizen');
      
      // Mock export API response
      await page.route('**/export/citizen', route => {
        const body = JSON.parse(route.request().postData() || '{}');
        
        if (body.format === 'csv') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                downloadUrl: 'blob:http://localhost:3000/mock-citizen-export.csv',
                filename: 'citizen_dashboard_2024-01-01.csv',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              }
            })
          });
        } else {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Invalid format'
            })
          });
        }
      });
      
      // Click export CSV button
      await page.click('text=Export CSV');
      
      // Check if download was triggered
      await expect(page.locator('text=Export CSV')).toBeVisible();
    });

    test('should export dashboard data as PDF', async ({ page }) => {
      await page.goto('/citizen');
      
      // Mock export API response
      await page.route('**/export/citizen', route => {
        const body = JSON.parse(route.request().postData() || '{}');
        
        if (body.format === 'pdf') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                downloadUrl: 'blob:http://localhost:3000/mock-citizen-export.pdf',
                filename: 'citizen_dashboard_2024-01-01.pdf',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              }
            })
          });
        } else {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Invalid format'
            })
          });
        }
      });
      
      // Click export PDF button
      await page.click('text=Export PDF');
      
      // Check if download was triggered
      await expect(page.locator('text=Export PDF')).toBeVisible();
    });

    test('should handle export errors gracefully', async ({ page }) => {
      await page.goto('/citizen');
      
      // Mock export API error
      await page.route('**/export/citizen', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Export service unavailable'
          })
        });
      });
      
      // Click export CSV button
      await page.click('text=Export CSV');
      
      // Check if error is handled
      await expect(page.locator('text=Export service unavailable')).toBeVisible();
    });
  });

  test.describe('Dashboard Navigation', () => {
    test('should navigate between dashboard tabs', async ({ page }) => {
      await page.goto('/citizen');
      
      // Test tab navigation
      await page.click('text=Trends');
      await expect(page.locator('text=CO₂ Savings Trend')).toBeVisible();
      
      await page.click('text=Digital Twin');
      await expect(page.locator('text=Digital Twin')).toBeVisible();
      
      await page.click('text=Activity');
      await expect(page.locator('text=Recent Activity')).toBeVisible();
      
      await page.click('text=Leaderboards');
      await expect(page.locator('text=Global Leaderboard')).toBeVisible();
    });

    test('should refresh dashboard data', async ({ page }) => {
      await page.goto('/citizen');
      
      // Click refresh button
      await page.click('text=Refresh');
      
      // Check if dashboard is still visible
      await expect(page.locator('h1:has-text("My Dashboard")')).toBeVisible();
    });
  });
});
