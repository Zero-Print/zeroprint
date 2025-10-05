/**
 * E2E Tests for Auth Validation
 * Tests that API endpoints properly reject invalid/missing tokens
 */

import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/demo-zeroprint/asia-south1/api';

test.describe('Auth Validation', () => {
  test('should reject requests without authorization header', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/wallet/balance`);
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authorization header required');
  });

  test('should reject requests with invalid authorization format', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/wallet/balance`, {
      headers: {
        'Authorization': 'InvalidToken'
      }
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid authorization format');
  });

  test('should reject requests with invalid token', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/wallet/balance`, {
      headers: {
        'Authorization': 'Bearer invalid-token-123'
      }
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid token');
  });

  test('should reject requests with expired token', async ({ request }) => {
    // This would need a real expired token for testing
    const expiredToken = 'expired-token-123';
    
    const response = await request.get(`${API_BASE_URL}/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid token');
  });

  test('should allow requests with valid token', async ({ request }) => {
    // This would need a real valid token for testing
    // In a real test, you'd get this from a test user login
    const validToken = 'valid-token-123';
    
    const response = await request.get(`${API_BASE_URL}/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    
    // This test would pass if the token is valid
    // In practice, you'd need to set up a test user and get a real token
    expect(response.status()).toBe(200);
  });

  test('should reject admin requests without admin role', async ({ request }) => {
    // This would need a valid token but without admin role
    const userToken = 'user-token-123';
    
    const response = await request.get(`${API_BASE_URL}/admin/audit-logs`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Insufficient permissions');
  });

  test('should allow admin requests with admin role', async ({ request }) => {
    // This would need a valid admin token
    const adminToken = 'admin-token-123';
    
    const response = await request.get(`${API_BASE_URL}/admin/audit-logs`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    // This test would pass if the token has admin role
    expect(response.status()).toBe(200);
  });

  test('should handle CORS preflight requests', async ({ request }) => {
    const response = await request.options(`${API_BASE_URL}/wallet/balance`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
      }
    });
    
    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBeDefined();
  });

  test('should include CORS headers in responses', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    
    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBeDefined();
    expect(response.headers()['access-control-allow-methods']).toBeDefined();
  });
});
