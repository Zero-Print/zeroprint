/**
 * Security Tests
 * Comprehensive security testing for authentication, authorization, and data protection
 */

import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test.describe('Authentication Security', () => {
    test('should reject requests without authentication', async ({ page }) => {
      // Try to access protected endpoints without authentication
      const response = await page.request.get('/api/wallet/balance');
      expect(response.status()).toBe(401);
    });

    test('should reject requests with invalid tokens', async ({ page }) => {
      // Try to access protected endpoints with invalid token
      const response = await page.request.get('/api/wallet/balance', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      expect(response.status()).toBe(401);
    });

    test('should reject requests with expired tokens', async ({ page }) => {
      // Try to access protected endpoints with expired token
      const response = await page.request.get('/api/wallet/balance', {
        headers: {
          'Authorization': 'Bearer expired-token'
        }
      });
      expect(response.status()).toBe(401);
    });

    test('should validate JWT token format', async ({ page }) => {
      // Try to access protected endpoints with malformed token
      const response = await page.request.get('/api/wallet/balance', {
        headers: {
          'Authorization': 'Bearer malformed.token'
        }
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Authorization Security', () => {
    test('should enforce role-based access control', async ({ page }) => {
      // Test citizen cannot access admin endpoints
      const citizenResponse = await page.request.get('/api/admin/users', {
        headers: {
          'Authorization': 'Bearer citizen-token'
        }
      });
      expect(citizenResponse.status()).toBe(403);

      // Test admin can access admin endpoints
      const adminResponse = await page.request.get('/api/admin/users', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      expect(adminResponse.status()).toBe(200);
    });

    test('should prevent privilege escalation', async ({ page }) => {
      // Test user cannot modify their own role
      const response = await page.request.patch('/api/users/self', {
        data: { role: 'admin' },
        headers: {
          'Authorization': 'Bearer citizen-token'
        }
      });
      expect(response.status()).toBe(403);
    });

    test('should enforce data isolation', async ({ page }) => {
      // Test user cannot access other users' data
      const response = await page.request.get('/api/wallet/balance', {
        headers: {
          'Authorization': 'Bearer user1-token'
        }
      });
      
      // Should only return user1's data, not user2's
      const data = await response.json();
      expect(data.userId).toBe('user1');
    });
  });

  test.describe('Data Protection', () => {
    test('should prevent client-side data modification', async ({ page }) => {
      // Test user cannot directly modify wallet data
      const response = await page.request.patch('/api/wallet/balance', {
        data: { healCoins: 10000 },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(405); // Method not allowed
    });

    test('should prevent client-side payment creation', async ({ page }) => {
      // Test user cannot directly create payments
      const response = await page.request.post('/api/payments', {
        data: { amount: 1000, status: 'completed' },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(405); // Method not allowed
    });

    test('should prevent client-side subscription modification', async ({ page }) => {
      // Test user cannot directly modify subscriptions
      const response = await page.request.patch('/api/subscriptions', {
        data: { status: 'active' },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(405); // Method not allowed
    });

    test('should prevent client-side audit log modification', async ({ page }) => {
      // Test user cannot modify audit logs
      const response = await page.request.post('/api/audit-logs', {
        data: { action: 'test', userId: 'user1' },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(405); // Method not allowed
    });
  });

  test.describe('Input Validation', () => {
    test('should validate input data types', async ({ page }) => {
      // Test with invalid data types
      const response = await page.request.post('/api/wallet/earn', {
        data: { 
          gameId: 123, // Should be string
          coins: 'invalid', // Should be number
          source: null // Should be string
        },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(400);
    });

    test('should validate input data ranges', async ({ page }) => {
      // Test with invalid data ranges
      const response = await page.request.post('/api/wallet/earn', {
        data: { 
          gameId: 'game1',
          coins: -100, // Should be positive
          source: 'game_completion'
        },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(400);
    });

    test('should validate input data length', async ({ page }) => {
      // Test with invalid data length
      const response = await page.request.post('/api/wallet/earn', {
        data: { 
          gameId: 'a'.repeat(1000), // Too long
          coins: 100,
          source: 'game_completion'
        },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(400);
    });

    test('should sanitize input data', async ({ page }) => {
      // Test with malicious input
      const response = await page.request.post('/api/wallet/earn', {
        data: { 
          gameId: '<script>alert("xss")</script>',
          coins: 100,
          source: 'game_completion'
        },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Rate Limiting', () => {
    test('should enforce rate limits on API endpoints', async ({ page }) => {
      // Test rapid successive requests
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          page.request.post('/api/wallet/earn', {
            data: { gameId: 'game1', coins: 10, source: 'test' },
            headers: { 'Authorization': 'Bearer user-token' }
          })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should enforce daily earning caps', async ({ page }) => {
      // Test daily cap enforcement
      const response = await page.request.post('/api/wallet/earn', {
        data: { 
          gameId: 'game1', 
          coins: 10000, // Exceeds daily cap
          source: 'game_completion'
        },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(429);
    });

    test('should enforce monthly redemption caps', async ({ page }) => {
      // Test monthly redemption cap
      const response = await page.request.post('/api/wallet/redeem', {
        data: { 
          rewardId: 'reward1',
          quantity: 1000 // Exceeds monthly cap
        },
        headers: {
          'Authorization': 'Bearer user-token'
        }
      });
      expect(response.status()).toBe(429);
    });
  });

  test.describe('Fraud Prevention', () => {
    test('should detect duplicate transactions', async ({ page }) => {
      // Test duplicate transaction detection
      const data = { gameId: 'game1', coins: 100, source: 'test' };
      
      const response1 = await page.request.post('/api/wallet/earn', {
        data,
        headers: { 'Authorization': 'Bearer user-token' }
      });
      expect(response1.status()).toBe(200);

      const response2 = await page.request.post('/api/wallet/earn', {
        data,
        headers: { 'Authorization': 'Bearer user-token' }
      });
      expect(response2.status()).toBe(409); // Conflict
    });

    test('should detect suspicious activity patterns', async ({ page }) => {
      // Test suspicious activity detection
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          page.request.post('/api/wallet/earn', {
            data: { 
              gameId: 'game1', 
              coins: 100, 
              source: 'test',
              timestamp: Date.now() + i
            },
            headers: { 'Authorization': 'Bearer user-token' }
          })
        );
      }

      const responses = await Promise.all(promises);
      const fraudDetectedResponses = responses.filter(r => r.status() === 429);
      expect(fraudDetectedResponses.length).toBeGreaterThan(0);
    });

    test('should validate game completion data', async ({ page }) => {
      // Test game completion validation
      const response = await page.request.post('/api/games/game1/complete', {
        data: {
          score: 1000, // Suspiciously high score
          playTime: 5, // Suspiciously short time
          clientData: { answers: [] } // Empty answers
        },
        headers: { 'Authorization': 'Bearer user-token' }
      });
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Webhook Security', () => {
    test('should validate Razorpay webhook signatures', async ({ page }) => {
      // Test webhook signature validation
      const response = await page.request.post('/api/webhooks/razorpay', {
        data: { event: 'payment.completed', payload: {} },
        headers: {
          'X-Razorpay-Signature': 'invalid-signature'
        }
      });
      expect(response.status()).toBe(401);
    });

    test('should validate partner webhook signatures', async ({ page }) => {
      // Test partner webhook signature validation
      const response = await page.request.post('/api/webhooks/partner', {
        data: { event: 'inventory.updated', payload: {} },
        headers: {
          'X-Partner-Signature': 'invalid-signature'
        }
      });
      expect(response.status()).toBe(401);
    });

    test('should prevent webhook replay attacks', async ({ page }) => {
      // Test webhook replay attack prevention
      const data = { event: 'payment.completed', payload: {}, timestamp: Date.now() };
      
      const response1 = await page.request.post('/api/webhooks/razorpay', {
        data,
        headers: { 'X-Razorpay-Signature': 'valid-signature' }
      });
      expect(response1.status()).toBe(200);

      const response2 = await page.request.post('/api/webhooks/razorpay', {
        data,
        headers: { 'X-Razorpay-Signature': 'valid-signature' }
      });
      expect(response2.status()).toBe(409); // Conflict
    });
  });

  test.describe('Data Encryption', () => {
    test('should encrypt sensitive data in transit', async ({ page }) => {
      // Test HTTPS enforcement
      const response = await page.request.get('/api/wallet/balance', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      
      // Should redirect to HTTPS or reject HTTP
      expect(response.status()).toBe(301);
    });

    test('should encrypt sensitive data at rest', async ({ page }) => {
      // Test that sensitive data is encrypted
      const response = await page.request.get('/api/users/self', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      
      const data = await response.json();
      // Sensitive fields should be encrypted or masked
      expect(data.email).toContain('***');
      expect(data.phoneNumber).toContain('***');
    });
  });

  test.describe('Session Management', () => {
    test('should invalidate sessions on logout', async ({ page }) => {
      // Test session invalidation
      const response = await page.request.post('/api/auth/logout', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      expect(response.status()).toBe(200);

      // Subsequent requests should fail
      const followUpResponse = await page.request.get('/api/wallet/balance', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      expect(followUpResponse.status()).toBe(401);
    });

    test('should enforce session timeouts', async ({ page }) => {
      // Test session timeout
      const response = await page.request.get('/api/wallet/balance', {
        headers: { 'Authorization': 'Bearer expired-session-token' }
      });
      expect(response.status()).toBe(401);
    });

    test('should prevent session fixation', async ({ page }) => {
      // Test session fixation prevention
      const response = await page.request.post('/api/auth/login', {
        data: { email: 'user@example.com', password: 'password' }
      });
      
      const data = await response.json();
      // Should return a new session token
      expect(data.token).toBeDefined();
      expect(data.token).not.toBe('fixed-session-token');
    });
  });

  test.describe('Error Handling', () => {
    test('should not expose sensitive information in errors', async ({ page }) => {
      // Test error message sanitization
      const response = await page.request.get('/api/admin/users', {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
      
      const data = await response.json();
      expect(data.error).not.toContain('database');
      expect(data.error).not.toContain('password');
      expect(data.error).not.toContain('secret');
    });

    test('should log security events', async ({ page }) => {
      // Test security event logging
      const response = await page.request.get('/api/admin/users', {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
      
      expect(response.status()).toBe(401);
      
      // Check that security event was logged
      const logResponse = await page.request.get('/api/admin/security-logs', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      const logs = await logResponse.json();
      expect(logs.data.some((log: any) => log.type === 'unauthorized_access')).toBe(true);
    });
  });

  test.describe('Content Security Policy', () => {
    test('should enforce CSP headers', async ({ page }) => {
      // Test CSP enforcement
      const response = await page.request.get('/');
      
      const cspHeader = response.headers()['content-security-policy'];
      expect(cspHeader).toBeDefined();
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self'");
      expect(cspHeader).toContain("style-src 'self'");
    });

    test('should prevent XSS attacks', async ({ page }) => {
      // Test XSS prevention
      await page.goto('/?search=<script>alert("xss")</script>');
      
      // Should not execute the script
      const alertHandled = await page.evaluate(() => {
        return window.alert === undefined || window.alert.toString().includes('native code');
      });
      expect(alertHandled).toBe(true);
    });
  });

  test.describe('API Security', () => {
    test('should prevent SQL injection', async ({ page }) => {
      // Test SQL injection prevention
      const response = await page.request.get('/api/users', {
        params: { search: "'; DROP TABLE users; --" },
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should prevent NoSQL injection', async ({ page }) => {
      // Test NoSQL injection prevention
      const response = await page.request.get('/api/users', {
        params: { filter: '{"$where": "this.password.length > 0"}' },
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should prevent path traversal', async ({ page }) => {
      // Test path traversal prevention
      const response = await page.request.get('/api/files/../../../etc/passwd', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      
      expect(response.status()).toBe(400);
    });
  });
});