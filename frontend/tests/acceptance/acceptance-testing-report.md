# Acceptance Testing Report - Talenta Application

**Project:** Talenta - Job Matching Platform  
**Version:** 1.0.0  
**Date:** July 24, 2026  
**Test Engineer:** QA Team  

---

## Executive Summary

This acceptance testing report documents the test cases for the Talenta job matching application. The application serves three user roles: jobseekers, employers, and administrators. Tests cover critical user workflows, authentication, navigation, and core business functionality.

---

## Test Cases

### AUTH-001: User Registration - Jobseeker

| Field | Value |
|-------|-------|
| **Test ID** | AUTH-001 |
| **Feature** | Authentication |
| **Objective** | Verify that a new jobseeker can successfully register an account |
| **Preconditions** | App is installed and launched; User has not seen onboarding |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Launch the application
2. Complete onboarding flow (Step 1 → Step 2)
3. Tap "Get Started" button
4. Tap "Sign Up" link
5. Select "Jobseeker" role
6. Enter full name: "John Doe"
7. Enter username: "johndoe"
8. Enter email: "john@example.com"
9. Enter password: "ValidPass123!"
10. Tap "Sign Up" button
11. Verify email verification screen appears

**Expected Result:** User is registered successfully and redirected to email verification screen

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Username availability check should occur in real-time

---

### AUTH-002: User Registration - Employer

| Field | Value |
|-------|-------|
| **Test ID** | AUTH-002 |
| **Feature** | Authentication |
| **Objective** | Verify that a new employer can successfully register an account |
| **Preconditions** | App is installed and launched |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Launch the application
2. Navigate to sign up screen
3. Select "Employer" role
4. Enter company name: "Tech Company"
5. Enter company username: "techcompany"
6. Enter email: "employer@example.com"
7. Enter password: "ValidPass123!"
8. Enter website: "https://example.com" (optional)
9. Tap "Sign Up" button
10. Verify email verification screen appears

**Expected Result:** Employer is registered successfully and redirected to email verification screen

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Company username should be unique across all employers

---

### AUTH-003: User Sign In

| Field | Value |
|-------|-------|
| **Test ID** | AUTH-003 |
| **Feature** | Authentication |
| **Objective** | Verify that registered users can sign in with valid credentials |
| **Preconditions** | User account exists and is verified |
| **Priority** | Critical |
| **Status** | Pending |

**Test Steps:**
1. Launch the application
2. Navigate to sign in screen
3. Enter valid email: "test@example.com"
4. Enter valid password: "ValidPass123!"
5. Tap "Sign In" button

**Expected Result:** User is authenticated and redirected to role-specific dashboard

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test for all three user roles

---

### AUTH-004: Invalid Sign In Attempt

| Field | Value |
|-------|-------|
| **Test ID** | AUTH-004 |
| **Feature** | Authentication |
| **Objective** | Verify that invalid credentials are rejected with appropriate error message |
| **Preconditions** | Sign in screen is displayed |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to sign in screen
2. Enter invalid email: "invalid@example.com"
3. Enter invalid password: "WrongPassword123!"
4. Tap "Sign In" button

**Expected Result:** Error message "Invalid login credentials" is displayed

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test various invalid credential combinations

---

### AUTH-005: Password Recovery

| Field | Value |
|-------|-------|
| **Test ID** | AUTH-005 |
| **Feature** | Authentication |
| **Objective** | Verify that users can initiate password recovery |
| **Preconditions** | Sign in screen is displayed |
| **Priority** | Medium |
| **Status** | Pending |

**Test Steps:**
1. Navigate to sign in screen
2. Tap "Forgot Password?" link
3. Enter registered email: "test@example.com"
4. Tap "Send Reset Link" button

**Expected Result:** Password reset email is sent; confirmation message displayed

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Requires email service integration

---

### NAV-001: Role-Based Navigation

| Field | Value |
|-------|-------|
| **Test ID** | NAV-001 |
| **Feature** | Navigation |
| **Objective** | Verify that users are redirected to correct dashboard based on role |
| **Preconditions** | User is signed in |
| **Priority** | Critical |
| **Status** | Pending |

**Test Steps:**
1. Sign in as jobseeker
2. Verify navigation to jobseeker dashboard
3. Sign out
4. Sign in as employer
5. Verify navigation to employer dashboard
6. Sign out
7. Sign in as admin
8. Verify navigation to admin dashboard

**Expected Result:** Each role is redirected to appropriate dashboard

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test cross-role access prevention

---

### NAV-002: Protected Route Access

| Field | Value |
|-------|-------|
| **Test ID** | NAV-002 |
| **Feature** | Navigation |
| **Objective** | Verify that protected routes redirect unauthenticated users to sign in |
| **Preconditions** | User is not signed in |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Ensure user is signed out
2. Attempt to access protected route directly (e.g., /jobseekers/Home)
3. Verify redirection to sign in screen

