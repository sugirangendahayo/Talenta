// Test utility functions

/**
 * Wait for a specified amount of time
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for a condition to become true
 */
export const waitFor = (
  condition,
  timeout = 5000,
  interval = 100
) => {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve(undefined);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
};

/**
 * Create a mock function that resolves with a value
 */
export const mockResolved = (value) => jest.fn().mockResolvedValue(value);

/**
 * Create a mock function that rejects with an error
 */
export const mockRejected = (error) =>
  jest.fn().mockRejectedValue(error instanceof Error ? error : new Error(error));

/**
 * Mock AsyncStorage implementation
 */
export const mockAsyncStorage = () => {
  const storage = {};
  
  return {
    getItem: async (key) => storage[key] || null,
    setItem: async (key, value) => {
      storage[key] = value;
    },
    removeItem: async (key) => {
      delete storage[key];
    },
    clear: async () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    getAllKeys: async () => Object.keys(storage),
    multiGet: async (keys) => 
      keys.map(key => [key, storage[key] || null]),
    multiSet: async (keyValuePairs) => {
      keyValuePairs.forEach(([key, value]) => {
        storage[key] = value;
      });
    },
    multiRemove: async (keys) => {
      keys.forEach(key => delete storage[key]);
    },
  };
};

/**
 * Mock SecureStore implementation
 */
export const mockSecureStore = () => {
  const storage = {};
  
  return {
    getItemAsync: async (key) => storage[key] || null,
    setItemAsync: async (key, value) => {
      storage[key] = value;
    },
    deleteItemAsync: async (key) => {
      delete storage[key];
    },
  };
};

/**
 * Generate a random test ID
 */
export const generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Create a mock router
 */
export const mockRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
  navigate: jest.fn(),
  reset: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  setParams: jest.fn(),
});

/**
 * Create a mock navigation
 */
export const mockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
  getState: jest.fn(() => ({})),
});
