/**
 * Global Jest teardown
 * Runs once after all test suites
 */

export default async function globalTeardown() {
  // Clean up any global resources
  console.log('🧹 Global Jest teardown completed');
}