**Expected Result:** Unauthenticated users are redirected to sign in screen

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test multiple protected routes

---

### JOB-001: Job Search and Filtering

| Field | Value |
|-------|-------|
| **Test ID** | JOB-001 |
| **Feature** | Job Search |
| **Objective** | Verify that jobseekers can search and filter jobs |
| **Preconditions** | User is signed in as jobseeker |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to jobseeker home screen
2. Enter search term: "React Developer"
3. Tap search button
4. Verify filtered results
5. Select category filter: "Engineering"
6. Verify category-filtered results
7. Select experience level filter: "Senior"
8. Verify experience-filtered results

**Expected Result:** Jobs are correctly filtered based on search and filter criteria

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test various filter combinations

---

### JOB-002: Job Application

| Field | Value |
|-------|-------|
| **Test ID** | JOB-002 |
| **Feature** | Job Application |
| **Objective** | Verify that jobseekers can apply for jobs |
| **Preconditions** | User is signed in as jobseeker with completed profile |
| **Priority** | Critical |
| **Status** | Pending |

**Test Steps:**
1. Navigate to job details screen
2. Tap "Apply" button
3. Enter cover letter: "I am interested in this position"
4. Tap "Submit Application" button
5. Verify success message
6. Navigate to applications screen
7. Verify application appears in list

**Expected Result:** Application is submitted successfully and appears in applications list

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test application without cover letter (if optional)

---

### JOB-003: Job Bookmarking

| Field | Value |
|-------|-------|
| **Test ID** | JOB-003 |
| **Feature** | Job Bookmarking |
| **Objective** | Verify that jobseekers can bookmark jobs for later |
| **Preconditions** | User is signed in as jobseeker |
| **Priority** | Medium |
| **Status** | Pending |

**Test Steps:**
1. Navigate to job details screen
2. Tap bookmark button
3. Verify bookmarked state
4. Navigate to saved jobs screen
5. Verify job appears in saved list
6. Tap bookmark button again to remove
7. Verify job is removed from saved list

**Expected Result:** Jobs can be bookmarked and unbookmarked successfully

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test bookmark persistence across app restarts

---

### EMP-001: Job Posting

| Field | Value |
|-------|-------|
| **Test ID** | EMP-001 |
| **Feature** | Job Posting |
| **Objective** | Verify that employers can post new jobs |
| **Preconditions** | User is signed in as employer with completed profile |
| **Priority** | Critical |
| **Status** | Pending |

**Test Steps:**
1. Navigate to employer dashboard
2. Tap "Post Job" button
3. Enter job title: "Senior React Developer"
4. Enter job description: "Looking for experienced developer"
5. Enter location: "Remote"
6. Enter salary range: 80000 - 120000
7. Select job type: "Full-time"
8. Select category: "Engineering"
9. Select experience level: "Senior"
10. Add skills: React, TypeScript
11. Tap "Post Job" button
12. Verify success message
13. Navigate to my jobs screen
14. Verify job appears in list

**Expected Result:** Job is posted successfully and appears in employer's job list

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test all required field validations

---

### EMP-002: Application Management

| Field | Value |
|-------|-------|
| **Test ID** | EMP-002 |
| **Feature** | Application Management |
| **Objective** | Verify that employers can review and manage job applications |
| **Preconditions** | Employer has posted jobs with applications |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to my jobs screen
2. Tap on a job with applications
3. Tap "View Applications"
4. Review application details
5. Swipe right to shortlist applicant
6. Verify status change to "Shortlisted"
7. Swipe left to reject applicant
8. Confirm rejection
9. Verify application is removed

**Expected Result:** Employers can successfully manage application statuses

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test all status transitions

---

### EMP-003: Business Verification

| Field | Value |
|-------|-------|
| **Test ID** | EMP-003 |
| **Feature** | Business Verification |
| **Objective** | Verify that employers can submit business verification documents |
| **Preconditions** | User is signed in as employer |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to employer profile
2. Tap "Business Verification" button
3. Tap "Upload Document" button
4. Select business license document
5. Tap "Submit for Review" button
6. Verify submission confirmation
7. Check verification status display

**Expected Result:** Documents are uploaded successfully and status is updated to "Pending Review"

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test document upload with various file types

---

### PROF-001: Profile Completion - Jobseeker

| Field | Value |
|-------|-------|
| **Test ID** | PROF-001 |
| **Feature** | Profile Management |
| **Objective** | Verify that jobseekers can complete their profile |
| **Preconditions** | User is signed in as jobseeker with incomplete profile |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to profile completion screen
2. Enter date of birth
3. Select gender
4. Select country
5. Enter city
6. Select education level
7. Select experience level
8. Add skills: React, TypeScript, Node.js
9. Upload ID document (optional)
10. Upload CV document (optional)
11. Tap "Save Profile" button
12. Verify success message
13. Navigate to profile screen
14. Verify all information is displayed

