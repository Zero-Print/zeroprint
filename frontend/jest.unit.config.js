const config = require('./jest.config.ts');
module.exports = {
  ...config,
  testMatch: ['<rootDir>/tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/unit-setup.ts'],
};