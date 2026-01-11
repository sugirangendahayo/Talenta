import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";

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
  // Joined data from employer_profiles
  employer_profiles?: {
    company_name: string;
    email: string;
  };
}

interface UseJobsOptions {
  category?: string;
  searchQuery?: string;
  pageSize?: number;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { category = "all", searchQuery = "", pageSize = 10 } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const lastFetchedAt = useRef<string | null>(null);

  // Fetch jobs with cursor pagination
  const fetchJobs = useCallback(
    async (cursor?: string, isRefresh = false) => {
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

        // Build base query with JOIN
        let query = supabase
          .from("jobs")
          .select(
            `
            *,
            employer_profiles!inner(
              company_name,
              email
            )
          `,
            { count: "exact" }
          )
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(pageSize);

        // Apply category filter
        if (category && category !== "all") {
          query = query.eq("category", category);
        }

        // Apply search filter (searches in title, location, company name)
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase();
          query = query.or(
            `title.ilike.%${searchLower}%,location.ilike.%${searchLower}%`
          );
        }

        // Cursor pagination: fetch jobs created BEFORE the cursor timestamp
        if (cursor) {
          query = query.lt("created_at", cursor);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const fetchedJobs = data || [];

        if (isRefresh) {
          setJobs(fetchedJobs);
          // Reset "new jobs" count after refresh
          setNewJobsCount(0);
          // Update last fetched timestamp
          if (fetchedJobs.length > 0) {
            lastFetchedAt.current = fetchedJobs[0].created_at;
          }
        } else if (cursor) {
          // Append for infinite scroll
          setJobs((prev) => [...prev, ...fetchedJobs]);
        } else {
          setJobs(fetchedJobs);
          // Set initial timestamp
          if (fetchedJobs.length > 0) {
            lastFetchedAt.current = fetchedJobs[0].created_at;
          }
        }

        // Check if there are more jobs to load
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
    [category, searchQuery, pageSize]
  );

  // Check for new jobs (called on pull-down or focus)
  const checkForNewJobs = useCallback(async () => {
    if (!lastFetchedAt.current) return;

    try {
      let query = supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gt("created_at", lastFetchedAt.current);
        
        

      // Apply same filters
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

  // Load more (infinite scroll)
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || jobs.length === 0) return;

    const lastJob = jobs[jobs.length - 1];
    fetchJobs(lastJob.created_at);
  }, [jobs, loadingMore, hasMore, fetchJobs]);

  // Refresh (pull-to-refresh)
  const refresh = useCallback(() => {
    setNewJobsCount(0);
    fetchJobs(undefined, true);
  }, [fetchJobs]);

  // Load new jobs (when banner is clicked)
  const loadNewJobs = useCallback(() => {
    setNewJobsCount(0);
    fetchJobs(undefined, true);
  }, [fetchJobs]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [category, searchQuery]);

  // Check for new jobs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (jobs.length > 0) {
        checkForNewJobs();
      }
    }, [checkForNewJobs, jobs.length])
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
