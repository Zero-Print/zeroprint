/**
 * Global Jest setup
 * Runs once before all test suites
 */

export default async function globalSetup() {
  // Set up environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001';
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'test-razorpay-key';

  console.log('🧪 Global Jest setup completed');
}
