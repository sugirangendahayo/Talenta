// lib/adminService.ts
// All Supabase queries for the Admin module

import { supabase } from "@/lib/supabase";
import type {
  AdminAnalytics,
  AdminEmployer,
  AdminJob,
  AdminJobseeker,
  AdminReport,
  AdminStats,
  AdminUser,
  JobStatus,
  ModerationAction,
  RecentActivity,
  ReportStatus,
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
  const profiles = (data as AdminUser[]) ?? [];

  // `profiles` only carries `id`/`role`/`account_status` — the display name
  // and email live in the role-specific tables. Fetch both in parallel and
  // merge them in so the Users Overview screen can show real names instead
  // of raw UUIDs.
  const [{ data: jobseekers }, { data: employers }] = await Promise.all([
    supabase
      .from("jobseeker_profiles")
      .select("id, full_name, username, email, profile_image_url"),
    supabase
      .from("employer_profiles")
      .select("id, company_name, company_username, email, profile_image_url"),
  ]);

  const jobseekerMap = new Map((jobseekers ?? []).map((j) => [j.id, j]));
  const employerMap = new Map((employers ?? []).map((e) => [e.id, e]));

  return profiles.map((p) => {
    if (p.role === "jobseeker") {
      const js = jobseekerMap.get(p.id);
      return {
        ...p,
        display_name: js?.full_name || "Unnamed jobseeker",
        username: js?.username,
        email: js?.email ?? p.email,
        profile_image_url: js?.profile_image_url ?? null,
      };
    }
    if (p.role === "employer") {
      const emp = employerMap.get(p.id);
      return {
        ...p,
        display_name: emp?.company_name || "Unnamed employer",
        username: emp?.company_username,
        email: emp?.email ?? p.email,
        profile_image_url: emp?.profile_image_url ?? null,
      };
    }
    return { ...p, display_name: "Admin" };
  });
}

// ─── Bulk moderation ───────────────────────────────────────────────────────
// Thin wrappers that fan a single-user moderation RPC out across many users,
// used by the multi-select bulk-action sheets (Users Overview, Employers,
// Jobseekers). Every call is isolated so one failure doesn't abort the rest
// — the caller gets back per-user success/failure so it can report exactly
// what happened (e.g. "8 of 10 suspended, 2 failed").

export interface BulkActionResult {
  succeeded: string[];
  failed: { id: string; error: string }[];
}

async function runBulk(
  ids: string[],
  fn: (id: string) => PromiseLike<{ error: { message: string } | null }>,
): Promise<BulkActionResult> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const { error } = await fn(id);
        if (error) return { id, error: error.message };
        return { id, error: null };
      } catch (err) {
        return {
          id,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }),
  );

  return {
    succeeded: results.filter((r) => !r.error).map((r) => r.id),
    failed: results
      .filter((r): r is { id: string; error: string } => !!r.error)
      .map((r) => ({ id: r.id, error: r.error })),
  };
}

export async function bulkSuspendUsers(
  ids: string[],
  reason: string,
  hours: number,
): Promise<BulkActionResult> {
  return runBulk(ids, (id) =>
    supabase.rpc("admin_suspend_user", {
      target_user_id: id,
      suspend_reason: reason,
      hours,
    }),
  );
}

export async function bulkUnsuspendUsers(
  ids: string[],
  reason: string,
): Promise<BulkActionResult> {
  return runBulk(ids, (id) =>
    supabase.rpc("admin_unsuspend_user", {
      target_user_id: id,
      unsuspend_reason: reason,
    }),
  );
}

export async function bulkBanUsers(
  ids: string[],
  reason: string,
): Promise<BulkActionResult> {
  return runBulk(ids, (id) =>
    supabase.rpc("admin_ban_user", {
      target_user_id: id,
      ban_reason: reason,
    }),
  );
}

export async function bulkUnbanUsers(
  ids: string[],
  reason: string,
): Promise<BulkActionResult> {
  return runBulk(ids, (id) =>
    supabase.rpc("admin_unban_user", {
      target_user_id: id,
      unban_reason: reason,
    }),
  );
}

export async function bulkSetUnderReview(
  ids: string[],
  reason: string,
): Promise<BulkActionResult> {
  return runBulk(ids, (id) =>
    supabase.rpc("admin_set_under_review", {
      target_user_id: id,
      review_reason: reason,
    }),
  );
}

export async function bulkVerifyEmployers(ids: string[]): Promise<BulkActionResult> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        await approveBusinessVerification(id);
        return { id, error: null as string | null };
      } catch (err) {
        return {
          id,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }),
  );
  return {
    succeeded: results.filter((r) => !r.error).map((r) => r.id),
    failed: results
      .filter((r): r is { id: string; error: string } => !!r.error)
      .map((r) => ({ id: r.id, error: r.error })),
  };
}

export async function bulkRejectEmployers(
  ids: string[],
  reason: string,
): Promise<BulkActionResult> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        await rejectBusinessVerification(id, reason);
        return { id, error: null as string | null };
      } catch (err) {
        return {
          id,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }),
  );
  return {
    succeeded: results.filter((r) => !r.error).map((r) => r.id),
    failed: results
      .filter((r): r is { id: string; error: string } => !!r.error)
      .map((r) => ({ id: r.id, error: r.error })),
  };
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

// ─── Reports ─────────────────────────────────────────────────────────────────

/**
 * Fetch all reports, newest first.
 * Optionally filter by status.
 * Returns basic reporter info joined from profiles for display.
 */
export async function getReports(
  statusFilter: ReportStatus | 'all' = 'all',
): Promise<AdminReport[]> {
  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reporter_id (
        id,
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminReport[];
}

/**
 * Update a report's status (e.g., mark as 'reviewing', 'resolved', 'dismissed').
 * Optionally add resolution notes.
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  resolutionNotes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      resolution_notes: resolutionNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;
}

/**
 * Get moderation history for a specific user, newest first.
 */
export async function getModerationHistory(
  targetUserId: string,
): Promise<ModerationAction[]> {
  const { data, error } = await supabase
    .from('moderation_actions')
    .select('*')
    .eq('target_user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ModerationAction[];
}

/**
 * Get report count by status — used for dashboard badge.
 */
export async function getPendingReportCount(): Promise<number> {
  const { count, error } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) return 0;
  return count ?? 0;
}
