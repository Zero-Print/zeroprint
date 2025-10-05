import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');

  // Start browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the development server to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    console.log(`⏳ Waiting for server at ${baseURL}...`);

    // Try to connect to the server with retries
    let retries = 30;
    while (retries > 0) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        console.log('✅ Server is ready!');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Server at ${baseURL} is not responding after 30 attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Seed test data if needed
    console.log('🌱 Seeding test data...');

    // Create test users and data
    await page.evaluate(() => {
      // Clear any existing test data
      localStorage.clear();
      sessionStorage.clear();

      // Set up test user data
      const testUsers = {
        citizen: {
          id: 'test-citizen-1',
          email: 'citizen@test.com',
          role: 'citizen',
          wallet: { balance: 100 },
        },
        admin: {
          id: 'test-admin-1',
          email: 'admin@test.com',
          role: 'admin',
          wallet: { balance: 500 },
        },
        school: {
          id: 'test-school-1',
          email: 'school@test.com',
          role: 'school',
          wallet: { balance: 200 },
        },
      };

      localStorage.setItem('test-users', JSON.stringify(testUsers));
      localStorage.setItem('test-mode', 'true');
    });

    console.log('✅ Global setup completed successfully!');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