**Expected Result:** Profile is completed successfully and all information is saved”

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test with and without optional documents

---

### PROF-002: Profile Completion - Employer

| Field | Value |
|-------|-------|
| **Test ID** | PROF-002 |
| **Feature** | Profile Management |
| **Objective** | Verify that employers can complete their profile |
| **Preconditions** | User is signed in as employer with incomplete profile |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to profile completion screen
2. Select country
3. Enter city
4. Enter phone number
5. Enter company address
6. Upload business license
7. Upload verification document
8. Tap "Save Profile" button
9. Verify success message
10. Navigate to profile screen
11. Verify all information is displayed

**Expected Result:** Profile is completed successfully and all information is saved

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test document upload validation

---

### NOTIF-001: Notification Display

| Field | Value |
|-------|-------|
| **Test ID** | NOTIF-001 |
| **Feature** | Notifications |
| **Objective** | Verify that users can view and manage notifications |
| **Preconditions** | User is signed in and has notifications |
| **Priority** | Medium |
| **Status** | Pending |

**Test Steps:**
1. Navigate to notifications screen
2. Verify notification list is displayed
3. Tap on a notification
4. Verify notification is marked as read
5. Verify navigation to related content (if applicable)

**Expected Result:** Notifications are displayed correctly and can be marked as read

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test different notification types

---

### ADMIN-001: User Management

| Field | Value |
|-------|-------|
| **Test ID** | ADMIN-001 |
| **Feature** | Admin Dashboard |
| **Objective** | Verify that admins can view and manage users |
| **Preconditions** | User is signed in as admin |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to admin dashboard
2. Tap "Users" tab
3. Verify user list is displayed
4. Filter users by role (jobseeker/employer)
5. View user details
6. Verify user information is correct

**Expected Result:** Admin can view all users and filter by role

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test user search functionality

---

### ADMIN-002: Business Verification Approval

| Field | Value |
|-------|-------|
| **Test ID** | ADMIN-002 |
| **Feature** | Admin Dashboard |
| **Objective** | Verify that admins can approve business verification requests |
| **Preconditions** | User is signed in as admin; pending verification requests exist |
| **Priority** | High |
| **Status** | Pending |

**Test Steps:**
1. Navigate to admin dashboard
2. Navigate to employers list
3. Select employer with pending verification
4. Review submitted documents
5. Tap "Approve" button
6. Verify confirmation
7. Check employer status is updated to "Approved"

**Expected Result:** Business verification is approved successfully

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test rejection with reason

---

### ADMIN-003: Job Moderation

| Field | Value |
|-------|-------|
| **Test ID** | ADMIN-003 |
| **Feature** | Admin Dashboard |
| **Objective** | Verify that admins can moderate job postings |
| **Preconditions** | User is signed in as admin |
| **Priority** | Medium |
| **Status** | Pending |

**Test Steps:**
1. Navigate to admin dashboard
2. Tap "Jobs" tab
3. Select a job
4. Change job status to "Paused" or "Closed"
5. Verify status change
6. Navigate to jobseeker home
7. Verify job is not visible (if closed/paused)

**Expected Result:** Admin can successfully moderate job postings

**Actual Result:** [To be filled during testing]

**Pass/Fail:** [To be determined]

**Notes:** Test all status transitions

---

## Test Summary

| Category | Total Tests | Passed | Failed | Pending |
|----------|-------------|--------|--------|---------|
| Authentication | 5 | 0 | 0 | 5 |
| Navigation | 2 | 0 | 0 | 2 |
| Job Search & Application | 3 | 0 | 0 | 3 |
| Employer Features | 3 | 0 | 0 | 3 |
| Profile Management | 2 | 0 | 0 | 2 |
| Notifications | 1 | 0 | 0 | 1 |
| Admin Features | 3 | 0 | 0 | 3 |
| **Total** | **19** | **0** | **0** | **19** |

---

## Test Environment

- **Device:** iOS Simulator (iPhone 15) / Android Emulator (Pixel 6)
- **OS:** iOS 17.0 / Android 13.0
- **App Version:** 1.0.0
- **Test Framework:** Detox
- **Test Runner:** Jest

---

## Known Issues

None documented at this time.

---

## Recommendations

1. Implement automated test execution in CI/CD pipeline
2. Add performance testing for critical user flows
3. Implement accessibility testing
4. Add visual regression testing for UI components
5. Expand E2E test coverage for edge cases and error scenarios

---

## Sign-off

**Tested By:** ___________________  
**Date:** ___________________  
**Approved By:** ___________________  
**Date:** ___________________
