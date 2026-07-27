# Testing Section for Word Document Conversion

**Instructions for Claude AI:** Please convert this markdown document into a professional Word document with proper formatting, headings, tables, and academic style suitable for a project report or thesis.

---

## 4.2. Testing

Testing was conducted throughout the development of the Talenta application to verify that each feature behaves correctly and that the integrated system meets the requirements. All testing was performed on Android devices using Expo Go during development and on a production build for final acceptance verification.

### 4.2.1. Introduction

The testing process covered all three user roles (jobseeker, employer, admin) and all major functional areas including authentication, profile management, skill-based job search, bookmarks, application submission and tracking, employer job management, push notifications, reporting, and moderation. Both functional correctness and non-functional qualities (response time, row-level security enforcement, and cross-platform compatibility) were evaluated.

### 4.2.2. Unit Testing

Unit testing verified individual components and utility functions in isolation before integration.

**Component Testing:** Each React Native screen component was tested in the Expo Go client to confirm that UI elements render correctly, state transitions behave as expected, and form validation rejects invalid inputs before submission.

**Utility Function Testing:** Critical utility functions were tested using Jest to ensure correct behavior:

- **Username Utilities:** Username validation, base username generation, and username suggestion algorithms were tested with 21 test cases covering edge cases, special characters, and availability scenarios.
- **Skill Matching Algorithm:** The skill overlap matching function was tested with 12 test cases verifying correct score calculation, label assignment, and job sorting functionality.
- **Validation Functions:** Email, password, and username validation logic was tested with 47 test cases covering valid/invalid inputs, edge cases, and security requirements.

**Supabase Query Testing:** Individual database queries including the skills array-overlap matching query for job search and the application status update with history recording were tested directly in the Supabase SQL editor to confirm correct results.

**Authentication Flow Testing:** The Supabase Auth sign-up, email verification, login, and logout flows were tested for all three role types to confirm correct JWT token issuance and role-specific profile creation.

### 4.2.3. Validation Testing

Validation testing confirmed that the implemented system satisfies its specified requirements.

**Requirements Fulfillment:** Each functional requirement was verified against the running application, confirming all behaviors are correctly implemented.

**Role-Based Access Control:** Supabase row-level security policies were validated by attempting cross-role data access. All unauthorized attempts were correctly rejected with a policy violation.

**Input Validation:** Required fields, email format, password strength, and skills array inputs were tested with valid and invalid data to confirm appropriate error messages and prevention of bad submissions.

**Cross-Platform Build:** An iOS build was generated through the Expo managed pipeline and ran correctly in an iOS simulator, confirming the single-codebase cross-platform capability.

### 4.2.4. Integration Testing

Integration testing confirmed that all system components work correctly as an end-to-end workflow.

**Registration to Profile Flow:** The full path from registration through email verification, login, role assignment, and profile creation was tested, confirming all tables are updated consistently.

**Job Posting to Application Flow:** An employer posted a job with required skills; a job seeker with matching skills found the listing through search, applied, and the application appeared immediately in both the employer's applicant list and the job seeker's tracker.

**Status Update to Notification Flow:** An employer updated an application status to shortlisted. The application_status_history table recorded the change, the status updated on the job seeker's tracker, and a push notification was delivered within two seconds.

**Moderation Flow:** An admin applied a moderation action to a test account. The moderation_actions table recorded the action, account_status updated correctly, and the target user received a moderation_warning notification.

### 4.2.5. Functional Testing Summary

Functional testing verified each feature of the Talenta system end-to-end across all three roles. The table below summarizes the key functional test results.

**Table 4.1: Functional Testing Summary**

| Feature Tested | Test Description | Result |
|----------------|------------------|--------|
| User Registration and Login | Registration for Job Seeker and Employer roles, email verification, login, and role-based routing | Passed |
| Profile Management | Jobseeker skill entry, CV upload, and employer company profile and verification document submission | Passed |
| Job Search and Skill-Based Matching | Skills array-overlap matching returns only listings whose skills_required overlaps the seeker's skills. Filters for location and experience level applied | Passed |
| Job Bookmarks | Bookmark and un-bookmark a listing; confirmed Saved tab updates in real time | Passed |
| Application Submission and Tracking | Full cycle: submit application, employer moves it through all five statuses, seeker's tracker updates live | Passed |
| Push Notifications | All notification types triggered and delivered to target devices within the expected timeframe | Passed |
| Employer Job Posting and Applicant Review | Employer creates a listing, views applicant list, updates status with feedback | Passed |
| Reporting and Moderation | User files a report; admin resolves it and applies a moderation action; account_status and notification updated | Passed |

### 4.2.6. Acceptance Testing Report

Acceptance testing was the final verification phase, confirming that the Talenta application satisfies all user requirements as a complete, integrated system.

**Table 4.2: Acceptance Testing Report — Talenta Mobile Job-Finder Application**

| Test Case | Scenario | Expected Result | Actual Result | Status |
|-----------|----------|-----------------|---------------|--------|
| User Registration and Login | New users register, verify email, and log in as Job Seeker or Employer | Each role routed to its correct dashboard after login | All users authenticated and routed correctly for both roles | Passed |
| Job Seeker Profile Setup | Jobseeker completes profile with skills, education level, experience, and uploads a CV | Profile saved; profile_completed flag set to true; CV stored in Supabase Storage | All profile fields saved correctly; CV uploaded successfully | Passed |
| Employer Profile and Verification | Employer completes company profile and submits business verification documents | Documents uploaded; business_verification_status updated to pending_review | Documents uploaded and status updated as expected | Passed |
| Job Search and Skill Matching | Job seeker searches with skills that match only a subset of listings | Only listings with overlapping skills_required are returned | Correct listings returned; non-matching listings correctly excluded | Passed |
| Application Submission and Tracking | Jobseeker applies; employer updates status through all five stages | Tracker shows correct status; history records every change with actor and reason | All status transitions tracked correctly; history table updated at each stage | Passed |
| Push Notifications | Status change, new application, business approval, and moderation events triggered | Correct notification type delivered to target user within 5 seconds | All notification types delivered correctly within the expected timeframe | Passed |
| Employer Job Posting and Review | Employer posts a listing, views applicant list, updates status | Listing appears in search results; applicant list reflects new applications | All employer functions performed correctly end-to-end | Passed |
| Reporting and Moderation | User raises a report; admin resolves it and applies a moderation action | Report recorded; moderation action applied; account status and notification updated | Full moderation flow completed correctly for all action types | Passed |
| Cross-Platform Compatibility | Application compiled for Android and iOS using Expo build pipeline | Runs correctly on Android device and iOS simulator | Android tested on device; iOS build not successful due to lack of Apple Developer account | Not fully passed |

### 4.2.7. Automated Testing Implementation

To ensure code quality and maintainability, a comprehensive automated testing suite was implemented using Jest and React Native Testing Library.

**Test Coverage:** The automated test suite includes 129 tests across 9 test suites:

- Unit Tests: 33 tests covering username utilities and skill matching algorithms
- Validation Tests: 47 tests covering email, password, and username validation
- Integration Tests: 22 tests covering navigation, Supabase client, and authentication flows
- E2E Tests: 27 Detox tests for end-to-end user workflows

**Test Execution:** All tests pass successfully with 100% pass rate, ensuring that critical business logic and integration points function correctly.

**Continuous Integration:** The test suite is configured to run on demand and can be integrated into CI/CD pipelines for automated regression testing.

---

**End of Testing Section**
