/**
 * Mock Server Setup for Testing
 *
 * This module provides mock server utilities for testing without MSW
 * to avoid ESM compatibility issues.
 */

// Mock server object
const mockServer = {
  listen: jest.fn(),
  close: jest.fn(),
  resetHandlers: jest.fn(),
  use: jest.fn(),
};

/**
 * Setup mock server for testing
 */
export async function setupMockServer(): Promise<void> {
  // Start the server
  mockServer.listen({
    onUnhandledRequest: 'warn',
  });

  console.log('Mock server started for testing');
}

/**
 * Teardown mock server after testing
 */
export async function teardownMockServer(): Promise<void> {
  // Clean up and stop the server
  mockServer.close();
  console.log('Mock server stopped');
}

/**
 * Reset handlers between tests
 */
export function resetMockServer(): void {
  mockServer.resetHandlers();
}

/**
 * Add runtime handlers for specific tests
 */
export function addMockHandlers(...newHandlers: any[]): void {
  mockServer.use(...newHandlers);
}

// Additional mock server utilities
export const mockServerUtils = {
  /**
   * Mock authentication success
   */
  mockAuthSuccess: () => {
    mockServer.use(
      jest.fn(() => ({
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        token: 'mock-jwt-token',
      }))
    );
  },

  /**
   * Mock authentication failure
   */
  mockAuthFailure: () => {
    mockServer.use(
      jest.fn(() => ({
        success: false,
        error: 'Invalid credentials',
      }))
    );
  },

  /**
   * Mock network error
   */
  mockNetworkError: (endpoint: string) => {
    mockServer.use(
      jest.fn(() => {
        throw new Error('Network error');
      })
    );
  },

  /**
   * Mock server error
   */
  mockServerError: (endpoint: string) => {
    mockServer.use(
      jest.fn(() => ({
        error: 'Internal server error',
      }))
    );
  },

  /**
   * Mock rate limiting
   */
  mockRateLimit: (endpoint: string) => {
    mockServer.use(
      jest.fn(() => ({
        error: 'Too many requests',
      }))
    );
  },

  /**
   * Mock slow response
   */
  mockSlowResponse: (endpoint: string, delay: number = 5000) => {
    mockServer.use(
      jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { success: true };
      })
    );
  },
};

// Export mock server for compatibility
export const server = mockServer;