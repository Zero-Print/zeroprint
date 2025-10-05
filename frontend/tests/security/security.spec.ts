import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

/**
 * Security Tests - Frontend Security Validation
 *
 * These tests validate security measures including authentication,
 * authorization, data protection, and common web vulnerabilities.
 */

test.describe('Security Tests', () => {
  test.describe('Authentication Security', () => {
    test('login form prevents credential stuffing', async ({ page }) => {
      await page.goto('/auth/login');

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');

        // Wait for response
        await page.waitForTimeout(1000);
      }

      // Check for rate limiting or CAPTCHA
      const rateLimitMessage = page.locator('[data-testid="rate-limit-message"]');
      const captcha = page.locator('[data-testid="captcha"]');

      const hasProtection = (await rateLimitMessage.isVisible()) || (await captcha.isVisible());
      expect(hasProtection).toBeTruthy();
    });

    test('login form validates input properly', async ({ page }) => {
      await page.goto('/auth/login');

      // Test SQL injection attempts
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "admin'--",
        "' UNION SELECT * FROM users --",
      ];

      for (const payload of sqlInjectionPayloads) {
        await page.fill('[data-testid="email-input"]', payload);
        await page.fill('[data-testid="password-input"]', payload);
        await page.click('[data-testid="login-button"]');

        // Should show validation error, not process malicious input
        const errorMessage = page.locator('[data-testid="error-message"]');
        await expect(errorMessage).toBeVisible();

        // Clear inputs for next test
        await page.fill('[data-testid="email-input"]', '');
        await page.fill('[data-testid="password-input"]', '');
      }
    });

    test('password field is properly secured', async ({ page }) => {
      await page.goto('/auth/login');

      const passwordInput = page.locator('[data-testid="password-input"]');

      // Password field should have type="password"
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');

      // Password field should have autocomplete="current-password"
      const autocomplete = await passwordInput.getAttribute('autocomplete');
      expect(autocomplete).toBe('current-password');

      // Password should not be visible in DOM
      await passwordInput.fill('secretpassword');
      const value = await passwordInput.inputValue();
      expect(value).toBe('secretpassword');

      // But should not be visible as text
      const textContent = await passwordInput.textContent();
      expect(textContent).not.toContain('secretpassword');
    });

    test('session management is secure', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Check for secure session cookies
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(
        cookie => cookie.name.includes('session') || cookie.name.includes('token')
      );

      if (sessionCookie) {
        // Session cookie should be HttpOnly and Secure
        expect(sessionCookie.httpOnly).toBeTruthy();
        expect(sessionCookie.secure).toBeTruthy();
        expect(sessionCookie.sameSite).toBe('Strict');
      }

      // Test session timeout
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');

      // Simulate session expiry (if logout endpoint exists)
      const logoutButton = page.locator('[data-testid="logout-button"]');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL('/auth/login');

        // Try to access protected route
        await page.goto('/dashboard');
        await expect(page).toHaveURL('/auth/login');
      }
    });

    test('registration form prevents common attacks', async ({ page }) => {
      await page.goto('/auth/register');

      // Test XSS prevention
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
      ];

      for (const payload of xssPayloads) {
        await page.fill('[data-testid="name-input"]', payload);
        await page.fill('[data-testid="email-input"]', `test${Date.now()}@example.com`);
        await page.fill('[data-testid="password-input"]', 'Password123!');
        await page.click('[data-testid="register-button"]');

        // Check that script is not executed
        const alertDialog = page.locator('text="xss"');
        await expect(alertDialog).not.toBeVisible();

        // Clear form
        await page.reload();
      }
    });
  });

  test.describe('Authorization Security', () => {
    test('protected routes require authentication', async ({ page }) => {
      const protectedRoutes = [
        '/dashboard',
        '/profile',
        '/settings',
        '/trackers',
        '/games',
        '/wallet',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);

        // Should redirect to login
        await expect(page).toHaveURL('/auth/login');
      }
    });

    test('user cannot access other users data', async ({ page, context }) => {
      // Login as first user
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'user1@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Try to access another user's data by manipulating URLs
      const userSpecificRoutes = ['/profile/user2', '/dashboard/user2', '/api/users/user2/data'];

      for (const route of userSpecificRoutes) {
        const response = await page.goto(route);

        // Should return 403 Forbidden or redirect
        if (response) {
          expect([403, 404, 302]).toContain(response.status());
        } else {
          // If no response, check if redirected to unauthorized page
          const currentUrl = page.url();
          expect(currentUrl).not.toContain('user2');
        }
      }
    });

    test('admin routes are properly protected', async ({ page }) => {
      // Try to access admin routes without admin privileges
      const adminRoutes = ['/admin', '/admin/users', '/admin/settings', '/admin/analytics'];

      // First try without authentication
      for (const route of adminRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL('/auth/login');
      }

      // Then try with regular user authentication
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      for (const route of adminRoutes) {
        const response = await page.goto(route);

        // Should return 403 or redirect to unauthorized page
        if (response) {
          expect([403, 404]).toContain(response.status());
        }
      }
    });
  });

  test.describe('Data Protection', () => {
    test('sensitive data is not exposed in client-side code', async ({ page }) => {
      await page.goto('/');

      // Check for exposed sensitive data in page source
      const pageContent = await page.content();

      const sensitivePatterns = [
        /api[_-]?key/i,
        /secret[_-]?key/i,
        /private[_-]?key/i,
        /password/i,
        /token.*[a-zA-Z0-9]{20,}/,
        /sk_[a-zA-Z0-9]+/, // Stripe secret keys
        /pk_[a-zA-Z0-9]+.*sk_[a-zA-Z0-9]+/, // Exposed secret with public key
      ];

      for (const pattern of sensitivePatterns) {
        expect(pageContent).not.toMatch(pattern);
      }
    });

    test('forms implement CSRF protection', async ({ page }) => {
      await page.goto('/auth/login');

      // Check for CSRF token in forms
      const forms = await page.locator('form').all();

      for (const form of forms) {
        const csrfToken = form.locator('input[name*="csrf"], input[name*="token"]');
        const hasCSRFProtection = (await csrfToken.count()) > 0;

        // Forms should have CSRF protection or use other security measures
        if (!hasCSRFProtection) {
          // Check for other security headers or meta tags
          const metaCSRF = page.locator('meta[name="csrf-token"]');
          const hasMetaCSRF = (await metaCSRF.count()) > 0;
          expect(hasMetaCSRF).toBeTruthy();
        }
      }
    });

    test('file uploads are secure', async ({ page }) => {
      // Navigate to a page with file upload (if exists)
      await page.goto('/profile');

      const fileInput = page.locator('input[type="file"]');

      if ((await fileInput.count()) > 0) {
        // Check file type restrictions
        const accept = await fileInput.getAttribute('accept');
        expect(accept).toBeTruthy();

        // Try to upload potentially dangerous file types
        const dangerousFiles = ['test.exe', 'test.php', 'test.js', 'test.html'];

        for (const filename of dangerousFiles) {
          // Create a temporary file for testing
          const fileContent = 'test content';

          try {
            await fileInput.setInputFiles({
              name: filename,
              mimeType: 'application/octet-stream',
              buffer: Buffer.from(fileContent),
            });

            const uploadButton = page.locator('[data-testid="upload-button"]');
            if (await uploadButton.isVisible()) {
              await uploadButton.click();

              // Should show error for dangerous file types
              const errorMessage = page.locator('[data-testid="upload-error"]');
              await expect(errorMessage).toBeVisible();
            }
          } catch (error) {
            // File input rejection is also acceptable
            expect(error).toBeTruthy();
          }
        }
      }
    });

    test('personal data is properly handled', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Check that personal data is not logged to console
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        consoleLogs.push(msg.text());
      });

      // Navigate through app to trigger potential logging
      await page.goto('/profile');
      await page.goto('/settings');

      // Check console logs for personal data
      const personalDataPatterns = [
        /email.*@.*\./,
        /password/i,
        /ssn|social.*security/i,
        /credit.*card|card.*number/i,
      ];

      for (const log of consoleLogs) {
        for (const pattern of personalDataPatterns) {
          expect(log).not.toMatch(pattern);
        }
      }
    });
  });

  test.describe('Content Security Policy', () => {
    test('CSP headers are properly configured', async ({ page }) => {
      const response = await page.goto('/');

      if (response) {
        const cspHeader = response.headers()['content-security-policy'];

        if (cspHeader) {
          // Check for important CSP directives
          expect(cspHeader).toContain('default-src');
          expect(cspHeader).toContain('script-src');
          expect(cspHeader).toContain('style-src');
          expect(cspHeader).toContain('img-src');

          // Should not allow unsafe-inline for scripts
          expect(cspHeader).not.toContain("script-src.*'unsafe-inline'");

          // Should not allow unsafe-eval
          expect(cspHeader).not.toContain("'unsafe-eval'");
        }
      }
    });

    test('inline scripts are not executed without nonce', async ({ page }) => {
      await page.goto('/');

      // Try to inject inline script
      await page.evaluate(() => {
        const script = document.createElement('script');
        script.innerHTML = 'window.xssTest = true;';
        document.head.appendChild(script);
      });

      // Check if script was executed
      const xssTestValue = await page.evaluate(() => (window as any).xssTest);
      expect(xssTestValue).toBeUndefined();
    });
  });

  test.describe('Input Validation', () => {
    test('forms validate input length', async ({ page }) => {
      await page.goto('/auth/register');

      // Test extremely long input
      const longString = 'a'.repeat(10000);

      await page.fill('[data-testid="name-input"]', longString);
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="register-button"]');

      // Should show validation error
      const errorMessage = page.locator('[data-testid="name-error"]');
      await expect(errorMessage).toBeVisible();
    });

    test('email validation is proper', async ({ page }) => {
      await page.goto('/auth/login');

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        '<script>alert("xss")</script>@example.com',
      ];

      for (const email of invalidEmails) {
        await page.fill('[data-testid="email-input"]', email);
        await page.fill('[data-testid="password-input"]', 'password123');
        await page.click('[data-testid="login-button"]');

        // Should show validation error
        const errorMessage = page.locator('[data-testid="email-error"]');
        await expect(errorMessage).toBeVisible();

        // Clear input
        await page.fill('[data-testid="email-input"]', '');
      }
    });

    test('password requirements are enforced', async ({ page }) => {
      await page.goto('/auth/register');

      const weakPasswords = ['123456', 'password', 'abc', '11111111', 'qwerty'];

      for (const password of weakPasswords) {
        await page.fill('[data-testid="name-input"]', 'Test User');
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', password);
        await page.click('[data-testid="register-button"]');

        // Should show password strength error
        const errorMessage = page.locator('[data-testid="password-error"]');
        await expect(errorMessage).toBeVisible();

        // Clear form
        await page.reload();
      }
    });
  });

  test.describe('API Security', () => {
    test('API endpoints require proper authentication', async ({ page }) => {
      // Test API endpoints without authentication
      const apiEndpoints = ['/api/user/profile', '/api/trackers', '/api/games', '/api/wallet'];

      for (const endpoint of apiEndpoints) {
        const response = await page.request.get(endpoint);

        // Should return 401 Unauthorized
        expect(response.status()).toBe(401);
      }
    });

    test('API responses do not expose sensitive information', async ({ page }) => {
      // Login first to get authenticated session
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Make API requests and check responses
      const apiEndpoints = ['/api/user/profile', '/api/trackers'];

      for (const endpoint of apiEndpoints) {
        try {
          const response = await page.request.get(endpoint);

          if (response.ok()) {
            const responseBody = await response.text();

            // Check for exposed sensitive data
            const sensitivePatterns = [
              /password/i,
              /secret/i,
              /private.*key/i,
              /api.*key/i,
              /token.*[a-zA-Z0-9]{20,}/,
            ];

            for (const pattern of sensitivePatterns) {
              expect(responseBody).not.toMatch(pattern);
            }
          }
        } catch (error) {
          // API might not exist in test environment
          console.log(`API endpoint ${endpoint} not available in test environment`);
        }
      }
    });

    test('API rate limiting is implemented', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');

      // Make rapid API requests
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(page.request.get('/api/user/profile'));
      }

      const responses = await Promise.all(promises);

      // Check if any requests were rate limited
      const rateLimitedResponses = responses.filter(
        response => response.status() === 429 || response.status() === 503
      );

      // Should have some rate limiting after many rapid requests
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Third-Party Security', () => {
    test('external links are secure', async ({ page }) => {
      await page.goto('/');

      const externalLinks = await page.locator('a[href^="http"]:not([href*="localhost"])').all();

      for (const link of externalLinks) {
        const href = await link.getAttribute('href');
        const target = await link.getAttribute('target');
        const rel = await link.getAttribute('rel');

        if (target === '_blank') {
          // External links opening in new tab should have rel="noopener noreferrer"
          expect(rel).toContain('noopener');
          expect(rel).toContain('noreferrer');
        }
      }
    });

    test('iframe security is properly configured', async ({ page }) => {
      await page.goto('/');

      const iframes = await page.locator('iframe').all();

      for (const iframe of iframes) {
        const sandbox = await iframe.getAttribute('sandbox');
        const src = await iframe.getAttribute('src');

        // iframes should have sandbox attribute for security
        if (src && !src.startsWith('data:')) {
          expect(sandbox).toBeTruthy();
        }
      }
    });
  });

  test.describe('Browser Security Features', () => {
    test('security headers are present', async ({ page }) => {
      const response = await page.goto('/');

      if (response) {
        const headers = response.headers();

        // Check for important security headers
        expect(headers['x-frame-options'] || headers['content-security-policy']).toBeTruthy();
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['referrer-policy']).toBeTruthy();

        // Check for HSTS in production
        if (page.url().startsWith('https://')) {
          expect(headers['strict-transport-security']).toBeTruthy();
        }
      }
    });

    test('cookies are secure', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      const cookies = await page.context().cookies();

      for (const cookie of cookies) {
        // Session cookies should be secure
        if (cookie.name.includes('session') || cookie.name.includes('token')) {
          expect(cookie.httpOnly).toBeTruthy();
          expect(cookie.sameSite).toBe('Strict');

          // Should be secure in HTTPS environment
          if (page.url().startsWith('https://')) {
            expect(cookie.secure).toBeTruthy();
          }
        }
      }
    });
  });
});
