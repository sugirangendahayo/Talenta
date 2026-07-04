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
  recommended?: boolean; // NEW: For personalized recommendations
  userProfile?: {
    skills?: string[];
    experience_level?: string;
  };
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
    recommended = false,
    userProfile,
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

  // Smart recommendation algorithm
  const recommendJobs = useCallback(
    (jobs: Job[], profile: typeof userProfile) => {
      if (!profile) return jobs;

      const scoredJobs = jobs.map((job) => {
        let score = 0;

        // Score based on matching skills (highest priority)
        if (
          profile.skills &&
          profile.skills.length > 0 &&
          job.skills_required
        ) {
          const userSkillsLower = profile.skills.map((s) => s.toLowerCase());
          const jobSkillsLower = job.skills_required.map((s) =>
            s.toLowerCase(),
          );

          const matchingSkills = userSkillsLower.filter((skill) =>
            jobSkillsLower.some((jobSkill) => jobSkill.includes(skill)),
          );

          score += matchingSkills.length * 10; // 10 points per matching skill
        }

        // Score based on experience level match
        if (
          profile.experience_level &&
          job.experience_level &&
          profile.experience_level.toLowerCase() ===
            job.experience_level.toLowerCase()
        ) {
          score += 5; // 5 points for matching experience
        }

        return { ...job, _score: score };
      });

      // Sort by score (highest first), then by created_at
      return scoredJobs
        .sort((a, b) => {
          if (b._score !== a._score) {
            return b._score - a._score;
          }
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        })
        .map(({ _score, ...job }) => job); // Remove score from final result
    },
    [],
  );

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

        // Apply recommendation logic if enabled
        if (recommended && userProfile && !searchQuery && category === "all") {
          fetchedJobs = recommendJobs(fetchedJobs, userProfile);
        }

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
    [category, searchQuery, pageSize, recommended, userProfile, filters, recommendJobs],
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

    const lastJob = jobs[jobs.length - 1];
    fetchJobs(lastJob.created_at);
  }, [jobs, loadingMore, hasMore, fetchJobs]);

  // Refresh
  const refresh = useCallback(() => {
    setNewJobsCount(0);
    fetchJobs(undefined, true);
  }, [fetchJobs]);

  // Load new jobs
  const loadNewJobs = useCallback(() => {
    setNewJobsCount(0);
    fetchJobs(undefined, true);
  }, [fetchJobs]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [category, searchQuery, filters]);

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
