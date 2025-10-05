import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { WalletProvider } from '../../src/contexts/WalletContext';
import { NotificationProvider } from '../../src/contexts/NotificationContext';

/**
 * Test Utilities
 *
 * This module provides utilities and helpers for testing React components
 * with proper context providers and common testing patterns.
 */

// Mock Next.js router
const mockRouter = {
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
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  user?: any;
  queryClient?: QueryClient;
  theme?: 'light' | 'dark';
  authenticated?: boolean;
}

function AllTheProviders({
  children,
  queryClient,
  theme = 'light',
  authenticated = false,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
  theme?: 'light' | 'dark';
  authenticated?: boolean;
}) {
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

  // Mock auth context value
  const mockAuthValue = {
    user: authenticated
      ? {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          avatar: null,
          createdAt: '2024-01-01T00:00:00Z',
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en',
          },
        }
      : null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    resetPassword: jest.fn(),
    isAuthenticated: authenticated,
  };

  // Mock wallet context value
  const mockWalletValue = {
    wallet: {
      id: 'wallet-1',
      userId: 'test-user-id',
      balance: 150.5,
      tokenBalance: 250,
      currency: 'USD',
    },
    loading: false,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    addFunds: jest.fn(),
    makePayment: jest.fn(),
    getTransactions: jest.fn(),
    isConnected: authenticated,
  };

  // Mock notification context value
  const mockNotificationValue = {
    notifications: [],
    addNotification: jest.fn(),
    removeNotification: jest.fn(),
    markAsRead: jest.fn(),
    clearAll: jest.fn(),
  };

  return (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider attribute='class' defaultTheme={theme}>
        <AuthProvider value={mockAuthValue}>
          <WalletProvider value={mockWalletValue}>
            <NotificationProvider value={mockNotificationValue}>{children}</NotificationProvider>
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { queryClient, theme, authenticated, ...renderOptions } = options;

  const user = userEvent.setup();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient} theme={theme} authenticated={authenticated}>
      {children}
    </AllTheProviders>
  );

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Test utilities for common patterns
export const testUtils = {
  /**
   * Render component with authentication context
   */
  renderWithAuth: (ui: ReactElement, options: CustomRenderOptions = {}) => {
    return customRender(ui, { ...options, authenticated: true });
  },

  /**
   * Render component without authentication
   */
  renderWithoutAuth: (ui: ReactElement, options: CustomRenderOptions = {}) => {
    return customRender(ui, { ...options, authenticated: false });
  },

  /**
   * Render component with dark theme
   */
  renderWithDarkTheme: (ui: ReactElement, options: CustomRenderOptions = {}) => {
    return customRender(ui, { ...options, theme: 'dark' });
  },

  /**
   * Wait for element to appear
   */
  waitForElement: async (selector: string, timeout = 5000) => {
    return await waitFor(
      () => {
        const element = screen.getByTestId(selector) || screen.getByRole(selector);
        expect(element).toBeInTheDocument();
        return element;
      },
      { timeout }
    );
  },

  /**
   * Wait for element to disappear
   */
  waitForElementToDisappear: async (selector: string, timeout = 5000) => {
    return await waitFor(
      () => {
        expect(screen.queryByTestId(selector)).not.toBeInTheDocument();
      },
      { timeout }
    );
  },

  /**
   * Simulate user typing with realistic delays
   */
  typeWithDelay: async (element: HTMLElement, text: string, delay = 50) => {
    const user = userEvent.setup({ delay });
    await user.type(element, text);
  },

  /**
   * Simulate form submission
   */
  submitForm: async (formSelector: string) => {
    const user = userEvent.setup();
    const form = screen.getByTestId(formSelector);
    await user.click(screen.getByRole('button', { name: /submit|save|create/i }));
    return form;
  },

  /**
   * Fill form fields
   */
  fillForm: async (fields: Record<string, string>) => {
    const user = userEvent.setup();

    for (const [fieldName, value] of Object.entries(fields)) {
      const field =
        screen.getByLabelText(new RegExp(fieldName, 'i')) ||
        screen.getByPlaceholderText(new RegExp(fieldName, 'i')) ||
        screen.getByTestId(`${fieldName}-input`);

      await user.clear(field);
      await user.type(field, value);
    }
  },

  /**
   * Mock API response
   */
  mockApiResponse: (url: string, response: any, status = 200) => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: jest.fn().mockResolvedValue(response),
    });

    global.fetch = mockFetch;
    return mockFetch;
  },

  /**
   * Mock API error
   */
  mockApiError: (url: string, error: string, status = 500) => {
    const mockFetch = jest.fn().mockRejectedValue(new Error(error));
    global.fetch = mockFetch;
    return mockFetch;
  },

  /**
   * Create mock file for upload testing
   */
  createMockFile: (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },

  /**
   * Simulate file upload
   */
  uploadFile: async (inputSelector: string, file: File) => {
    const user = userEvent.setup();
    const input = screen.getByTestId(inputSelector) as HTMLInputElement;
    await user.upload(input, file);
    return input;
  },

  /**
   * Wait for loading to complete
   */
  waitForLoadingToComplete: async (timeout = 10000) => {
    await waitFor(
      () => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout }
    );
  },

  /**
   * Check accessibility
   */
  checkAccessibility: async (container: HTMLElement) => {
    const { axe } = await import('@axe-core/react');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    return results;
  },

  /**
   * Simulate network delay
   */
  simulateNetworkDelay: (ms = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Mock intersection observer
   */
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
    return mockIntersectionObserver;
  },

  /**
   * Mock resize observer
   */
  mockResizeObserver: () => {
    const mockResizeObserver = jest.fn();
    mockResizeObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.ResizeObserver = mockResizeObserver;
    return mockResizeObserver;
  },

  /**
   * Mock local storage
   */
  mockLocalStorage: () => {
    const store: Record<string, string> = {};

    const mockLocalStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });

    return mockLocalStorage;
  },

  /**
   * Mock geolocation
   */
  mockGeolocation: (coords = { latitude: 40.7128, longitude: -74.006 }) => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn(success => {
        success({
          coords: {
            ...coords,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    });

    return mockGeolocation;
  },

  /**
   * Mock clipboard
   */
  mockClipboard: () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
      readText: jest.fn().mockResolvedValue(''),
    };

    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
    });

    return mockClipboard;
  },

  /**
   * Create test query client
   */
  createTestQueryClient: () => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  },

  /**
   * Wait for React Query to settle
   */
  waitForQueryToSettle: async (queryClient: QueryClient) => {
    await waitFor(() => {
      expect(queryClient.isFetching()).toBe(0);
    });
  },

  /**
   * Mock console methods
   */
  mockConsole: () => {
    const originalConsole = { ...console };

    const mockConsole = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    Object.assign(console, mockConsole);

    return {
      mockConsole,
      restore: () => Object.assign(console, originalConsole),
    };
  },

  /**
   * Create mock router
   */
  createMockRouter: (overrides = {}) => ({
    ...mockRouter,
    ...overrides,
  }),

  /**
   * Assert element has focus
   */
  expectElementToHaveFocus: (element: HTMLElement) => {
    expect(element).toHaveFocus();
  },

  /**
   * Assert element is visible
   */
  expectElementToBeVisible: (element: HTMLElement) => {
    expect(element).toBeVisible();
  },

  /**
   * Assert element has correct ARIA attributes
   */
  expectCorrectAriaAttributes: (element: HTMLElement, attributes: Record<string, string>) => {
    Object.entries(attributes).forEach(([attr, value]) => {
      expect(element).toHaveAttribute(`aria-${attr}`, value);
    });
  },
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
export { userEvent };

// Export custom matchers
export const customMatchers = {
  toBeAccessible: async (received: HTMLElement) => {
    try {
      await testUtils.checkAccessibility(received);
      return {
        message: () => `Expected element to have accessibility violations`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Expected element to be accessible but found violations: ${error}`,
        pass: false,
      };
    }
  },
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): Promise<R>;
    }
  }
}

// Setup custom matchers
if (typeof expect !== 'undefined') {
  expect.extend(customMatchers);
}
