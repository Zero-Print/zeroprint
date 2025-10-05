import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests - WCAG 2.1 AA Compliance
 *
 * These tests ensure the application meets accessibility standards
 * and provides an inclusive experience for all users.
 */

test.describe('Accessibility Tests', () => {
  test.describe('Homepage Accessibility', () => {
    test('homepage meets WCAG 2.1 AA standards', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('homepage has proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      // Check for single h1
      const h1Elements = await page.locator('h1').count();
      expect(h1Elements).toBe(1);

      // Check heading hierarchy (no skipped levels)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels = await Promise.all(
        headings.map(async heading => {
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          return parseInt(tagName.charAt(1));
        })
      );

      // Verify no heading levels are skipped
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    test('homepage images have alt text', async ({ page }) => {
      await page.goto('/');

      const images = await page.locator('img').all();

      for (const image of images) {
        const alt = await image.getAttribute('alt');
        const ariaLabel = await image.getAttribute('aria-label');
        const ariaLabelledBy = await image.getAttribute('aria-labelledby');
        const role = await image.getAttribute('role');

        // Image should have alt text, aria-label, aria-labelledby, or be decorative
        const hasAccessibleName = alt !== null || ariaLabel !== null || ariaLabelledBy !== null;
        const isDecorative = role === 'presentation' || alt === '';

        expect(hasAccessibleName || isDecorative).toBeTruthy();
      }
    });

    test('homepage has proper color contrast', async ({ page }) => {
      await page.goto('/');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['color-contrast'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Navigation Accessibility', () => {
    test('main navigation is keyboard accessible', async ({ page }) => {
      await page.goto('/');

      // Start keyboard navigation
      await page.keyboard.press('Tab');

      // Navigate through main navigation items
      const navItems = await page
        .locator('[data-testid="navigation"] a, [data-testid="navigation"] button')
        .all();

      for (let i = 0; i < navItems.length; i++) {
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Check if focused element has visible focus indicator
        const outline = await focusedElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.outline !== 'none' || styles.boxShadow !== 'none';
        });

        expect(outline).toBeTruthy();

        if (i < navItems.length - 1) {
          await page.keyboard.press('Tab');
        }
      }
    });

    test('mobile navigation is accessible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const menuButton = page.locator('[data-testid="mobile-menu-button"]');

      // Check menu button has proper ARIA attributes
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await expect(menuButton).toHaveAttribute('aria-controls');

      // Open menu with keyboard
      await menuButton.focus();
      await page.keyboard.press('Enter');

      // Check menu is expanded
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Check menu is visible and accessible
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();

      // Test keyboard navigation within menu
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('skip links are present and functional', async ({ page }) => {
      await page.goto('/');

      // Tab to first element (should be skip link)
      await page.keyboard.press('Tab');

      const skipLink = page.locator(':focus');
      const skipLinkText = await skipLink.textContent();

      expect(skipLinkText?.toLowerCase()).toContain('skip');

      // Activate skip link
      await page.keyboard.press('Enter');

      // Verify focus moved to main content
      const focusedElement = page.locator(':focus');
      const focusedId = await focusedElement.getAttribute('id');

      expect(focusedId).toBe('main-content');
    });
  });

  test.describe('Form Accessibility', () => {
    test('login form is accessible', async ({ page }) => {
      await page.goto('/auth/login');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('login form has proper labels and descriptions', async ({ page }) => {
      await page.goto('/auth/login');

      // Check email input
      const emailInput = page.locator('[data-testid="email-input"]');
      const emailLabel =
        (await emailInput.getAttribute('aria-label')) ||
        (await emailInput.getAttribute('aria-labelledby'));
      expect(emailLabel).toBeTruthy();

      // Check password input
      const passwordInput = page.locator('[data-testid="password-input"]');
      const passwordLabel =
        (await passwordInput.getAttribute('aria-label')) ||
        (await passwordInput.getAttribute('aria-labelledby'));
      expect(passwordLabel).toBeTruthy();

      // Check form has proper structure
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });

    test('form validation errors are accessible', async ({ page }) => {
      await page.goto('/auth/login');

      // Submit empty form to trigger validation
      await page.click('[data-testid="login-button"]');

      // Check error messages are associated with inputs
      const emailError = page.locator('[data-testid="email-error"]');
      const passwordError = page.locator('[data-testid="password-error"]');

      await expect(emailError).toBeVisible();
      await expect(passwordError).toBeVisible();

      // Check errors are announced to screen readers
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');

      const emailAriaDescribedBy = await emailInput.getAttribute('aria-describedby');
      const passwordAriaDescribedBy = await passwordInput.getAttribute('aria-describedby');

      expect(emailAriaDescribedBy).toBeTruthy();
      expect(passwordAriaDescribedBy).toBeTruthy();
    });

    test('registration form is accessible', async ({ page }) => {
      await page.goto('/auth/register');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Dashboard Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    test('dashboard meets accessibility standards', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('dashboard widgets are accessible', async ({ page }) => {
      // Check carbon tracker widget
      const carbonWidget = page.locator('[data-testid="carbon-tracker-widget"]');
      await expect(carbonWidget).toHaveAttribute('role', 'region');
      await expect(carbonWidget).toHaveAttribute('aria-label');

      // Check mental health widget
      const mentalHealthWidget = page.locator('[data-testid="mental-health-widget"]');
      await expect(mentalHealthWidget).toHaveAttribute('role', 'region');
      await expect(mentalHealthWidget).toHaveAttribute('aria-label');

      // Check animal welfare widget
      const animalWelfareWidget = page.locator('[data-testid="animal-welfare-widget"]');
      await expect(animalWelfareWidget).toHaveAttribute('role', 'region');
      await expect(animalWelfareWidget).toHaveAttribute('aria-label');
    });

    test('data visualizations are accessible', async ({ page }) => {
      // Check charts have proper ARIA labels
      const charts = await page.locator('[role="img"], canvas, svg').all();

      for (const chart of charts) {
        const ariaLabel = await chart.getAttribute('aria-label');
        const ariaLabelledBy = await chart.getAttribute('aria-labelledby');
        const title = await chart.getAttribute('title');

        // Chart should have accessible name
        expect(ariaLabel || ariaLabelledBy || title).toBeTruthy();
      }
    });
  });

  test.describe('Interactive Elements Accessibility', () => {
    test('buttons have proper ARIA attributes', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        // Button should have accessible name
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        const textContent = await button.textContent();

        const hasAccessibleName =
          ariaLabel || ariaLabelledBy || (textContent && textContent.trim());
        expect(hasAccessibleName).toBeTruthy();

        // Button should be focusable
        const tabIndex = await button.getAttribute('tabindex');
        expect(tabIndex !== '-1').toBeTruthy();
      }
    });

    test('links have proper context', async ({ page }) => {
      await page.goto('/');

      const links = await page.locator('a').all();

      for (const link of links) {
        const href = await link.getAttribute('href');
        const ariaLabel = await link.getAttribute('aria-label');
        const textContent = await link.textContent();

        // Link should have meaningful text or aria-label
        const hasAccessibleName = ariaLabel || (textContent && textContent.trim());
        expect(hasAccessibleName).toBeTruthy();

        // External links should indicate they open in new window
        const target = await link.getAttribute('target');
        if (target === '_blank') {
          const ariaDescribedBy = await link.getAttribute('aria-describedby');
          const title = await link.getAttribute('title');
          const hasExternalIndicator =
            ariaDescribedBy || title || (textContent && textContent.includes('external'));
          expect(hasExternalIndicator).toBeTruthy();
        }
      }
    });

    test('focus management works correctly', async ({ page }) => {
      await page.goto('/');

      // Test modal focus management (if modals exist)
      const modalTrigger = page.locator('[data-testid="modal-trigger"]');
      if ((await modalTrigger.count()) > 0) {
        await modalTrigger.click();

        // Focus should move to modal
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Focus should be trapped in modal
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const isInModal = await focusedElement.evaluate(el => {
          const modal = document.querySelector('[role="dialog"]');
          return modal?.contains(el) || false;
        });

        expect(isInModal).toBeTruthy();
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('page has proper landmarks', async ({ page }) => {
      await page.goto('/');

      // Check for main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();

      // Check for navigation landmark
      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav).toBeVisible();

      // Check for banner landmark (header)
      const banner = page.locator('header, [role="banner"]');
      await expect(banner).toBeVisible();

      // Check for contentinfo landmark (footer)
      const footer = page.locator('footer, [role="contentinfo"]');
      await expect(footer).toBeVisible();
    });

    test('dynamic content updates are announced', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for live regions
      const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').all();

      // Should have at least one live region for dynamic updates
      expect(liveRegions.length).toBeGreaterThan(0);

      // Check live region attributes
      for (const region of liveRegions) {
        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');

        const hasLiveAttribute = ariaLive || role === 'status' || role === 'alert';
        expect(hasLiveAttribute).toBeTruthy();
      }
    });

    test('loading states are accessible', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for loading indicators
      const loadingIndicators = await page
        .locator('[aria-busy="true"], [role="progressbar"]')
        .all();

      for (const indicator of loadingIndicators) {
        const ariaLabel = await indicator.getAttribute('aria-label');
        const ariaLabelledBy = await indicator.getAttribute('aria-labelledby');

        // Loading indicator should have accessible name
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('all interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto('/');

      // Get all interactive elements
      const interactiveElements = await page
        .locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        .all();

      for (const element of interactiveElements) {
        // Element should be focusable
        await element.focus();
        const isFocused = await element.evaluate(el => document.activeElement === el);
        expect(isFocused).toBeTruthy();

        // Element should have visible focus indicator
        const outline = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.outline !== 'none' || styles.boxShadow !== 'none';
        });

        expect(outline).toBeTruthy();
      }
    });

    test('tab order is logical', async ({ page }) => {
      await page.goto('/');

      const tabOrder: string[] = [];

      // Navigate through page with Tab key
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        const elementInfo = await focusedElement.evaluate(el => {
          return {
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            textContent: el.textContent?.trim().substring(0, 20),
          };
        });

        tabOrder.push(`${elementInfo.tagName}#${elementInfo.id}.${elementInfo.className}`);
      }

      // Tab order should be consistent and logical
      expect(tabOrder.length).toBeGreaterThan(0);

      // Should not have duplicate focus on same element consecutively
      for (let i = 1; i < tabOrder.length; i++) {
        expect(tabOrder[i]).not.toBe(tabOrder[i - 1]);
      }
    });

    test('escape key closes modals and dropdowns', async ({ page }) => {
      await page.goto('/');

      // Test modal escape (if modals exist)
      const modalTrigger = page.locator('[data-testid="modal-trigger"]');
      if ((await modalTrigger.count()) > 0) {
        await modalTrigger.click();

        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }

      // Test dropdown escape (if dropdowns exist)
      const dropdownTrigger = page.locator('[data-testid="dropdown-trigger"]');
      if ((await dropdownTrigger.count()) > 0) {
        await dropdownTrigger.click();

        const dropdown = page.locator('[role="menu"], [role="listbox"]');
        await expect(dropdown).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(dropdown).not.toBeVisible();
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('text has sufficient color contrast', async ({ page }) => {
      await page.goto('/');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['color-contrast'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('information is not conveyed by color alone', async ({ page }) => {
      await page.goto('/');

      // Check for elements that might rely on color alone
      const colorOnlyElements = await page
        .locator('.text-red, .text-green, .bg-red, .bg-green')
        .all();

      for (const element of colorOnlyElements) {
        const textContent = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        const title = await element.getAttribute('title');

        // Element should have text or other indicators beyond color
        const hasNonColorIndicator = textContent || ariaLabel || title;
        expect(hasNonColorIndicator).toBeTruthy();
      }
    });
  });
});
