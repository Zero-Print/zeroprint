import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

    // Connect to the application
    await page.goto(baseURL);

    // Clean up test data
    console.log('🗑️ Cleaning up test data...');

    await page.evaluate(() => {
      // Clear test data from localStorage
      localStorage.removeItem('test-users');
      localStorage.removeItem('test-mode');

      // Clear any other test-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('test-')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear session storage
      sessionStorage.clear();
    });

    console.log('✅ Global teardown completed successfully!');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

export default globalTeardown;
