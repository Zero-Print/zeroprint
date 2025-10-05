import React from 'react';
import { beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { handlers } from '../utils/handlers';
import { mockServer } from '../utils/mock-server';

/**
 * Global Test Setup
 *
 * This file configures the testing environment for all test suites.
 * It sets up MSW server, global mocks, and test utilities.
 */

// Setup MSW server
const server = setupServer(...handlers);

// Global test setup
beforeAll(async () => {
  // Start MSW server
  server.listen({
    onUnhandledRequest: 'warn',
  });

  // Start mock server utilities
  await mockServer.start();

  // Setup global mocks
  setupGlobalMocks();

  // Setup test environment
  setupTestEnvironment();
});

afterEach(() => {
  // Reset MSW handlers after each test
  server.resetHandlers();

  // Reset mock server state
  mockServer.reset();

  // Clear all mocks
  jest.clearAllMocks();
});

afterAll(async () => {
  // Stop MSW server
  server.close();

  // Stop mock server
  await mockServer.stop();

  // Cleanup test environment
  cleanupTestEnvironment();
});

/**
 * Setup global mocks for browser APIs and external services
 */
function setupGlobalMocks() {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  // Mock fetch (fallback for MSW)
  global.fetch = jest.fn();

  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Mock next/router
  jest.mock('next/router', () => ({
    useRouter: () => ({
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }),
  }));

  // Mock next/image
  jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return React.createElement('img', props);
    },
  }));

  // Mock next/link
  jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) => {
      return React.createElement('a', { href, ...props }, children);
    },
  }));

  // Mock Firebase
  jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
  }));

  jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(),
  }));

  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
  }));

  // Mock Stripe
  jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn(() =>
      Promise.resolve({
        elements: jest.fn(() => ({
          create: jest.fn(() => ({
            mount: jest.fn(),
            unmount: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
          })),
          getElement: jest.fn(),
        })),
        confirmCardPayment: jest.fn(),
        confirmPayment: jest.fn(),
      })
    ),
  }));

  // Mock Web3/Wallet connections
  global.ethereum = {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
  };

  // Mock geolocation
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  };
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
  });

  // Mock notifications
  Object.defineProperty(window, 'Notification', {
    value: jest.fn().mockImplementation(() => ({
      close: jest.fn(),
    })),
    configurable: true,
  });

  // Mock clipboard
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn(),
      readText: jest.fn(),
    },
  });

  // Mock file reader
  global.FileReader = jest.fn().mockImplementation(() => ({
    readAsDataURL: jest.fn(),
    readAsText: jest.fn(),
    onload: null,
    onerror: null,
    result: null,
  }));

  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn();
  global.URL.revokeObjectURL = jest.fn();
}

/**
 * Setup test environment variables and configurations
 */
function setupTestEnvironment() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api';
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

  // Set default timezone for consistent date testing
  process.env.TZ = 'UTC';

  // Configure test timeouts
  jest.setTimeout(30000);
}

/**
 * Cleanup test environment
 */
function cleanupTestEnvironment() {
  // Restore console methods
  jest.restoreAllMocks();

  // Clear environment variables
  delete process.env.NODE_ENV;
  delete process.env.NEXT_PUBLIC_API_BASE_URL;
  delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

// Export server for test-specific handler modifications
export { server };

// Export test utilities
export const testUtils = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  }),

  // Create mock activity
  createMockActivity: (overrides = {}) => ({
    id: `activity-${Date.now()}`,
    type: 'transportation',
    mode: 'bicycle',
    distance: 10,
    carbonSaved: 2.5,
    date: new Date().toISOString().split('T')[0],
    userId: 'test-user-id',
    ...overrides,
  }),

  // Create mock API response
  createMockResponse: (data: any, success = true) => ({
    success,
    ...(success ? data : { error: data }),
  }),

  // Simulate user interaction delay
  simulateUserDelay: () => new Promise(resolve => setTimeout(resolve, 100)),

  // Mock file for upload testing
  createMockFile: (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },

  // Mock form data
  createMockFormData: (data: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },
};

// Global test constants
export const TEST_CONSTANTS = {
  MOCK_USER_ID: 'test-user-id',
  MOCK_EMAIL: 'test@example.com',
  MOCK_TOKEN: 'mock-jwt-token',
  API_BASE_URL: 'http://localhost:3000/api',
  TEST_TIMEOUT: 30000,
  ANIMATION_TIMEOUT: 1000,
  NETWORK_DELAY: 100,
};
