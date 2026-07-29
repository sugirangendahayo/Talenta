// types/admin.types.ts
import { BusinessVerificationStatus, PremiumPlan } from "./verification.types";

export interface AdminStats {
  totalEmployers: number;
  totalJobseekers: number;
  totalJobs: number;
  totalApplications: number;
}

export interface AdminEmployer {
  id: string;
  company_name: string;
  company_username: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  business_license_url?: string;
  verification_document_url?: string;
  is_verified: boolean;
  business_verification_status?: BusinessVerificationStatus;
  business_rejection_reason?: string | null;
  business_docs_urls?: string[];
  business_docs_submitted_at?: string | null;
  premium_plan?: PremiumPlan;
  premium_activated_at?: string | null;
  premium_expires_at?: string | null;
  profile_image_url?: string | null;
  profile_completed: boolean;
  created_at: string;
}

export interface AdminJobseeker {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  education_level?: string;
  experience_level?: string;
  id_document_url?: string;
  cv_document_url?: string;
  premium_plan?: PremiumPlan;
  profile_image_url?: string | null;
  profile_completed: boolean;
  created_at: string;
}

export type JobStatus = "active" | "expired" | "closed" | "paused" | "draft";

export interface AdminJob {
  id: string;
  employer_id: string;
  title: string;
  description?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  status: JobStatus;
  category?: string;
  created_at: string;
  expires_at?: string;
  // Joined
  employer_profiles?: {
    company_name: string;
    email: string;
    business_verification_status?: BusinessVerificationStatus;
    premium_plan?: PremiumPlan;
  };
}

export type UserRole = "jobseeker" | "employer" | "admin";

export interface AdminUser {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  account_status?: "active" | "suspended" | "banned" | "under_review";
  // Joined from auth.users via RPC or profiles
  email?: string;
  // Enriched client-side in getAdminUsers() from the role-specific profile
  // tables (jobseeker_profiles / employer_profiles), since the base
  // `profiles` row itself has no display name.
  display_name?: string;
  username?: string;
  profile_image_url?: string | null;
}

export interface AdminAnalytics {
  verifiedEmployers: number;
  unverifiedEmployers: number;
  jobsByStatus: Record<JobStatus, number>;
  totalApplications: number;
  jobseekerWithDocs: number;
  jobseekerWithoutDocs: number;
}

export interface RecentActivity {
  recentEmployers: AdminEmployer[];
  recentJobseekers: AdminJobseeker[];
  recentJobs: AdminJob[];
}

// ── Moderation / Reports ─────────────────────────────────────────────────────

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportReason = 'spam' | 'harassment' | 'fraud' | 'inappropriate' | 'suspicious' | 'other';
export type ReportTargetType = 'user' | 'job' | 'post' | 'comment' | 'company';

export interface AdminReport {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined via RPC/view — reporter display info
  reporter?: {
    id: string;
    role: string;
    // name pulled from jobseeker_profiles or employer_profiles
    display_name?: string;
    email?: string;
  };
}

export type ModerationActionType =
  | 'warning' | 'under_review' | 'suspension' | 'ban' | 'unban'
  | 'flag_suspicious' | 'verification_revoked' | 'unsuspend';

export interface ModerationAction {
  id: string;
  admin_id: string | null;
  target_user_id: string;
  action_type: ModerationActionType;
  reason: string;
  internal_notes: string | null;
  duration_hours: number | null;
  created_at: string;
}
