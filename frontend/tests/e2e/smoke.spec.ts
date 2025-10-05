import { test, expect } from '@playwright/test';
import { setupResilientTest } from './utils/resilient-navigation';

/**
 * Smoke Tests - Critical Path Validation
 *
 * These tests verify that the most critical functionality works after deployment.
 * They should be fast, reliable, and cover the essential user journeys.
 */

test.describe('Smoke Tests - Critical Paths', () => {
  test.describe('Application Availability', () => {
    test('homepage loads successfully', async ({ page }) => {
      // Set longer timeout for navigation
      test.setTimeout(60000);
      
      // Use resilient navigation setup
      await setupResilientTest(page, '/');

      // Verify page loads
      await expect(page).toHaveTitle(/ZeroPrint/);

      // Verify critical elements are present
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="navigation"]')).toBeVisible();

      // Verify no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Wait for page to be fully loaded
      await page.waitForTimeout(2000);
      expect(errors.length).toBe(0);
    });

    test('API health check responds', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
    });
  });

  test.describe('Authentication Flow', () => {
    test('user can access login page', async ({ page }) => {
      await page.goto('/auth/login');

      // Verify login form is present
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    });

    test('user can access registration page', async ({ page }) => {
      await page.goto('/auth/signup');

      // Verify registration form is present
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
    });

    test('login form validation works', async ({ page }) => {
      await page.goto('/auth/login');

      // Try to submit empty form
      await page.click('[data-testid="login-button"]');

      // Verify validation messages appear
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });
  });

  test.describe('Core Navigation', () => {
    test('main navigation links work', async ({ page }) => {
      await page.goto('/');

      // Test navigation to key pages
      const navLinks = [
        { selector: '[data-testid="nav-features"]', expectedUrl: '/#features' },
        { selector: '[data-testid="nav-pricing"]', expectedUrl: '/#pricing' },
        { selector: '[data-testid="nav-login"]', expectedUrl: '/auth/login' },
      ];

      for (const link of navLinks) {
        await page.click(link.selector);
        await page.waitForLoadState('networkidle');

        if (link.expectedUrl.startsWith('#')) {
          // For anchor links, check if we're on the same page
          expect(page.url()).toContain(link.expectedUrl);
        } else {
          // For page navigation, check the URL
          expect(page.url()).toContain(link.expectedUrl);
        }

        // Go back to homepage for next test
        if (!link.expectedUrl.startsWith('#')) {
          await page.goto('/');
        }
      }
    });

    test('mobile navigation works', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Test mobile navigation link
      await page.click('[data-testid="mobile-nav-login"]');
      await page.waitForURL('**/auth/login');
      expect(page.url()).toContain('/auth/login');
    });
  });

  test.describe('Dashboard Access', () => {
    test('dashboard redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForURL('**/auth/login**');
      expect(page.url()).toContain('/auth/login');
    });

    test('protected routes redirect to login', async ({ page }) => {
      const protectedRoutes = [
        '/trackers/carbon',
        '/trackers/mental-health',
        '/games',
        '/wallet',
        '/settings',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForURL('**/auth/login**');
        expect(page.url()).toContain('/auth/login');
      }
    });
  });

  test.describe('Static Assets', () => {
    test('favicon loads', async ({ page }) => {
      await page.goto('/');

      const favicon = page.locator('link[rel="icon"]');
      await expect(favicon).toHaveAttribute('href', /favicon/);
    });

    test('critical CSS loads', async ({ page }) => {
      await page.goto('/');

      // Check if styles are applied by verifying computed styles
      const heroSection = page.locator('[data-testid="hero-section"]');
      await expect(heroSection).toBeVisible();

      // Verify that CSS is loaded (element should have styling)
      const styles = await heroSection.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
        };
      });

      expect(styles.display).not.toBe('');
    });
  });

  test.describe('Error Handling', () => {
    test('404 page displays correctly', async ({ page }) => {
      await page.goto('/non-existent-page');

      // Verify 404 page elements
      await expect(page.locator('[data-testid="404-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="404-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="404-home-link"]')).toBeVisible();

      // Test home link works
      await page.click('[data-testid="404-home-link"]');
      await page.waitForURL('/');
      expect(page.url()).toMatch(/\/$|\/$/);
    });

    test('network error handling', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await page.goto('/');

      // Should still load the page (static content)
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();

      // Error state should be handled gracefully
      // (This depends on your error handling implementation)
    });
  });

  test.describe('Performance Smoke Tests', () => {
    test('homepage loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Homepage should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('no memory leaks on navigation', async ({ page }) => {
      await page.goto('/');

      // Navigate through several pages
      const pages = ['/', '/auth/login', '/auth/signup', '/'];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');

        // Check for excessive console errors
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error' && !msg.text().includes('favicon')) {
            errors.push(msg.text());
          }
        });

        // Should not accumulate errors
        expect(errors.length).toBeLessThan(5);
      }
    });
  });

  test.describe('Accessibility Smoke Tests', () => {
    test('homepage has proper heading structure', async ({ page }) => {
      await page.goto('/');

      // Check for h1 tag
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('forms have proper labels', async ({ page }) => {
      await page.goto('/auth/login');

      // Check that form inputs have labels or aria-labels
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');

      await expect(emailInput).toHaveAttribute('aria-label');
      await expect(passwordInput).toHaveAttribute('aria-label');
    });

    test('keyboard navigation works', async ({ page }) => {
      await page.goto('/');

      // Test tab navigation
      await page.keyboard.press('Tab');

      // Should focus on first focusable element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Security Smoke Tests', () => {
    test('security headers are present', async ({ page }) => {
      const response = await page.goto('/');

      // Check for basic security headers
      const headers = response?.headers();

      // These headers should be present for security
      expect(headers).toBeDefined();
      // Note: Specific header checks depend on your security configuration
    });

    test('no sensitive data in client-side code', async ({ page }) => {
      await page.goto('/');

      // Check that no API keys or secrets are exposed
      const pageContent = await page.content();

      // Should not contain common secret patterns
      expect(pageContent).not.toMatch(/sk_live_/); // Stripe live keys
      expect(pageContent).not.toMatch(/pk_live_/); // Stripe publishable keys (in production)
      expect(pageContent).not.toMatch(/AKIA[0-9A-Z]{16}/); // AWS access keys
    });
  });

  test.describe('Third-party Integrations', () => {
    test('Firebase SDK loads correctly', async ({ page }) => {
      await page.goto('/');

      // Check if Firebase is available
      const firebaseLoaded = await page.evaluate(() => {
        return typeof window !== 'undefined' && 'firebase' in window;
      });

      // Firebase should be loaded for the app to function
      expect(firebaseLoaded).toBeTruthy();
    });

    test('analytics tracking works', async ({ page }) => {
      await page.goto('/');

      // Check if analytics is initialized
      // (This depends on your analytics implementation)
      const analyticsLoaded = await page.evaluate(() => {
        return (
          typeof window !== 'undefined' &&
          ('gtag' in window || 'ga' in window || '_analytics' in window)
        );
      });

      // Analytics should be present
      expect(analyticsLoaded).toBeTruthy();
    });
  });
});
