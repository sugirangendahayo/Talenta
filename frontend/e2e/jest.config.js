// Jest configuration for Detox E2E tests
module.exports = {
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  testTimeout: 120000,
  testMatch: ['**/*.e2e.js'],
  reporters: [
    'detox/runners/jest/streamlineReporter',
    ['jest-junit', {
      outputDirectory: './e2e/reports',
      outputName: 'junit.xml',
    }],
  ],
  verbose: true,
};
