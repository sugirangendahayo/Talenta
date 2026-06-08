import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";

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
    title: string;
    location: string;
    salary_min: number;
    salary_max: number;
    job_type: string;
    category: string;
    // Joined employer data
    employer_profiles: {
      company_name: string;
      email: string;
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

  // Fetch applications
  const fetchApplications = useCallback(
    async (isRefresh = false) => {
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
              title,
              location,
              salary_min,
              salary_max,
              job_type,
              category,
              employer_profiles!inner(
                company_name,
                email
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
      } catch (err: any) {
        console.error("Error fetching applications:", err);
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status],
  );

  // Refresh (pull-to-refresh)
  const refresh = useCallback(() => {
    fetchApplications(true);
  }, [fetchApplications]);

  // Withdraw application
  const withdrawApplication = useCallback(async (applicationId: string) => {
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
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [status]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchApplications(true);
    }, [fetchApplications]),
  );

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
