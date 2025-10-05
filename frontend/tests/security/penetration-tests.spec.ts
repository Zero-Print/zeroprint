import { test, expect } from '@playwright/test';
import { createHash, randomBytes } from 'crypto';

test.describe('Penetration Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Set up penetration testing environment
    await page.goto('/');
  });

  test.describe('Authentication Bypass Attempts', () => {
    test('should prevent authentication bypass via parameter pollution', async ({ page }) => {
      await page.goto('/login');

      // Test HTTP parameter pollution
      const pollutionAttempts = [
        { email: ['user@example.com', 'admin@zeroprint.com'], password: 'password123' },
        { email: 'user@example.com', password: ['password123', 'admin_password'] },
        { email: 'user@example.com', password: 'password123', role: 'admin' },
        { email: 'user@example.com', password: 'password123', user_id: '1' },
      ];

      for (const attempt of pollutionAttempts) {
        const response = await page.request.post('/api/auth/login', {
          data: attempt,
        });

        expect(response.status()).not.toBe(200);

        if (response.status() === 400) {
          const errorData = await response.json();
          expect(errorData.message).toContain('Invalid request');
        }
      }
    });

    test('should prevent session fixation attacks', async ({ page }) => {
      // Get initial session ID
      await page.goto('/');
      const initialCookies = await page.context().cookies();
      const initialSessionId = initialCookies.find(c => c.name.includes('session'))?.value;

      // Attempt to fix session ID
      await page.context().addCookies([
        {
          name: 'session_id',
          value: 'fixed_session_12345',
          domain: 'localhost',
          path: '/',
        },
      ]);

      // Login with fixed session
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Check that session ID changed after login
      const postLoginCookies = await page.context().cookies();
      const postLoginSessionId = postLoginCookies.find(c => c.name.includes('session'))?.value;

      expect(postLoginSessionId).not.toBe('fixed_session_12345');
      expect(postLoginSessionId).not.toBe(initialSessionId);
    });

    test('should prevent JWT token manipulation', async ({ page }) => {
      // Login to get valid JWT
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Extract JWT from storage or cookies
      const token = await page.evaluate(() => {
        return (
          localStorage.getItem('auth_token') ||
          document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1]
        );
      });

      if (token) {
        // Test token manipulation attempts
        const manipulatedTokens = [
          token.replace(/\./g, ''), // Remove dots
          token + 'extra_data', // Append data
          token.slice(0, -10) + 'manipulated', // Replace signature
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiYWRtaW4ifQ.invalid_signature', // Admin role injection
          'none.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiYWRtaW4ifQ.', // None algorithm attack
        ];

        for (const manipulatedToken of manipulatedTokens) {
          // Set manipulated token
          await page.evaluate(token => {
            localStorage.setItem('auth_token', token);
          }, manipulatedToken);

          // Try to access protected resource
          const response = await page.request.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${manipulatedToken}` },
          });

          expect(response.status()).toBe(401);
        }
      }
    });

    test('should prevent privilege escalation', async ({ page }) => {
      // Login as regular user
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Attempt privilege escalation via direct API calls
      const escalationAttempts = [
        { endpoint: '/api/admin/users', method: 'GET' },
        { endpoint: '/api/admin/system/config', method: 'GET' },
        { endpoint: '/api/user/role', method: 'PUT', data: { role: 'admin' } },
        { endpoint: '/api/user/permissions', method: 'PUT', data: { permissions: ['admin'] } },
        {
          endpoint: '/api/organization/create',
          method: 'POST',
          data: { name: 'Evil Org', owner: 'user@example.com' },
        },
      ];

      for (const attempt of escalationAttempts) {
        const response = await page.request.fetch(attempt.endpoint, {
          method: attempt.method,
          data: attempt.data,
        });

        expect(response.status()).toBeOneOf([401, 403, 404]);
      }

      // Attempt to access admin pages directly
      const adminPages = [
        '/admin/dashboard',
        '/admin/users',
        '/admin/system',
        '/admin/reports',
        '/admin/settings',
      ];

      for (const adminPage of adminPages) {
        await page.goto(adminPage);
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
      }
    });

    test('should prevent account enumeration', async ({ page }) => {
      await page.goto('/login');

      // Test with valid and invalid emails
      const testEmails = [
        'existing@example.com',
        'nonexistent@example.com',
        'admin@zeroprint.com',
        'invalid-email-format',
      ];

      const responses = [];

      for (const email of testEmails) {
        await page.fill('[data-testid="email-input"]', email);
        await page.fill('[data-testid="password-input"]', 'wrongpassword');

        const startTime = Date.now();
        await page.click('[data-testid="login-button"]');

        // Wait for response
        await page.waitForSelector(
          '[data-testid="invalid-credentials"], [data-testid="login-success"]',
          { timeout: 5000 }
        );
        const endTime = Date.now();

        const errorMessage = await page
          .locator('[data-testid="invalid-credentials"]')
          .textContent();

        responses.push({
          email,
          responseTime: endTime - startTime,
          message: errorMessage,
        });

        // Clear form
        await page.fill('[data-testid="email-input"]', '');
        await page.fill('[data-testid="password-input"]', '');
      }

      // Check that all responses are similar (preventing enumeration)
      const responseTimes = responses.map(r => r.responseTime);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      // Response times should be within reasonable variance
      for (const responseTime of responseTimes) {
        expect(Math.abs(responseTime - avgResponseTime)).toBeLessThan(1000);
      }

      // Error messages should be generic
      const uniqueMessages = [...new Set(responses.map(r => r.message))];
      expect(uniqueMessages.length).toBe(1);
      expect(uniqueMessages[0]).toContain('Invalid credentials');
    });
  });

  test.describe('Injection Attack Prevention', () => {
    test('should prevent NoSQL injection attacks', async ({ page }) => {
      await page.goto('/login');

      // NoSQL injection payloads
      const noSQLPayloads = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$regex": ".*"}',
        '{"$where": "this.password.length > 0"}',
        '{"$or": [{"password": {"$ne": null}}, {"password": {"$exists": true}}]}',
        '{"password": {"$regex": "^.*"}}',
        '{"$expr": {"$gt": [{"$strLenCP": "$password"}, 0]}}',
      ];

      for (const payload of noSQLPayloads) {
        await page.fill('[data-testid="email-input"]', payload);
        await page.fill('[data-testid="password-input"]', payload);
        await page.click('[data-testid="login-button"]');

        // Should not bypass authentication
        await expect(page.locator('[data-testid="invalid-credentials"]')).toBeVisible();

        // Clear form
        await page.fill('[data-testid="email-input"]', '');
        await page.fill('[data-testid="password-input"]', '');
      }
    });

    test('should prevent LDAP injection attacks', async ({ page }) => {
      await page.goto('/login');

      // LDAP injection payloads
      const ldapPayloads = [
        '*)(uid=*))(|(uid=*',
        '*)(|(password=*))',
        '*)(&(password=*))',
        '*))%00',
        '*()|%26',
        '*)(objectClass=*',
      ];

      for (const payload of ldapPayloads) {
        await page.fill('[data-testid="email-input"]', payload);
        await page.fill('[data-testid="password-input"]', 'password123');
        await page.click('[data-testid="login-button"]');

        await expect(page.locator('[data-testid="invalid-credentials"]')).toBeVisible();

        await page.fill('[data-testid="email-input"]', '');
      }
    });

    test('should prevent command injection attacks', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Test command injection in file operations
      const commandPayloads = [
        '; ls -la',
        '| cat /etc/passwd',
        '&& whoami',
        '`id`',
        '$(uname -a)',
        '; rm -rf /',
        '| nc -l 4444',
        '& ping google.com',
      ];

      for (const payload of commandPayloads) {
        // Test in file upload filename
        const response1 = await page.request.post('/api/files/upload', {
          multipart: {
            file: {
              name: `malicious${payload}.txt`,
              mimeType: 'text/plain',
              buffer: Buffer.from('test content'),
            },
          },
        });

        expect(response1.status()).not.toBe(200);

        // Test in search functionality
        const response2 = await page.request.get(`/api/search?q=${encodeURIComponent(payload)}`);
        expect(response2.status()).toBe(200);

        const searchData = await response2.json();
        expect(searchData.results).toBeDefined();
      }
    });

    test('should prevent template injection attacks', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Template injection payloads
      const templatePayloads = [
        '{{7*7}}',
        '${7*7}',
        '#{7*7}',
        '{{config}}',
        '{{self}}',
        '{{request}}',
        '${T(java.lang.System).getProperty("user.dir")}',
        '{{"".__class__.__mro__[2].__subclasses__()[40]("/etc/passwd").read()}}',
        '{{config.items()}}',
      ];

      await page.goto('/profile/edit');

      for (const payload of templatePayloads) {
        await page.fill('[data-testid="bio-input"]', payload);
        await page.click('[data-testid="save-profile"]');

        await page.goto('/profile');

        // Check that template is not executed
        const bioContent = await page.locator('[data-testid="user-bio"]').textContent();
        expect(bioContent).not.toBe('49'); // 7*7 result
        expect(bioContent).not.toContain('root:'); // /etc/passwd content
        expect(bioContent).not.toContain('SECRET_KEY'); // Config exposure

        await page.goto('/profile/edit');
      }
    });

    test('should prevent XPath injection attacks', async ({ page }) => {
      await page.goto('/login');

      // XPath injection payloads
      const xpathPayloads = [
        "' or '1'='1",
        "' or 1=1 or ''='",
        "x' or name()='username' or 'x'='y",
        "' or position()=1 or ''='",
        "' or count(parent::*)=count(parent::*) or ''='",
        "'] | //user/* | //password/* | //*['",
      ];

      for (const payload of xpathPayloads) {
        await page.fill('[data-testid="email-input"]', payload);
        await page.fill('[data-testid="password-input"]', 'password123');
        await page.click('[data-testid="login-button"]');

        await expect(page.locator('[data-testid="invalid-credentials"]')).toBeVisible();

        await page.fill('[data-testid="email-input"]', '');
      }
    });
  });

  test.describe('Business Logic Vulnerabilities', () => {
    test('should prevent race condition attacks', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Test race condition in wallet operations
      await page.goto('/wallet');

      // Get initial balance
      const initialBalance = await page.locator('[data-testid="wallet-balance"]').textContent();
      const balance = parseFloat(initialBalance?.replace(/[^\d.]/g, '') || '0');

      // Attempt concurrent withdrawals
      const withdrawalAmount = Math.min(balance / 2, 50);
      const withdrawalPromises = [];

      for (let i = 0; i < 5; i++) {
        withdrawalPromises.push(
          page.request.post('/api/wallet/withdraw', {
            data: { amount: withdrawalAmount },
          })
        );
      }

      const responses = await Promise.all(withdrawalPromises);
      const successfulWithdrawals = responses.filter(r => r.status() === 200);

      // Should only allow one successful withdrawal
      expect(successfulWithdrawals.length).toBeLessThanOrEqual(1);

      // Check final balance
      await page.reload();
      const finalBalance = await page.locator('[data-testid="wallet-balance"]').textContent();
      const finalAmount = parseFloat(finalBalance?.replace(/[^\d.]/g, '') || '0');

      expect(finalAmount).toBeGreaterThanOrEqual(0);
      expect(finalAmount).toBeLessThanOrEqual(balance);
    });

    test('should prevent price manipulation attacks', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Test price manipulation in payment flow
      await page.goto('/subscription/premium');

      // Get legitimate price
      const displayedPrice = await page.locator('[data-testid="subscription-price"]').textContent();
      const price = parseFloat(displayedPrice?.replace(/[^\d.]/g, '') || '0');

      // Attempt to manipulate price in payment request
      const manipulationAttempts = [
        { amount: 0.01 },
        { amount: -price },
        { amount: price * 0.1 },
        { amount: 1, currency: 'INR' }, // Different currency
        { amount: price, discount: price * 0.9 }, // Unauthorized discount
      ];

      for (const attempt of manipulationAttempts) {
        const response = await page.request.post('/api/payments/create-order', {
          data: {
            subscription_type: 'premium',
            ...attempt,
          },
        });

        if (response.status() === 200) {
          const orderData = await response.json();
          expect(orderData.amount).toBe(price * 100); // Amount in paise
        } else {
          expect(response.status()).toBeOneOf([400, 403]);
        }
      }
    });

    test('should prevent workflow bypass attacks', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Test bypassing email verification
      const response1 = await page.request.post('/api/user/verify-email', {
        data: {
          token: 'fake-verification-token',
          email: 'user@example.com',
        },
      });
      expect(response1.status()).toBe(400);

      // Test bypassing payment verification
      const response2 = await page.request.post('/api/subscription/activate', {
        data: {
          subscription_type: 'premium',
          payment_id: 'fake-payment-id',
        },
      });
      expect(response2.status()).toBeOneOf([400, 403]);

      // Test bypassing approval workflow
      const response3 = await page.request.post('/api/organization/approve', {
        data: {
          organization_id: 'some-org-id',
          status: 'approved',
        },
      });
      expect(response3.status()).toBeOneOf([401, 403]);
    });

    test('should prevent time-based attacks', async ({ page }) => {
      await page.goto('/login');

      // Test timing attack on password verification
      const timingTests = [
        { email: 'user@example.com', password: 'a' },
        { email: 'user@example.com', password: 'password123' }, // Correct password
        { email: 'user@example.com', password: 'wrongpassword' },
        { email: 'nonexistent@example.com', password: 'password123' },
      ];

      const timings = [];

      for (const test of timingTests) {
        const startTime = Date.now();

        await page.fill('[data-testid="email-input"]', test.email);
        await page.fill('[data-testid="password-input"]', test.password);
        await page.click('[data-testid="login-button"]');

        await page.waitForSelector(
          '[data-testid="invalid-credentials"], [data-testid="dashboard"]',
          { timeout: 10000 }
        );

        const endTime = Date.now();
        timings.push(endTime - startTime);

        // Reset form
        await page.goto('/login');
      }

      // Check that timing differences are not significant
      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;

      for (const timing of timings) {
        const difference = Math.abs(timing - avgTiming);
        expect(difference).toBeLessThan(500); // Less than 500ms difference
      }
    });

    test('should prevent resource exhaustion attacks', async ({ page }) => {
      // Test file upload size limits
      const largeFileResponse = await page.request.post('/api/files/upload', {
        multipart: {
          file: {
            name: 'large-file.txt',
            mimeType: 'text/plain',
            buffer: Buffer.alloc(50 * 1024 * 1024), // 50MB
          },
        },
      });

      expect(largeFileResponse.status()).toBe(413); // Payload Too Large

      // Test request rate limiting
      const rapidRequests = [];
      for (let i = 0; i < 100; i++) {
        rapidRequests.push(page.request.get('/api/health'));
      }

      const responses = await Promise.all(rapidRequests);
      const rateLimitedResponses = responses.filter(r => r.status() === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Test memory exhaustion via large JSON payload
      const largeJsonResponse = await page.request.post('/api/data/import', {
        data: {
          records: Array(10000).fill({
            name: 'A'.repeat(1000),
            description: 'B'.repeat(1000),
            data: 'C'.repeat(1000),
          }),
        },
      });

      expect(largeJsonResponse.status()).toBeOneOf([400, 413, 429]);
    });
  });

  test.describe('Session and State Management Attacks', () => {
    test('should prevent session hijacking', async ({ page }) => {
      // Login and get session
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session'));

      // Create new context with stolen session
      const newContext = await page.context().browser()?.newContext();
      if (newContext && sessionCookie) {
        await newContext.addCookies([sessionCookie]);
        const newPage = await newContext.newPage();

        // Try to access protected resource
        await newPage.goto('/dashboard');

        // Should require additional verification or reject
        const isAccessible = await newPage.locator('[data-testid="dashboard"]').isVisible();

        if (isAccessible) {
          // If accessible, should have security warnings
          await expect(newPage.locator('[data-testid="security-warning"]')).toBeVisible();
        } else {
          // Should be redirected to login
          await expect(newPage.locator('[data-testid="login-form"]')).toBeVisible();
        }

        await newContext.close();
      }
    });

    test('should prevent CSRF attacks with state-changing operations', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Get CSRF token
      await page.goto('/profile/edit');
      const csrfToken = await page.locator('[name="csrf_token"]').getAttribute('value');

      // Test state-changing operations without CSRF token
      const stateChangingOperations = [
        { endpoint: '/api/user/update-profile', method: 'PUT', data: { name: 'Hacked Name' } },
        {
          endpoint: '/api/user/change-password',
          method: 'PUT',
          data: { new_password: 'hacked123' },
        },
        {
          endpoint: '/api/wallet/transfer',
          method: 'POST',
          data: { to: 'hacker@evil.com', amount: 100 },
        },
        { endpoint: '/api/user/delete-account', method: 'DELETE', data: {} },
      ];

      for (const operation of stateChangingOperations) {
        // Without CSRF token
        const response1 = await page.request.fetch(operation.endpoint, {
          method: operation.method,
          data: operation.data,
        });
        expect(response1.status()).toBe(403);

        // With invalid CSRF token
        const response2 = await page.request.fetch(operation.endpoint, {
          method: operation.method,
          data: { ...operation.data, csrf_token: 'invalid-token' },
        });
        expect(response2.status()).toBe(403);

        // With valid CSRF token should work (for non-destructive operations)
        if (!operation.endpoint.includes('delete')) {
          const response3 = await page.request.fetch(operation.endpoint, {
            method: operation.method,
            data: { ...operation.data, csrf_token: csrfToken },
          });
          expect(response3.status()).toBeOneOf([200, 400]); // 400 for validation errors
        }
      }
    });

    test('should prevent clickjacking attacks', async ({ page }) => {
      // Check X-Frame-Options header
      const response = await page.goto('/');
      const headers = response?.headers();

      expect(headers?.['x-frame-options']).toBe('DENY');

      // Test CSP frame-ancestors directive
      const csp = headers?.['content-security-policy'];
      expect(csp).toContain("frame-ancestors 'none'");

      // Test that sensitive pages cannot be framed
      const sensitivePages = [
        '/login',
        '/register',
        '/profile/edit',
        '/wallet',
        '/settings/security',
      ];

      for (const page_url of sensitivePages) {
        const pageResponse = await page.goto(page_url);
        const pageHeaders = pageResponse?.headers();

        expect(pageHeaders?.['x-frame-options']).toBe('DENY');
      }
    });

    test('should prevent state pollution attacks', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Test prototype pollution via JSON input
      const pollutionPayloads = [
        { __proto__: { isAdmin: true } },
        { constructor: { prototype: { isAdmin: true } } },
        { '__proto__.isAdmin': true },
        { 'prototype.isAdmin': true },
      ];

      for (const payload of pollutionPayloads) {
        const response = await page.request.post('/api/user/update-preferences', {
          data: payload,
        });

        // Should reject or sanitize the payload
        expect(response.status()).toBeOneOf([400, 200]);

        if (response.status() === 200) {
          // Check that pollution didn't occur
          const userResponse = await page.request.get('/api/user/profile');
          const userData = await userResponse.json();

          expect(userData.isAdmin).not.toBe(true);
          expect(userData.role).not.toBe('admin');
        }
      }
    });
  });

  test.describe('API Security Testing', () => {
    test('should prevent API abuse and enumeration', async ({ page }) => {
      // Test API endpoint enumeration
      const commonEndpoints = [
        '/api/admin',
        '/api/debug',
        '/api/test',
        '/api/internal',
        '/api/v1/users',
        '/api/v2/users',
        '/api/backup',
        '/api/config',
        '/api/status',
        '/api/metrics',
      ];

      for (const endpoint of commonEndpoints) {
        const response = await page.request.get(endpoint);

        // Should not expose sensitive endpoints
        if (response.status() === 200) {
          const responseText = await response.text();
          expect(responseText).not.toContain('password');
          expect(responseText).not.toContain('secret');
          expect(responseText).not.toContain('private_key');
          expect(responseText).not.toContain('database');
        }
      }
    });

    test('should validate API input properly', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Test malformed JSON
      const malformedJsonResponse = await page.request.post('/api/user/update-profile', {
        data: '{"name": "test"',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(malformedJsonResponse.status()).toBe(400);

      // Test oversized requests
      const oversizedData = {
        name: 'A'.repeat(10000),
        bio: 'B'.repeat(50000),
        preferences: Array(1000).fill('preference'),
      };

      const oversizedResponse = await page.request.post('/api/user/update-profile', {
        data: oversizedData,
      });
      expect(oversizedResponse.status()).toBeOneOf([400, 413]);

      // Test invalid data types
      const invalidTypeResponse = await page.request.post('/api/user/update-profile', {
        data: {
          name: 123, // Should be string
          age: 'thirty', // Should be number
          active: 'yes', // Should be boolean
        },
      });
      expect(invalidTypeResponse.status()).toBe(400);
    });

    test('should implement proper API versioning security', async ({ page }) => {
      // Test deprecated API versions
      const deprecatedVersions = ['/api/v0/', '/api/v1/', '/api/old/'];

      for (const version of deprecatedVersions) {
        const response = await page.request.get(`${version}users`);

        if (response.status() === 200) {
          // Should have deprecation warnings
          const headers = response.headers();
          expect(headers['deprecation']).toBeDefined();
          expect(headers['sunset']).toBeDefined();
        } else {
          // Should return 410 Gone or 404 Not Found
          expect(response.status()).toBeOneOf([404, 410]);
        }
      }

      // Test API version manipulation
      const versionManipulation = [
        { header: 'API-Version', value: '999.0' },
        { header: 'Accept-Version', value: 'admin' },
        { header: 'X-API-Version', value: '../../../etc/passwd' },
      ];

      for (const manipulation of versionManipulation) {
        const response = await page.request.get('/api/users', {
          headers: { [manipulation.header]: manipulation.value },
        });

        expect(response.status()).toBeOneOf([400, 404, 406]);
      }
    });

    test('should prevent API key leakage and abuse', async ({ page }) => {
      // Check that API responses don't leak sensitive information
      const response = await page.request.get('/api/health');
      const responseText = await response.text();

      // Should not contain sensitive data
      const sensitivePatterns = [
        /api[_-]?key/i,
        /secret[_-]?key/i,
        /private[_-]?key/i,
        /password/i,
        /token/i,
        /database[_-]?url/i,
        /connection[_-]?string/i,
      ];

      for (const pattern of sensitivePatterns) {
        expect(responseText).not.toMatch(pattern);
      }

      // Check error responses don't leak stack traces
      const errorResponse = await page.request.get('/api/nonexistent');
      const errorText = await errorResponse.text();

      expect(errorText).not.toContain('at ');
      expect(errorText).not.toContain('stack trace');
      expect(errorText).not.toContain('node_modules');
      expect(errorText).not.toContain('Error:');
    });
  });

  test.describe('Infrastructure Security Testing', () => {
    test('should have secure server configuration', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      // Check that server information is not leaked
      expect(headers?.['server']).toBeUndefined();
      expect(headers?.['x-powered-by']).toBeUndefined();
      expect(headers?.['x-aspnet-version']).toBeUndefined();

      // Check security headers are present
      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['x-frame-options']).toBe('DENY');
      expect(headers?.['x-xss-protection']).toBe('1; mode=block');
      expect(headers?.['strict-transport-security']).toBeDefined();
      expect(headers?.['content-security-policy']).toBeDefined();
      expect(headers?.['referrer-policy']).toBeDefined();
    });

    test('should prevent information disclosure', async ({ page }) => {
      // Test common information disclosure paths
      const disclosurePaths = [
        '/.env',
        '/config.json',
        '/package.json',
        '/.git/config',
        '/admin.php',
        '/phpinfo.php',
        '/server-status',
        '/server-info',
        '/.htaccess',
        '/web.config',
        '/robots.txt',
        '/sitemap.xml',
      ];

      for (const path of disclosurePaths) {
        const response = await page.request.get(path);

        if (response.status() === 200) {
          const content = await response.text();

          // Should not contain sensitive information
          expect(content).not.toContain('password');
          expect(content).not.toContain('secret');
          expect(content).not.toContain('private_key');
          expect(content).not.toContain('database');
          expect(content).not.toContain('api_key');
        }
      }
    });

    test('should implement proper error handling', async ({ page }) => {
      // Test various error conditions
      const errorTests = [
        { path: '/nonexistent', expectedStatus: 404 },
        { path: '/api/nonexistent', expectedStatus: 404 },
        { path: '/admin', expectedStatus: [401, 403] },
        { path: '/api/admin/users', expectedStatus: [401, 403] },
      ];

      for (const test of errorTests) {
        const response = await page.request.get(test.path);

        if (Array.isArray(test.expectedStatus)) {
          expect(test.expectedStatus).toContain(response.status());
        } else {
          expect(response.status()).toBe(test.expectedStatus);
        }

        // Check error response format
        if (response.status() >= 400) {
          const errorContent = await response.text();

          // Should not contain stack traces or sensitive info
          expect(errorContent).not.toContain('at ');
          expect(errorContent).not.toContain('node_modules');
          expect(errorContent).not.toContain('Error:');
          expect(errorContent).not.toContain('Exception:');
        }
      }
    });
  });
});
