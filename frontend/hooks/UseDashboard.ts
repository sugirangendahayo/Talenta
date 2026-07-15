import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  shortlistedApplicants: number;
}

export interface HighPriorityApplicant {
  id: string;
  jobseeker_id: string;
  job_id: string;
  applicant_name: string;
  job_title: string;
  match_score: number;
  is_new: boolean;
  created_at: string;
  jobseeker_profiles?: {
    full_name: string;
  };
  jobs?: {
    title: string;
  };
}

export interface ActiveJob {
  id: string;
  title: string;
  salary_min: number;
  salary_max: number;
  location: string;
  expires_at: string;
  created_at: string;
  applicants_count: number;
  status: string;
}

export interface RecentContact {
  id: string;
  jobseeker_id: string;
  job_id: string;
  candidate_name: string;
  job_title: string;
  phone: string | null;
  email: string;
  profile_image_url: string | null;
  last_contact: string;
  status: string;
}

export function useDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplicants: 0,
    shortlistedApplicants: 0,
  });
  const [highPriorityApplicants, setHighPriorityApplicants] = useState<HighPriorityApplicant[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate match score based on skills, experience, etc.
  const calculateMatchScore = (application: any): number => {
    let score = 60; // Base score

    // Add points for matching skills
    if (application.jobs?.skills_required && application.jobseeker_profiles?.skills) {
      const jobSkills = application.jobs.skills_required.map((s: string) => s.toLowerCase());
      const candidateSkills = application.jobseeker_profiles.skills.map((s: string) => s.toLowerCase());
      
      const matchingSkills = jobSkills.filter((skill: string) => 
        candidateSkills.some((cs: string) => cs.includes(skill) || skill.includes(cs))
      );
      
      score += Math.min(matchingSkills.length * 5, 30); // Max 30 points for skills
    }

    // Add points for matching experience level
    if (application.jobs?.experience_level && application.jobseeker_profiles?.experience_level) {
      if (application.jobs.experience_level === application.jobseeker_profiles.experience_level) {
        score += 10;
      }
    }

    return Math.min(score, 100); // Cap at 100
  };

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Active jobs count
      const { count: activeJobsCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", user.id)
        .eq("status", "active");

      // Total applicants count
      const { count: totalApplicantsCount } = await supabase
        .from("job_applications")
        .select("*, jobs!inner(employer_id)", { count: "exact", head: true })
        .eq("jobs.employer_id", user.id);

      // Shortlisted applicants count (pending review)
      const { count: shortlistedApplicantsCount } = await supabase
        .from("job_applications")
        .select("*, jobs!inner(employer_id)", { count: "exact", head: true })
        .eq("jobs.employer_id", user.id)
        .eq("status", "shortlisted");

      setStats({
        activeJobs: activeJobsCount || 0,
        totalApplicants: totalApplicantsCount || 0,
        shortlistedApplicants: shortlistedApplicantsCount || 0,
      });
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
    }
  }, [user]);

  // Fetch high priority applicants (new applicants with high match scores)
  const fetchHighPriorityApplicants = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("job_applications")
        .select(`
          id,
          jobseeker_id,
          job_id,
          status,
          created_at,
          jobseeker_profiles!inner(
            full_name,
            skills,
            experience_level
          ),
          jobs!inner(
            employer_id,
            title,
            skills_required,
            experience_level
          )
        `)
        .eq("jobs.employer_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (fetchError) throw fetchError;

      // Calculate match scores and format data
      const applicantsWithScores = (data || []).map((app: any) => {
        const matchScore = calculateMatchScore(app);
        const isNew = new Date().getTime() - new Date(app.created_at).getTime() < 24 * 60 * 60 * 1000; // Last 24 hours

        const fullName = app.jobseeker_profiles?.full_name?.trim() || "Unknown";

        return {
          id: app.id,
          jobseeker_id: app.jobseeker_id,
          job_id: app.job_id,
          applicant_name: fullName,
          job_title: app.jobs?.title || "Unknown Position",
          match_score: matchScore,
          is_new: isNew,
          created_at: app.created_at,
        };
      });

      // Sort by match score (highest first) and filter top matches
      const topMatches = applicantsWithScores
        .sort((a, b) => b.match_score - a.match_score)
        .filter(app => app.match_score >= 75) // Only show 75%+ matches
        .slice(0, 3); // Top 3

      setHighPriorityApplicants(topMatches);
    } catch (err: any) {
      console.error("Error fetching high priority applicants:", err);
    }
  }, [user]);

  // Fetch active jobs with applicant counts
  const fetchActiveJobs = useCallback(async () => {
    if (!user) return;

    try {
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, salary_min, salary_max, location, expires_at, created_at, status")
        .eq("employer_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (jobsError) throw jobsError;

      // For each job, get applicants count
      const jobsWithCounts = await Promise.all(
        (jobs || []).map(async (job) => {
          const { count } = await supabase
            .from("job_applications")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);

          return {
            ...job,
            applicants_count: count || 0,
          };
        })
      );

      setActiveJobs(jobsWithCounts);
    } catch (err: any) {
      console.error("Error fetching active jobs:", err);
    }
  }, [user]);

  // Fetch recent contacts (hired candidates or shortlisted)
  const fetchRecentContacts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("job_applications")
        .select(`
          id,
          jobseeker_id,
          job_id,
          status,
          updated_at,
          jobseeker_profiles!inner(
            full_name,
            phone,
            email,
            profile_image_url
          ),
          jobs!inner(
            employer_id,
            title
          )
        `)
        .eq("jobs.employer_id", user.id)
        .in("status", ["hired", "shortlisted"])
        .order("updated_at", { ascending: false })
        .limit(5);

      if (fetchError) throw fetchError;

      const contacts = (data || []).map((app: any) => {
        const fullName = app.jobseeker_profiles?.full_name?.trim() || "Unknown";

        return {
          id: app.id,
          jobseeker_id: app.jobseeker_id,
          job_id: app.job_id,
          candidate_name: fullName,
          job_title: app.jobs?.title || "Unknown Position",
          phone: app.jobseeker_profiles?.phone || null,
          email: app.jobseeker_profiles?.email || "",
          profile_image_url: app.jobseeker_profiles?.profile_image_url || null,
          last_contact: app.updated_at,
          status: app.status,
        };
      });

      setRecentContacts(contacts);
    } catch (err: any) {
      console.error("Error fetching recent contacts:", err);
    }
  }, [user]);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      await Promise.all([
        fetchStats(),
        fetchHighPriorityApplicants(),
        fetchActiveJobs(),
        fetchRecentContacts(),
      ]);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, fetchStats, fetchHighPriorityApplicants, fetchActiveJobs, fetchRecentContacts]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return {
    stats,
    highPriorityApplicants,
    activeJobs,
    recentContacts,
    loading,
    refreshing,
    error,
    refresh,
  };
}