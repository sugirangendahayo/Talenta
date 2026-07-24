# Talenta Testing Suite

This directory contains the complete testing suite for the Talenta job matching application.

## Overview

The testing suite is organized into multiple categories to ensure comprehensive coverage of the application's functionality:

- **Unit Tests**: Test individual functions, utilities, and business logic in isolation
- **Validation Tests**: Test form validation, input constraints, and data validation rules
- **Integration Tests**: Test interactions between multiple components and services
- **Functional/System Tests**: End-to-end tests using Detox for complete user workflows
- **Acceptance Tests**: Documentation of acceptance criteria for project stakeholders

## Test Structure

```
tests/
├── unit/                      # Unit tests for utilities and business logic
│   ├── username.test.js       # Username generation and validation
│   └── skillMatching.test.js   # Skill matching algorithm tests
├── validation/                # Validation tests for forms and inputs
│   ├── passwordValidation.test.js
│   ├── emailValidation.test.js
│   ├── usernameValidation.test.js
│   └── formValidation.test.js
├── integration/               # Integration tests for component interactions
│   ├── authFlow.test.js       # Authentication flow integration
│   ├── navigation.test.js     # Navigation integration
│   └── supabaseClient.test.js # Supabase client integration
├── functional-system/        # E2E tests (configured but in e2e/ directory)
├── acceptance/                # Acceptance testing documentation
│   └── acceptance-testing-report.md
├── mocks/                     # Mock data and test doubles
│   └── supabase.mock.js       # Supabase client mock
├── fixtures/                  # Test data fixtures
│   └── user-fixtures.js       # User, job, and application fixtures
├── helpers/                   # Test utility functions
│   └── test-utils.js          # Common test helpers
├── setup/                     # Test configuration
│   ├── jest.setup.js          # Jest setup file
│   └── jest.setupAfterEnv.js  # Jest after-env setup
└── README.md                  # This file
```

## Running Tests

### Prerequisites

Install the required dependencies:

```bash
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native react-test-renderer @types/jest
```

### Unit and Integration Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage report:
```bash
npm run test:coverage
```

Run tests in CI mode:
```bash
npm run test:ci
```

### End-to-End Tests (Detox)

First, install Detox:
```bash
npm install --save-dev detox detox-cli
```

Build the app for testing:
```bash
# iOS
detox build --configuration ios.sim.debug

# Android
detox build --configuration android.emu.debug
```

Run E2E tests:
```bash
# iOS
detox test --configuration ios.sim.debug

# Android
detox test --configuration android.emu.debug
```

## Testing Strategy

### Unit Tests

Unit tests focus on testing individual functions and utilities in isolation. These tests:

- Test the `username.ts` utility for username generation, validation, and availability checking
- Test the `skillMatching.ts` utility for skill matching algorithms
- Cover normal scenarios, edge cases, and error handling
- Use mocked dependencies to ensure isolation

### Validation Tests

Validation tests ensure that form inputs and user data are properly validated:

- Password complexity requirements (length, uppercase, lowercase, numbers, special characters)
- Email format validation
- Username format and availability validation
- Form field validation for signup and signin flows
- Both successful and failed validation scenarios

### Integration Tests

Integration tests verify that multiple components work together correctly:

- Authentication flow (sign in, sign up, sign out, session persistence)
- Navigation flow (role-based routing, protected routes)
- Supabase client integration (database queries, auth methods)
- Context provider integration (AuthContext, ThemeContext)

### Functional/System Tests (E2E)

End-to-end tests validate complete user workflows from start to finish:

- **Authentication Flow**: Onboarding, sign in, sign up, password recovery
- **Jobseeker Flow**: Profile completion, job search, application submission, bookmarking
- **Employer Flow**: Profile completion, job posting, application management, business verification

These tests use Detox to interact with the actual running application.

## Mocking Strategy

### Supabase Mocking

The Supabase client is mocked to avoid dependencies on live backend services:

```javascript
import { supabaseMock } from '@/tests/mocks/supabase.mock';

// In tests, replace the real supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: supabaseMock,
}));
```

### Expo Module Mocking

Expo modules are mocked in `jest.setup.js`:

- `expo-secure-store`: Encrypted storage
- `@react-native-async-storage/async-storage`: Local storage
- `expo-notifications`: Push notifications
- `expo-file-system`: File operations
- `expo-document-picker`: Document selection
- `expo-image-picker`: Image selection

