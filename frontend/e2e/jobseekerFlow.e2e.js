// Detox E2E test - Jobseeker user flow
describe('Jobseeker User Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadApp();
  });

  it('should complete jobseeker registration', async () => {
    // Navigate to signup
    await element(by.id('signup-link')).tap();
    
    // Select jobseeker role
    await element(by.id('role-jobseeker')).tap();
    
    // Fill in form
    await element(by.id('fullname-input')).typeText('John Doe');
    await element(by.id('username-input')).typeText('johndoe');
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('ValidPass123!');
    
    // Submit
    await element(by.id('signup-button')).tap();
    
    // Should navigate to email verification
    await expect(element(by.id('verify-email-screen'))).toBeVisible();
  });

  it('should complete jobseeker profile', async () => {
    // Navigate to profile completion (assuming already signed in)
    await element(by.id('complete-profile-button')).tap();
    
    // Fill in profile details
    await element(by.id('date-of-birth-input')).tap();
    await element(by.text('1990')).tap();
    await element(by.id('confirm-date')).tap();
    
    await element(by.id('gender-dropdown')).tap();
    await element(by.text('Male')).tap();
    
    await element(by.id('country-dropdown')).tap();
    await element(by.text('United States')).tap();
    
    await element(by.id('city-input')).typeText('New York');
    
    await element(by.id('education-dropdown')).tap();
    await element(by.text('Bachelor\'s Degree')).tap();
    
    await element(by.id('experience-dropdown')).tap();
    await element(by.text('Mid-level')).tap();
    
    // Add skills
    await element(by.id('skills-input')).tap();
    await element(by.text('React')).tap();
    await element(by.id('skills-input')).tap();
    await element(by.text('TypeScript')).tap();
    
    // Save profile
    await element(by.id('save-profile-button')).tap();
    
    // Should navigate to home screen
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should browse jobs on home screen', async () => {
    // Navigate to home
    await expect(element(by.id('home-screen'))).toBeVisible();
    
    // Wait for jobs to load
    await waitFor(element(by.id('job-list')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Should see job cards
    await expect(element(by.id('job-card-0'))).toBeVisible();
  });

  it('should search for jobs', async () => {
    await element(by.id('search-input')).typeText('React Developer');
    await element(by.id('search-button')).tap();
    
    // Should show filtered results
    await waitFor(element(by.id('job-list')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should filter jobs by category', async () => {
    await element(by.id('category-filter')).tap();
    await element(by.text('Engineering')).tap();
    
    // Should show filtered jobs
    await waitFor(element(by.id('job-list')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should view job details', async () => {
    await element(by.id('job-card-0')).tap();
    
    // Should navigate to job details
    await expect(element(by.id('job-details-screen'))).toBeVisible();
    await expect(element(by.text('Job Description'))).toBeVisible();
    await expect(element(by.text('Requirements'))).toBeVisible();
  });

  it('should bookmark a job', async () => {
    await element(by.id('job-card-0')).tap();
    await element(by.id('bookmark-button')).tap();
    
    // Should show bookmarked state
    await expect(element(by.id('bookmark-button'))).toHaveLabel('Bookmarked');
  });

  it('should apply for a job', async () => {
    await element(by.id('job-card-0')).tap();
    await element(by.id('apply-button')).tap();
    
    // Should navigate to application screen
    await expect(element(by.id('application-screen'))).toBeVisible();
    
    // Fill in cover letter
    await element(by.id('cover-letter-input')).typeText('I am interested in this position');
    
    // Submit application
    await element(by.id('submit-application-button')).tap();
    
    // Should show success message
    await expect(element(by.text('Application submitted'))).toBeVisible();
  });

  it('should view applications', async () => {
    await element(by.id('applications-tab')).tap();
    
    // Should navigate to applications screen
    await expect(element(by.id('applications-screen'))).toBeVisible();
    
    // Should see application list
    await expect(element(by.id('application-list'))).toBeVisible();
  });

  it('should filter applications by status', async () => {
    await element(by.id('applications-tab')).tap();
    await element(by.id('status-filter')).tap();
    await element(by.text('Pending')).tap();
    
    // Should show filtered applications
    await expect(element(by.id('application-list'))).toBeVisible();
  });

  it('should withdraw an application', async () => {
    await element(by.id('applications-tab')).tap();
    await element(by.id('application-card-0')).swipe('left');
    await element(by.id('withdraw-button')).tap();
    
    // Should confirm withdrawal
    await element(by.id('confirm-withdraw')).tap();
    
    // Application should be removed
    await waitFor(element(by.id('application-card-0')))
      .not.toBeVisible()
      .withTimeout(3000);
  });

  it('should view saved jobs', async () => {
    await element(by.id('saved-jobs-tab')).tap();
    
    // Should navigate to saved jobs screen
    await expect(element(by.id('saved-jobs-screen'))).toBeVisible();
    
    // Should see bookmarked jobs
    await expect(element(by.id('saved-jobs-list'))).toBeVisible();
  });

  it('should remove a saved job', async () => {
    await element(by.id('saved-jobs-tab')).tap();
    await element(by.id('saved-job-card-0')).swipe('left');
    await element(by.id('remove-bookmark-button')).tap();
    
    // Job should be removed
    await waitFor(element(by.id('saved-job-card-0')))
      .not.toBeVisible()
      .withTimeout(3000);
  });

  it('should view profile', async () => {
    await element(by.id('profile-tab')).tap();
    
    // Should navigate to profile screen
    await expect(element(by.id('profile-screen'))).toBeVisible();
    
    // Should see user information
    await expect(element(by.text('John Doe'))).toBeVisible();
    await expect(element(by.text('@johndoe'))).toBeVisible();
  });

  it('should edit profile', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('edit-profile-button')).tap();
    
    // Should navigate to edit profile screen
    await expect(element(by.id('edit-profile-screen'))).toBeVisible();
    
    // Make changes
    await element(by.id('city-input')).clearText();
    await element(by.id('city-input')).typeText('Los Angeles');
    
    // Save changes
    await element(by.id('save-button')).tap();
    
    // Should return to profile screen
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });

  it('should sign out', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('sign-out-button')).tap();
    
    // Should confirm sign out
    await element(by.id('confirm-sign-out')).tap();
    
    // Should navigate to sign in screen
    await expect(element(by.id('signin-screen'))).toBeVisible();
  });
});
