import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { handlers } from './handlers';

/**
 * Mock Server Setup for Testing
 *
 * This module sets up a mock server using MSW (Mock Service Worker)
 * to intercept and mock API calls during testing.
 */

// Create mock server with handlers
export const server = setupServer(...handlers);

/**
 * Setup mock server for testing
 */
export async function setupMockServer(): Promise<void> {
  // Start the server
  server.listen({
    onUnhandledRequest: 'warn',
  });

  console.log('Mock server started for testing');
}

/**
 * Teardown mock server after testing
 */
export async function teardownMockServer(): Promise<void> {
  // Clean up and stop the server
  server.close();
  console.log('Mock server stopped');
}

/**
 * Reset handlers between tests
 */
export function resetMockServer(): void {
  server.resetHandlers();
}

/**
 * Add runtime handlers for specific tests
 */
export function addMockHandlers(...newHandlers: any[]): void {
  server.use(...newHandlers);
}

// Additional mock server utilities
export const mockServerUtils = {
  /**
   * Mock authentication success
   */
  mockAuthSuccess: () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
            },
            token: 'mock-jwt-token',
          })
        );
      })
    );
  },

  /**
   * Mock authentication failure
   */
  mockAuthFailure: () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            success: false,
            error: 'Invalid credentials',
          })
        );
      })
    );
  },

  /**
   * Mock network error
   */
  mockNetworkError: (endpoint: string) => {
    server.use(
      rest.all(endpoint, (req, res, ctx) => {
        return res.networkError('Network error');
      })
    );
  },

  /**
   * Mock server error
   */
  mockServerError: (endpoint: string) => {
    server.use(
      rest.all(endpoint, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            error: 'Internal server error',
          })
        );
      })
    );
  },

  /**
   * Mock rate limiting
   */
  mockRateLimit: (endpoint: string) => {
    server.use(
      rest.all(endpoint, (req, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({
            error: 'Too many requests',
          })
        );
      })
    );
  },

  /**
   * Mock slow response
   */
  mockSlowResponse: (endpoint: string, delay: number = 5000) => {
    server.use(
      rest.all(endpoint, (req, res, ctx) => {
        return res(ctx.delay(delay), ctx.status(200), ctx.json({ success: true }));
      })
    );
  },
};
