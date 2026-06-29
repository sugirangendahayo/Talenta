// hooks/useBookmarks.ts
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

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
  }, [jobId, isBookmarked, toggling]);

  return { isBookmarked, loading, toggling, toggle, refetch: fetchStatus };
}

// ─── Hook for bulk bookmark status (for lists like HomeJobs) ─────────────────
export function useBookmarkSet() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const toggleInSet = useCallback(
    async (jobId: string) => {
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
    [bookmarkedIds]
  );

  return { bookmarkedIds, loading, toggleInSet, refetch: fetchAll };
}

// ─── Hook: applied job ids set ────────────────────────────────────────────────
export function useAppliedSet() {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  return { appliedIds, loading, refetch: fetchAll };
}

// ─── Hook: full bookmarks list (for Saved Jobs screen) ───────────────────────
export function useBookmarksList() {
  const [bookmarks, setBookmarks] = useState<BookmarkedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookmarks = useCallback(async (isRefresh = false) => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [fetchBookmarks])
  );

  const removeBookmark = useCallback(
    async (jobId: string) => {
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
    []
  );

  return {
    bookmarks,
    loading,
    refreshing,
    refresh: () => fetchBookmarks(true),
    removeBookmark,
  };
}