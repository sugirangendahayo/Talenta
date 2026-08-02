// hooks/useBookmarks.ts
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export interface BookmarkedJob {
  id: string; // bookmark id
  job_id: string;
  jobseeker_id: string;
  created_at: string;
  jobs: {
    id: string;
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
    employer_profiles?: {
      company_name: string;
      email: string;
      business_verification_status?: string;
      premium_plan?: string;
    };
  };
}

// ─── Lightweight hook: just check/toggle one job's bookmark state ─────────────
export function useJobBookmark(jobId: string) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { requireOnline } = useRequireOnline();

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("job_bookmarks")
        .select("id")
        .eq("job_id", jobId)
        .eq("jobseeker_id", user.id)
        .maybeSingle();

      setIsBookmarked(!!data);
    } catch (err) {
      console.error("Error fetching bookmark status:", err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const toggle = useCallback(async () => {
    if (toggling) return;
    if (!requireOnline("You're offline. Reconnect to save this job.")) return;
    setToggling(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (isBookmarked) {
        await supabase
          .from("job_bookmarks")
          .delete()
          .eq("job_id", jobId)
          .eq("jobseeker_id", user.id);
        setIsBookmarked(false);
      } else {
        await supabase.from("job_bookmarks").insert({
          job_id: jobId,
          jobseeker_id: user.id,
        });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    } finally {
      setToggling(false);
    }
  }, [jobId, isBookmarked, toggling, requireOnline]);

  return { isBookmarked, loading, toggling, toggle, refetch: fetchStatus };
}

// ─── Hook for bulk bookmark status (for lists like HomeJobs) ─────────────────
export function useBookmarkSet() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();

  const fetchAll = useCallback(async () => {
    if (!isOnline) {
      setLoading(false);
      return; // keep whatever bookmark state is already cached in memory
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("job_bookmarks")
        .select("job_id")
        .eq("jobseeker_id", user.id);

      setBookmarkedIds(new Set((data || []).map((b: any) => b.job_id)));
    } catch (err) {
      console.error("Error fetching bookmark set:", err);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  useRefetchOnReconnect(fetchAll);

  const toggleInSet = useCallback(
    async (jobId: string) => {
      if (!requireOnline("You're offline. Reconnect to save this job.")) return;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const isCurrentlyBookmarked = bookmarkedIds.has(jobId);

        if (isCurrentlyBookmarked) {
          await supabase
            .from("job_bookmarks")
            .delete()
            .eq("job_id", jobId)
            .eq("jobseeker_id", user.id);

          setBookmarkedIds((prev) => {
            const next = new Set(prev);
            next.delete(jobId);
            return next;
          });
        } else {
          await supabase.from("job_bookmarks").insert({
            job_id: jobId,
            jobseeker_id: user.id,
          });

          setBookmarkedIds((prev) => new Set(prev).add(jobId));
        }
      } catch (err) {
        console.error("Error toggling bookmark:", err);
      }
    },
    [bookmarkedIds, requireOnline]
  );

  return { bookmarkedIds, loading, toggleInSet, refetch: fetchAll };
}

// ─── Hook: applied job ids set ────────────────────────────────────────────────
export function useAppliedSet() {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetwork();

  const fetchAll = useCallback(async () => {
    if (!isOnline) {
      setLoading(false);
      return;
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("job_applications")
        .select("job_id")
        .eq("jobseeker_id", user.id);

      setAppliedIds(new Set((data || []).map((a: any) => a.job_id)));
    } catch (err) {
      console.error("Error fetching applied set:", err);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  useRefetchOnReconnect(fetchAll);

  return { appliedIds, loading, refetch: fetchAll };
}

// ─── Hook: full bookmarks list (for Saved Jobs screen) ───────────────────────
export function useBookmarksList() {
  const [bookmarks, setBookmarks] = useState<BookmarkedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();

  const fetchBookmarks = useCallback(async (isRefresh = false) => {
    if (!isOnline) {
      setLoading(false);
      setRefreshing(false);
      return; // keep the previously loaded saved-jobs list visible
    }
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("job_bookmarks")
        .select(
          `
          id,
          job_id,
          jobseeker_id,
          created_at,
          jobs (
            id,
            title,
            description,
            location,
            salary_min,
            salary_max,
            job_type,
            category,
            experience_level,
            skills_required,
            status,
            created_at,
            employer_profiles (
              company_name,
              email,
              business_verification_status,
              premium_plan
            )
          )
        `
        )
        .eq("jobseeker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks((data as unknown as BookmarkedJob[]) || []);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [fetchBookmarks])
  );

  useRefetchOnReconnect(() => fetchBookmarks(true));

  const removeBookmark = useCallback(
    async (jobId: string) => {
      if (!requireOnline("You're offline. Reconnect to remove this saved job.")) return;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("job_bookmarks")
          .delete()
          .eq("job_id", jobId)
          .eq("jobseeker_id", user.id);

        setBookmarks((prev) => prev.filter((b) => b.job_id !== jobId));
      } catch (err) {
        console.error("Error removing bookmark:", err);
      }
    },
    [requireOnline]
  );

  const refresh = useCallback(() => {
    if (!requireOnline("You're offline. Reconnect to refresh saved jobs.")) return;
    fetchBookmarks(true);
  }, [fetchBookmarks, requireOnline]);

  return {
    bookmarks,
    loading,
    refreshing,
    refresh,
    removeBookmark,
  };
}