module.exports = {
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|expo|@expo|@supabase|react-native-url-polyfill|expo-router)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
    '<rootDir>/web-build/',
  ],
  setupFiles: ['<rootDir>/tests/setup/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setupAfterEnv.js'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/android/**',
    '!**/ios/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  testMatch: [
    '**/tests/**/*.test.{js,jsx,ts,tsx}',
    '**/tests/**/*.spec.{js,jsx,ts,tsx}',
  ],
};
