import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  category: string;
  experience_level: string;
  skills_required: string[];
  status: string;
  created_at: string;
  updated_at: string;
  employer_profiles?: {
    company_name: string;
    email: string;
    business_verification_status?: string;
    premium_plan?: string;
    profile_image_url?: string | null;
  };
}

interface UseJobsOptions {
  category?: string;
  searchQuery?: string;
  pageSize?: number;
  filters?: {
    jobType?: string;
    experienceLevel?: string;
  };
}

export function useJobs(options: UseJobsOptions = {}) {
  const {
    category = "all",
    searchQuery = "",
    pageSize = 10,
    filters,
  } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const lastFetchedAt = useRef<string | null>(null);
  const jobsCountRef = useRef(0);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();

  useEffect(() => {
    jobsCountRef.current = jobs.length;
  }, [jobs.length]);

  // Fetch jobs with cursor pagination
  const fetchJobs = useCallback(
    async (cursor?: string, isRefresh = false) => {
      // Offline: don't attempt a request that would just fail/hang. Keep
      // whatever is already in memory (previously loaded content) visible
      // instead of flashing a skeleton or an error.
      if (!isOnline) {
        if (isRefresh) setRefreshing(false);
        else if (cursor) setLoadingMore(false);
        else {
          setLoading(false);
          if (jobsCountRef.current === 0) {
            setError("You're offline. Connect to the internet to load jobs.");
          }
        }
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
          setError(null);
        } else if (cursor) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        // Build base query
        let query = supabase
          .from("jobs")
          .select(
            `
            *,
            employer_profiles!inner(
              company_name,
              email,
              business_verification_status,
              premium_plan,
              profile_image_url
            )
          `,
            { count: "exact" },
          )
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(pageSize);

        // Apply category filter
        if (category && category !== "all") {
          query = query.eq("category", category);
        }

        // Apply search filter
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase();
          query = query.or(
            `title.ilike.%${searchLower}%,location.ilike.%${searchLower}%`,
          );
        }

        // Apply advanced filters
        if (filters?.jobType && filters.jobType !== "all") {
          // Use ilike for comma separated job_type matches
          query = query.ilike("job_type", `%${filters.jobType}%`);
        }
        if (filters?.experienceLevel && filters.experienceLevel !== "all") {
          query = query.eq("experience_level", filters.experienceLevel);
        }

        // Cursor pagination
        if (cursor) {
          query = query.lt("created_at", cursor);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        let fetchedJobs = data || [];

        if (isRefresh) {
          setJobs(fetchedJobs);
          setNewJobsCount(0);
          if (fetchedJobs.length > 0) {
            lastFetchedAt.current = fetchedJobs[0].created_at;
          }
        } else if (cursor) {
          setJobs((prev) => [...prev, ...fetchedJobs]);
        } else {
          setJobs(fetchedJobs);
          if (fetchedJobs.length > 0) {
            lastFetchedAt.current = fetchedJobs[0].created_at;
          }
        }

        setHasMore(fetchedJobs.length === pageSize);
      } catch (err: any) {
        console.error("Error fetching jobs:", err);
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [category, searchQuery, pageSize, filters, isOnline],
  );

  // Check for new jobs
  const checkForNewJobs = useCallback(async () => {
    if (!lastFetchedAt.current) return;

    try {
      let query = supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gt("created_at", lastFetchedAt.current);

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { count, error } = await query;

      if (error) throw error;

      if (count && count > 0) {
        setNewJobsCount(count);
      }
    } catch (err) {
      console.error("Error checking for new jobs:", err);
    }
  }, [category]);

  // Load more
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || jobs.length === 0) return;
    if (!requireOnline("You're offline. Reconnect to load more jobs.")) return;

    const lastJob = jobs[jobs.length - 1];
    fetchJobs(lastJob.created_at);
  }, [jobs, loadingMore, hasMore, fetchJobs, requireOnline]);

  // Refresh
  const refresh = useCallback(() => {
    if (!requireOnline("You're offline. Reconnect to refresh jobs.")) return;
    setNewJobsCount(0);
    fetchJobs(undefined, true);
  }, [fetchJobs, requireOnline]);

  // Load new jobs
  const loadNewJobs = useCallback(() => {
    if (!requireOnline("You're offline. Reconnect to load new jobs.")) return;
    setNewJobsCount(0);
    fetchJobs(undefined, true);
  }, [fetchJobs, requireOnline]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [category, searchQuery, filters]);

  // Smart auto-refresh: when connectivity returns, silently refresh this
  // screen's data — gated internally on the screen being focused, so
  // backgrounded tabs don't all refetch at once when connectivity returns.
  // Always enabled (not just when `jobs.length > 0`) so a cold app launch
  // while offline still recovers automatically once back online.
  useRefetchOnReconnect(() => fetchJobs(undefined, true));

  // Check for new jobs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (jobs.length > 0) {
        checkForNewJobs();
      }
    }, [checkForNewJobs, jobs.length]),
  );

  return {
    jobs,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    newJobsCount,
    loadMore,
    refresh,
    loadNewJobs,
  };
}
