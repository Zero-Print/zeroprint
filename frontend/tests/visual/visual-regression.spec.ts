import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  });

  test.describe('Landing Page', () => {
    test('homepage hero section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const heroSection = page.locator('[data-testid="hero-section"]');
      await expect(heroSection).toBeVisible();
      await expect(heroSection).toHaveScreenshot('homepage-hero.png');
    });

    test('features section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const featuresSection = page.locator('[data-testid="features-section"]');
      await expect(featuresSection).toBeVisible();
      await expect(featuresSection).toHaveScreenshot('homepage-features.png');
    });

    test('pricing section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const pricingSection = page.locator('[data-testid="pricing-section"]');
      await expect(pricingSection).toBeVisible();
      await expect(pricingSection).toHaveScreenshot('homepage-pricing.png');
    });
  });

  test.describe('Authentication Pages', () => {
    test('login page', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-page.png');
    });

    test('register page', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('register-page.png');
    });

    test('forgot password page', async ({ page }) => {
      await page.goto('/auth/forgot-password');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('forgot-password-page.png');
    });
  });

  test.describe('Dashboard Components', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('dashboard overview', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      const dashboardContent = page.locator('[data-testid="dashboard-content"]');
      await expect(dashboardContent).toBeVisible();
      await expect(dashboardContent).toHaveScreenshot('dashboard-overview.png');
    });

    test('carbon tracker widget', async ({ page }) => {
      const carbonWidget = page.locator('[data-testid="carbon-tracker-widget"]');
      await expect(carbonWidget).toBeVisible();
      await expect(carbonWidget).toHaveScreenshot('carbon-tracker-widget.png');
    });

    test('mental health tracker widget', async ({ page }) => {
      const mentalHealthWidget = page.locator('[data-testid="mental-health-widget"]');
      await expect(mentalHealthWidget).toBeVisible();
      await expect(mentalHealthWidget).toHaveScreenshot('mental-health-widget.png');
    });

    test('animal welfare tracker widget', async ({ page }) => {
      const animalWelfareWidget = page.locator('[data-testid="animal-welfare-widget"]');
      await expect(animalWelfareWidget).toBeVisible();
      await expect(animalWelfareWidget).toHaveScreenshot('animal-welfare-widget.png');
    });
  });

  test.describe('Tracker Pages', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('carbon tracker page', async ({ page }) => {
      await page.goto('/trackers/carbon');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('carbon-tracker-page.png');
    });

    test('mental health tracker page', async ({ page }) => {
      await page.goto('/trackers/mental-health');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('mental-health-tracker-page.png');
    });

    test('animal welfare tracker page', async ({ page }) => {
      await page.goto('/trackers/animal-welfare');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('animal-welfare-tracker-page.png');
    });
  });

  test.describe('Game Components', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('games hub page', async ({ page }) => {
      await page.goto('/games');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('games-hub-page.png');
    });

    test('quiz game interface', async ({ page }) => {
      await page.goto('/games/quiz');
      await page.waitForLoadState('networkidle');

      const quizInterface = page.locator('[data-testid="quiz-interface"]');
      await expect(quizInterface).toBeVisible();
      await expect(quizInterface).toHaveScreenshot('quiz-game-interface.png');
    });

    test('memory game interface', async ({ page }) => {
      await page.goto('/games/memory');
      await page.waitForLoadState('networkidle');

      const memoryInterface = page.locator('[data-testid="memory-game-interface"]');
      await expect(memoryInterface).toBeVisible();
      await expect(memoryInterface).toHaveScreenshot('memory-game-interface.png');
    });
  });

  test.describe('Wallet and Payment Components', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('wallet overview page', async ({ page }) => {
      await page.goto('/wallet');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('wallet-overview-page.png');
    });

    test('coin balance widget', async ({ page }) => {
      await page.goto('/wallet');
      await page.waitForLoadState('networkidle');

      const coinBalance = page.locator('[data-testid="coin-balance-widget"]');
      await expect(coinBalance).toBeVisible();
      await expect(coinBalance).toHaveScreenshot('coin-balance-widget.png');
    });

    test('redemption options', async ({ page }) => {
      await page.goto('/wallet/redeem');
      await page.waitForLoadState('networkidle');

      const redemptionOptions = page.locator('[data-testid="redemption-options"]');
      await expect(redemptionOptions).toBeVisible();
      await expect(redemptionOptions).toHaveScreenshot('redemption-options.png');
    });
  });

  test.describe('MSME ESG Components', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication as MSME user
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'msme@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('ESG dashboard', async ({ page }) => {
      await page.goto('/msme/esg');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('esg-dashboard.png');
    });

    test('ESG data entry form', async ({ page }) => {
      await page.goto('/msme/esg/data-entry');
      await page.waitForLoadState('networkidle');

      const dataEntryForm = page.locator('[data-testid="esg-data-entry-form"]');
      await expect(dataEntryForm).toBeVisible();
      await expect(dataEntryForm).toHaveScreenshot('esg-data-entry-form.png');
    });

    test('ESG report preview', async ({ page }) => {
      await page.goto('/msme/esg/reports');
      await page.waitForLoadState('networkidle');

      const reportPreview = page.locator('[data-testid="esg-report-preview"]');
      await expect(reportPreview).toBeVisible();
      await expect(reportPreview).toHaveScreenshot('esg-report-preview.png');
    });
  });

  test.describe('Mobile Responsive Views', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    });

    test('mobile homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('mobile-homepage.png');
    });

    test('mobile dashboard', async ({ page }) => {
      // Mock authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('mobile-dashboard.png');
    });

    test('mobile navigation menu', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await page.waitForSelector('[data-testid="mobile-menu"]');

      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toHaveScreenshot('mobile-navigation-menu.png');
    });
  });

  test.describe('Dark Mode Views', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode
      await page.goto('/');
      await page.click('[data-testid="theme-toggle"]');
      await page.waitForTimeout(500); // Wait for theme transition
    });

    test('dark mode homepage', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('dark-mode-homepage.png');
    });

    test('dark mode dashboard', async ({ page }) => {
      // Mock authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dark-mode-dashboard.png');
    });
  });

  test.describe('Error States', () => {
    test('404 page', async ({ page }) => {
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('404-page.png');
    });

    test('500 error page', async ({ page }) => {
      // Mock server error
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const errorState = page.locator('[data-testid="error-state"]');
      await expect(errorState).toBeVisible();
      await expect(errorState).toHaveScreenshot('500-error-state.png');
    });

    test('network offline state', async ({ page }) => {
      await page.goto('/dashboard');

      // Simulate offline
      await page.context().setOffline(true);
      await page.reload();
      await page.waitForLoadState('networkidle');

      const offlineState = page.locator('[data-testid="offline-state"]');
      await expect(offlineState).toBeVisible();
      await expect(offlineState).toHaveScreenshot('offline-state.png');
    });
  });
});
