import { chromium, FullConfig } from '@playwright/test';
import { mockServer } from '../utils/mock-server';

/**
 * Playwright Global Setup
 *
 * This file configures the global setup for Playwright tests,
 * including starting the mock server and preparing the test environment.
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...');

  try {
    // Start the mock server for API mocking
    await mockServer.start();
    console.log('✅ Mock server started successfully');

    // Start the development server if not already running
    await startDevServer();
    console.log('✅ Development server is ready');

    // Warm up browsers and create baseline screenshots if needed
    await warmupBrowsers();
    console.log('✅ Browser warmup completed');

    // Setup authentication state for tests
    await setupAuthenticationState();
    console.log('✅ Authentication state prepared');

    console.log('🎉 Playwright global setup completed successfully');
  } catch (error) {
    console.error('❌ Playwright global setup failed:', error);
    throw error;
  }
}

/**
 * Start the development server if not already running
 */
async function startDevServer() {
  const { spawn } = require('child_process');
  const fetch = require('node-fetch');

  // Check if server is already running
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('Development server is already running');
      return;
    }
  } catch (error) {
    // Server is not running, start it
  }

  console.log('Starting development server...');

  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    cwd: process.cwd(),
  });

  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Development server failed to start within 60 seconds'));
    }, 60000);

    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3000');
        if (response.ok) {
          clearTimeout(timeout);
          resolve(true);
        } else {
          setTimeout(checkServer, 1000);
        }
      } catch (error) {
        setTimeout(checkServer, 1000);
      }
    };

    setTimeout(checkServer, 5000); // Wait 5 seconds before first check
  });

  // Store process reference for cleanup
  (global as any).__DEV_SERVER_PROCESS__ = serverProcess;
}

/**
 * Warm up browsers and prepare for visual testing
 */
async function warmupBrowsers() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // Navigate to the homepage to warm up
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for any initial animations or loading
    await page.waitForTimeout(2000);

    // Ensure fonts are loaded
    await page.evaluate(() => {
      return document.fonts.ready;
    });

    console.log('Browser warmup completed');
  } catch (error) {
    console.warn('Browser warmup failed:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Setup authentication state for authenticated tests
 */
async function setupAuthenticationState() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Perform login with test credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // Wait for successful login and redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Save authentication state
    await context.storageState({
      path: 'tests/setup/auth-state.json',
    });

    console.log('Authentication state saved');
  } catch (error) {
    console.warn('Authentication setup failed:', error);
    // Create a mock auth state file
    const fs = require('fs');
    const path = require('path');

    const mockAuthState = {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [
            {
              name: 'auth-token',
              value: 'mock-jwt-token',
            },
            {
              name: 'user-data',
              value: JSON.stringify({
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
              }),
            },
          ],
        },
      ],
    };

    const authStatePath = path.join(__dirname, 'auth-state.json');
    fs.writeFileSync(authStatePath, JSON.stringify(mockAuthState, null, 2));
    console.log('Mock authentication state created');
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Global teardown function
 */
async function globalTeardown() {
  console.log('🧹 Starting Playwright global teardown...');

  try {
    // Stop the mock server
    await mockServer.stop();
    console.log('✅ Mock server stopped');

    // Stop the development server if we started it
    const serverProcess = (global as any).__DEV_SERVER_PROCESS__;
    if (serverProcess) {
      serverProcess.kill();
      console.log('✅ Development server stopped');
    }

    // Cleanup temporary files
    await cleanupTempFiles();
    console.log('✅ Temporary files cleaned up');

    console.log('🎉 Playwright global teardown completed');
  } catch (error) {
    console.error('❌ Playwright global teardown failed:', error);
  }
}

/**
 * Cleanup temporary files created during testing
 */
async function cleanupTempFiles() {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    // Remove test artifacts
    const artifactsDir = path.join(__dirname, '../artifacts');
    await fs.rmdir(artifactsDir, { recursive: true }).catch(() => {});

    // Remove temporary auth state if it exists
    const authStatePath = path.join(__dirname, 'auth-state.json');
    await fs.unlink(authStatePath).catch(() => {});

    // Remove any temporary screenshot directories
    const tempScreenshotsDir = path.join(__dirname, '../temp-screenshots');
    await fs.rmdir(tempScreenshotsDir, { recursive: true }).catch(() => {});
  } catch (error) {
    console.warn('Some cleanup operations failed:', error);
  }
}

/**
 * Utility functions for test setup
 */
export const setupUtils = {
  /**
   * Wait for the application to be fully loaded
   */
  waitForAppReady: async (page: any) => {
    // Wait for React to be ready
    await page.waitForFunction(() => {
      return window.React !== undefined;
    });

    // Wait for Next.js router to be ready
    await page.waitForFunction(() => {
      return window.__NEXT_DATA__ !== undefined;
    });

    // Wait for any loading spinners to disappear
    await page
      .waitForSelector('[data-testid="loading-spinner"]', {
        state: 'hidden',
        timeout: 5000,
      })
      .catch(() => {});

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Small delay for any remaining animations
    await page.waitForTimeout(500);
  },

  /**
   * Setup viewport for consistent testing
   */
  setupViewport: async (page: any, device = 'desktop') => {
    const viewports = {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 },
    };

    await page.setViewportSize(viewports[device] || viewports.desktop);
  },

  /**
   * Mock network conditions
   */
  setupNetworkConditions: async (page: any, condition = 'fast') => {
    const conditions = {
      fast: { downloadThroughput: 10000000, uploadThroughput: 10000000, latency: 10 },
      slow: { downloadThroughput: 500000, uploadThroughput: 500000, latency: 100 },
      offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 },
    };

    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: condition === 'offline',
      ...conditions[condition],
    });
  },

  /**
   * Setup dark mode for testing
   */
  setupDarkMode: async (page: any, enabled = true) => {
    await page.emulateMedia({
      colorScheme: enabled ? 'dark' : 'light',
    });

    // Also set localStorage preference if the app uses it
    await page.evaluate(darkMode => {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, enabled);
  },

  /**
   * Setup reduced motion for consistent animations
   */
  setupReducedMotion: async (page: any, enabled = true) => {
    await page.emulateMedia({
      reducedMotion: enabled ? 'reduce' : 'no-preference',
    });
  },
};

export default globalSetup;
export { globalTeardown };
