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
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  education_level?: string;
  experience_level?: string;
  id_document_url?: string;
  cv_document_url?: string;
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
  // Joined from auth.users via RPC or profiles
  email?: string;
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