### Navigation Mocking

Expo Router navigation is mocked to test navigation logic without actual routing:

```javascript
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));
```

## Coverage Report

### Current Coverage

| Category | Files Covered | Key Areas |
|----------|---------------|-----------|
| **Unit Tests** | 2 files | Username utilities, skill matching algorithm |
| **Validation Tests** | 4 files | Password, email, username, form validation |
| **Integration Tests** | 3 files | Auth flow, navigation, Supabase client |
| **E2E Tests** | 3 files | Authentication, jobseeker flow, employer flow |

### Covered Areas

✅ **Authentication**
- Sign in flow
- Sign up flow (jobseeker and employer)
- Password validation
- Email validation
- Session persistence
- Sign out flow

✅ **User Management**
- Username generation and validation
- Profile completion (jobseeker and employer)
- Profile editing

✅ **Job Functionality**
- Job search and filtering
- Skill matching algorithm
- Job application flow
- Job bookmarking

✅ **Employer Functionality**
- Job posting
- Application management
- Business verification

✅ **Navigation**
- Role-based routing
- Protected route access
- Cross-role access prevention

### Areas for Future Coverage

🔄 **Admin Features**
- User management
- Job moderation
- Report handling
- Analytics dashboard

🔄 **Advanced Features**
- Premium subscription flows
- Push notifications
- File uploads
- Real-time updates

🔄 **Error Handling**
- Network error scenarios
- Offline behavior
- API failure handling
- Timeout scenarios

🔄 **Performance**
- Large dataset handling
- Pagination performance
- Image loading optimization

## Test Data Fixtures

Test fixtures are provided in `tests/fixtures/user-fixtures.js`:

- Mock users (jobseeker, employer, admin)
- Mock jobs with various properties
- Mock applications
- Mock notifications

These fixtures can be imported and used in tests:

```javascript
import { mockUsers, mockJobs } from '@/tests/fixtures/user-fixtures';

const jobseekerUser = mockUsers.jobseeker;
const sampleJobs = mockJobs;
```

## Test Utilities

Common test utilities are provided in `tests/helpers/test-utils.js`:

- `wait(ms)`: Wait for a specified time
- `waitFor(condition, timeout, interval)`: Wait for a condition to become true
- `mockResolved(value)`: Create a mock function that resolves
- `mockRejected(error)`: Create a mock function that rejects
- `mockAsyncStorage()`: Mock AsyncStorage implementation
- `mockSecureStore()`: Mock SecureStore implementation
- `mockRouter()`: Create a mock router
- `mockNavigation()`: Create a mock navigation object

## Continuous Integration

To integrate tests into CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Unit Tests
  run: npm run test:ci

- name: Run E2E Tests
  run: |
    detox build --configuration ios.sim.debug
    detox test --configuration ios.sim.debug
```

## Troubleshooting

### Common Issues

**Tests failing with "Module not found" errors**
- Ensure all dependencies are installed
- Check that path aliases in `jest.config.js` match your project structure

**Detox tests failing to launch app**
- Ensure the app is built for testing
- Check that the simulator/emulator is running
- Verify the binary path in `detox.config.js`

**Supabase mocks not working**
- Ensure mocks are imported before the actual module
- Check that mock implementations match the real API

**Timeout errors in E2E tests**
- Increase timeout in `e2e/jest.config.js`
- Check that the app is responsive
- Verify network conditions

## Best Practices

1. **Write Isolated Tests**: Each test should be independent and not rely on other tests
2. **Use Descriptive Names**: Test names should clearly describe what is being tested
3. **Mock External Dependencies**: Always mock external services and APIs
4. **Test Edge Cases**: Don't just test happy paths - test error scenarios too
5. **Keep Tests Fast**: Unit tests should run in milliseconds, not seconds
6. **Maintain Test Data**: Keep fixtures up-to-date with application changes
7. **Run Tests Frequently**: Integrate test execution into development workflow

## Contributing

When adding new tests:

1. Place tests in the appropriate directory based on type
2. Follow existing naming conventions (`.test.js` for unit/integration, `.e2e.js` for E2E)
3. Use existing mocks and fixtures when possible
4. Update this README with new test coverage
5. Ensure all tests pass before committing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing/)

## Contact

For questions about the testing suite, contact the QA team or refer to the project documentation.
