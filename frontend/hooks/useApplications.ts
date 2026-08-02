import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export interface Application {
  id: string;
  job_id: string;
  jobseeker_id: string;
  status: "pending" | "shortlisted" | "hired" | "rejected";
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  // Joined job data
  jobs: {
    id: string;
    employer_id: string;
    title: string;
    location: string;
    salary_min: number;
    salary_max: number;
    job_type: string;
    category: string;
    skills_required?: string[] | null;
    // Joined employer data
    employer_profiles: {
      company_name: string;
      email: string;
      business_verification_status?: string;
      premium_plan?: string;
      profile_image_url?: string | null;
    };
  };
}

type StatusFilter = "all" | "pending" | "shortlisted" | "hired" | "rejected";

interface UseApplicationsOptions {
  status?: StatusFilter;
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const { status = "all" } = options;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const hasLoadedOnceRef = useRef(false);

  // Fetch applications
  const fetchApplications = useCallback(
    async (isRefresh = false) => {
      // Offline: keep showing previously loaded applications instead of
      // clearing them or spinning forever.
      if (!isOnline) {
        setLoading(false);
        setRefreshing(false);
        if (!hasLoadedOnceRef.current) {
          setError("You're offline. Connect to the internet to load your applications.");
        }
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
          setError(null);
        } else {
          setLoading(true);
          setError(null);
        }

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Not authenticated");
        }

        // Build query with JOINs
        let query = supabase
          .from("job_applications")
          .select(
            `
            *,
            jobs!inner(
              id,
              employer_id,
              title,
              location,
              salary_min,
              salary_max,
              job_type,
              category,
              skills_required,
              employer_profiles!inner(
                company_name,
                email,
                business_verification_status,
                premium_plan,
                profile_image_url
              )
            )
          `,
          )
          .eq("jobseeker_id", user.id)
          .order("created_at", { ascending: false });

        // Apply status filter
        if (status !== "all") {
          query = query.eq("status", status);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setApplications(data || []);
        hasLoadedOnceRef.current = true;
      } catch (err: any) {
        console.error("Error fetching applications:", err);
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status, isOnline],
  );

  // Refresh (pull-to-refresh)
  const refresh = useCallback(() => {
    if (!requireOnline("You're offline. Reconnect to refresh your applications.")) return;
    fetchApplications(true);
  }, [fetchApplications, requireOnline]);

  // Withdraw application
  const withdrawApplication = useCallback(async (applicationId: string) => {
    if (!requireOnline("You're offline. Reconnect to withdraw this application.")) return false;

    try {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", applicationId);

      if (error) throw error;

      // Remove from local state
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));

      return true;
    } catch (err: any) {
      console.error("Error withdrawing application:", err);
      return false;
    }
  }, [requireOnline]);

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [status]);

  // Refresh when screen comes into focus (only when online — avoids a
  // guaranteed-to-fail request every time the user switches tabs offline)
  useFocusEffect(
    useCallback(() => {
      if (!isOnline) return;
      fetchApplications(true);
    }, [fetchApplications, isOnline]),
  );

  // Smart auto-refresh on reconnect (covers the case where the screen was
  // already focused when connectivity returned, so the focus-effect above
  // wouldn't otherwise re-fire).
  useRefetchOnReconnect(() => fetchApplications(true));

  // Get counts by status
  const getCounts = useCallback(() => {
    return {
      all: applications.length,
      pending: applications.filter((app) => app.status === "pending").length,
      shortlisted: applications.filter((app) => app.status === "shortlisted")
        .length,
      hired: applications.filter((app) => app.status === "hired").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };
  }, [applications]);

  return {
    applications,
    loading,
    refreshing,
    error,
    refresh,
    withdrawApplication,
    getCounts,
  };
}
