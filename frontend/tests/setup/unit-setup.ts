// Unit test setup file
import '@testing-library/jest-dom';

// Mock global objects that might not be available in the test environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});