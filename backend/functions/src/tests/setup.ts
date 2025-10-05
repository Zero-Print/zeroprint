import * as admin from "firebase-admin";

// Mock Sentry
jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  Handlers: {
    requestHandler: jest.fn(() => (req: unknown, _res: unknown, next: () => void) => next()),
    errorHandler: jest.fn(() => (_err: unknown, _req: unknown, _res: unknown, next: () => void) => next()),
  },
}));

// Set up test environment variables
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || "zeroprint-test";
process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "zeroprint-test";
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "localhost:9199";
process.env.NODE_ENV = "test";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({projectId: process.env.GCLOUD_PROJECT});
}

// Set Jest timeout
jest.setTimeout(20000);

// Mock console to reduce noise in tests
const originalConsole = {...console} as Console;

global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Cleanup after all tests
afterAll(async () => {
  global.console = originalConsole;
});

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
