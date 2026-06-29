// lib/adminService.ts
// All Supabase queries for the Admin module

import { supabase } from "@/lib/supabase";
import type {
  AdminAnalytics,
  AdminEmployer,
  AdminJob,
  AdminJobseeker,
  AdminStats,
  AdminUser,
  JobStatus,
  RecentActivity,
} from "@/types/admin.types";
import { approveBusinessVerification, rejectBusinessVerification } from "./verificationService";

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const [employers, jobseekers, jobs, applications] =
    await Promise.all([
      supabase
        .from("employer_profiles")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("jobseeker_profiles")
        .select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true }),
    ]);

  return {
    totalEmployers: employers.count ?? 0,
    totalJobseekers: jobseekers.count ?? 0,
    totalJobs: jobs.count ?? 0,
    totalApplications: applications.count ?? 0,
  };
}

// ─── Recent Activity ─────────────────────────────────────────────────────────

export async function getRecentActivity(): Promise<RecentActivity> {
  const [employers, jobseekers, jobs] = await Promise.all([
    supabase
      .from("employer_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("jobseeker_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("jobs")
      .select("*, employer_profiles(company_name, email, business_verification_status, premium_plan)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    recentEmployers: (employers.data as AdminEmployer[]) ?? [],
    recentJobseekers: (jobseekers.data as AdminJobseeker[]) ?? [],
    recentJobs: (jobs.data as AdminJob[]) ?? [],
  };
}

// ─── Employers ───────────────────────────────────────────────────────────────

export async function getEmployers(): Promise<AdminEmployer[]> {
  const { data, error } = await supabase
    .from("employer_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AdminEmployer[]) ?? [];
}

export async function verifyEmployer(id: string): Promise<void> {
  await approveBusinessVerification(id);
}

export async function unverifyEmployer(id: string): Promise<void> {
  await rejectBusinessVerification(id, "Manually unverified by admin");
}

export async function rejectEmployerWithReason(id: string, reason: string): Promise<void> {
  await rejectBusinessVerification(id, reason);
}

// ─── Jobseekers ──────────────────────────────────────────────────────────────

export async function getJobseekers(): Promise<AdminJobseeker[]> {
  const { data, error } = await supabase
    .from("jobseeker_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AdminJobseeker[]) ?? [];
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export async function getAdminJobs(): Promise<AdminJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, employer_profiles(company_name, email, business_verification_status, premium_plan)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AdminJob[]) ?? [];
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
): Promise<void> {
  const { error } = await supabase
    .from("jobs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AdminUser[]) ?? [];
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AdminAnalytics> {
  const [employers, jobs, applications, jobseekers] =
    await Promise.all([
      supabase.from("employer_profiles").select("is_verified"),
      supabase.from("jobs").select("status"),
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("jobseeker_profiles")
        .select("id_document_url, cv_document_url"),
    ]);

  const employerData = employers.data ?? [];
  const jobData = jobs.data ?? [];
  const jobseekerData = jobseekers.data ?? [];

  const verifiedEmployers = employerData.filter((e) => e.is_verified).length;
  const unverifiedEmployers = employerData.filter((e) => !e.is_verified).length;

  const jobsByStatus: Record<JobStatus, number> = {
    active: 0,
    expired: 0,
    closed: 0,
    paused: 0,
    draft: 0,
  };
  jobData.forEach((j) => {
    const s = j.status as JobStatus;
    if (s in jobsByStatus) jobsByStatus[s]++;
  });

  const jobseekerWithDocs = jobseekerData.filter(
    (js) => js.id_document_url || js.cv_document_url,
  ).length;
  const jobseekerWithoutDocs = jobseekerData.length - jobseekerWithDocs;

  return {
    verifiedEmployers,
    unverifiedEmployers,
    jobsByStatus,
    totalApplications: applications.count ?? 0,
    jobseekerWithDocs,
    jobseekerWithoutDocs,
  };
}
