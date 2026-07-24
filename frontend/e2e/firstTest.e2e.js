// Detox E2E test - Authentication flow
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadApp();
  });

  it('should display welcome screen on first launch', async () => {
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    await expect(element(by.text('Talenta'))).toBeVisible();
  });

  it('should navigate through onboarding steps', async () => {
    // Step 1
    await expect(element(by.id('welcome-step-1'))).toBeVisible();
    await element(by.id('next-button')).tap();
    
    // Step 2
    await expect(element(by.id('welcome-step-2'))).toBeVisible();
    await element(by.id('get-started-button')).tap();
    
    // Should navigate to sign in
    await expect(element(by.id('signin-screen'))).toBeVisible();
  });

  it('should navigate to sign up screen', async () => {
    await element(by.id('signup-link')).tap();
    await expect(element(by.id('signup-screen'))).toBeVisible();
  });

  it('should validate empty email field', async () => {
    await element(by.id('email-input')).typeText('');
    await element(by.id('signin-button')).tap();
    await expect(element(by.text('Please fill in all fields'))).toBeVisible();
  });

  it('should validate invalid email format', async () => {
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('ValidPass123!');
    await element(by.id('signin-button')).tap();
    await expect(element(by.text('Invalid email format'))).toBeVisible();
  });

  it('should validate empty password field', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('');
    await element(by.id('signin-button')).tap();
    await expect(element(by.text('Please fill in all fields'))).toBeVisible();
  });

  it('should show password when toggle is pressed', async () => {
    await element(by.id('password-input')).typeText('password');
    await element(by.id('password-toggle')).tap();
    // Password should now be visible (not masked)
  });

  it('should navigate to forgot password screen', async () => {
    await element(by.id('forgot-password-link')).tap();
    await expect(element(by.id('forgot-password-screen'))).toBeVisible();
  });
});
