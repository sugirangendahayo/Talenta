// Jest setupAfterEnv file - runs after test environment is set up

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset modules after each test to ensure clean state
afterEach(() => {
  jest.resetModules();
});

// Global timeout for async operations
jest.setTimeout(10000);

// Mock fetch for Supabase calls
global.fetch = jest.fn();

// Add custom matchers if needed
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    };
  },
  toHaveLengthBetween(received, min, max) {
    const pass = received.length >= min && received.length <= max;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to have length between ${min} and ${max}`,
      pass,
    };
  },
});
