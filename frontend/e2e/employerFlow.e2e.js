// Detox E2E test - Employer user flow
describe('Employer User Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadApp();
  });

  it('should complete employer registration', async () => {
    // Navigate to signup
    await element(by.id('signup-link')).tap();
    
    // Select employer role
    await element(by.id('role-employer')).tap();
    
    // Fill in form
    await element(by.id('company-name-input')).typeText('Tech Company');
    await element(by.id('company-username-input')).typeText('techcompany');
    await element(by.id('email-input')).typeText('employer@example.com');
    await element(by.id('password-input')).typeText('ValidPass123!');
    await element(by.id('website-input')).typeText('https://example.com');
    
    // Submit
    await element(by.id('signup-button')).tap();
    
    // Should navigate to email verification
    await expect(element(by.id('verify-email-screen'))).toBeVisible();
  });

  it('should complete employer profile', async () => {
    // Navigate to profile completion
    await element(by.id('complete-profile-button')).tap();
    
    // Fill in profile details
    await element(by.id('country-dropdown')).tap();
    await element(by.text('United States')).tap();
    
    await element(by.id('city-input')).typeText('San Francisco');
    
    await element(by.id('phone-input')).typeText('+1234567890');
    
    await element(by.id('address-input')).typeText('123 Tech Street');
    
    // Save profile
    await element(by.id('save-profile-button')).tap();
    
    // Should navigate to dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  it('should view employer dashboard', async () => {
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
    
    // Should see dashboard stats
    await expect(element(by.text('Posted Jobs'))).toBeVisible();
    await expect(element(by.text('Applications'))).toBeVisible();
  });

  it('should post a new job', async () => {
    await element(by.id('post-job-button')).tap();
    
    // Should navigate to post job screen
    await expect(element(by.id('post-job-screen'))).toBeVisible();
    
    // Fill in job details
    await element(by.id('job-title-input')).typeText('Senior React Developer');
    await element(by.id('job-description-input')).typeText('Looking for an experienced React developer');
    await element(by.id('location-input')).typeText('Remote');
    
    await element(by.id('salary-min-input')).typeText('80000');
    await element(by.id('salary-max-input')).typeText('120000');
    
    await element(by.id('job-type-dropdown')).tap();
    await element(by.text('Full-time')).tap();
    
    await element(by.id('category-dropdown')).tap();
    await element(by.text('Engineering')).tap();
    
    await element(by.id('experience-dropdown')).tap();
    await element(by.text('Senior')).tap();
    
    // Add skills
    await element(by.id('skills-input')).tap();
    await element(by.text('React')).tap();
    await element(by.id('skills-input')).tap();
    await element(by.text('TypeScript')).tap();
    
    // Post job
    await element(by.id('post-job-button')).tap();
    
    // Should show success message
    await expect(element(by.text('Job posted successfully'))).toBeVisible();
  });

  it('should view posted jobs', async () => {
    await element(by.id('my-jobs-tab')).tap();
    
    // Should navigate to my jobs screen
    await expect(element(by.id('my-jobs-screen'))).toBeVisible();
    
    // Should see job list
    await expect(element(by.id('job-list'))).toBeVisible();
  });

  it('should edit a job', async () => {
    await element(by.id('my-jobs-tab')).tap();
    await element(by.id('job-card-0')).tap();
    await element(by.id('edit-job-button')).tap();
    
    // Should navigate to edit job screen
    await expect(element(by.id('edit-job-screen'))).toBeVisible();
    
    // Make changes
    await element(by.id('job-title-input')).clearText();
    await element(by.id('job-title-input')).typeText('Senior React Developer - Updated');
    
    // Save changes
    await element(by.id('save-button')).tap();
    
    // Should return to job details
    await expect(element(by.id('job-details-screen'))).toBeVisible();
  });

  it('should pause a job', async () => {
    await element(by.id('my-jobs-tab')).tap();
    await element(by.id('job-card-0')).swipe('left');
    await element(by.id('pause-job-button')).tap();
    
    // Should confirm pause
    await element(by.id('confirm-pause')).tap();
    
    // Job status should be updated
    await expect(element(by.id('job-status-paused'))).toBeVisible();
  });

  it('should view job applications', async () => {
    await element(by.id('my-jobs-tab')).tap();
    await element(by.id('job-card-0')).tap();
    await element(by.id('view-applications-button')).tap();
    
    // Should navigate to applications screen
    await expect(element(by.id('job-applications-screen'))).toBeVisible();
    
    // Should see application list
    await expect(element(by.id('application-list'))).toBeVisible();
  });

  it('should review an application', async () => {
    await element(by.id('application-card-0')).tap();
    
    // Should show application details
    await expect(element(by.id('application-details-screen'))).toBeVisible();
    await expect(element(by.text('Cover Letter'))).toBeVisible();
  });

  it('should shortlist an applicant', async () => {
    await element(by.id('application-card-0')).swipe('right');
    await element(by.id('shortlist-button')).tap();
    
    // Application status should be updated
    await expect(element(by.id('application-status-shortlisted'))).toBeVisible();
  });

  it('should reject an applicant', async () => {
    await element(by.id('application-card-0')).swipe('left');
    await element(by.id('reject-button')).tap();
    
    // Should confirm rejection
    await element(by.id('confirm-reject')).tap();
    
    // Application should be removed
    await waitFor(element(by.id('application-card-0')))
      .not.toBeVisible()
      .withTimeout(3000);
  });

  it('should upload business documents', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('business-verification-button')).tap();
    
    // Should navigate to business verification screen
    await expect(element(by.id('business-verification-screen'))).toBeVisible();
    
    // Upload document
    await element(by.id('upload-document-button')).tap();
    // Note: Document picker interaction may need special handling
    
    // Submit for review
    await element(by.id('submit-review-button')).tap();
    
    // Should show success message
    await expect(element(by.text('Documents submitted for review'))).toBeVisible();
  });

  it('should view verification status', async () => {
    await element(by.id('profile-tab')) .tap();
    await element(by.id('business-verification-button')).tap();
    
    // Should show current status
    await expect(element(by.id('verification-status'))).toBeVisible();
  });

  it('should view notifications', async () => {
    await element(by.id('notifications-tab')).tap();
    
    // Should navigate to notifications screen
    await expect(element(by.id('notifications-screen'))).toBeVisible();
    
    // Should see notification list
    await expect(element(by.id('notification-list'))).toBeVisible();
  });

  it('should mark notification as read', async () => {
    await element(by.id('notifications-tab')).tap();
    await element(by.id('notification-card-0')).tap();
    
    // Should mark as read
    await expect(element(by.id('notification-card-0'))).not.toHaveLabel('unread');
  });

  it('should view employer profile', async () => {
    await element(by.id('profile-tab')).tap();
    
    // Should navigate to profile screen
    await expect(element(by.id('profile-screen'))).toBeVisible();
    
    // Should see company information
    await expect(element(by.text('Tech Company'))).toBeVisible();
    await expect(element(by.text('@techcompany'))).toBeVisible();
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
