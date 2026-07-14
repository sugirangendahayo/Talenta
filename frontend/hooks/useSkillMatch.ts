// hooks/useSkillMatch.ts
// React hook that wraps the pure skillMatching utility.
// Reads the logged-in user's skills from AuthContext (already loaded at app start —
// zero extra Supabase calls needed) and exposes helpers for computing and sorting.

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { JobseekerProfile } from "@/lib/supabase";
import {
  computeMatchScore,
  sortJobsByMatchScore,
  SkillMatchResult,
} from "@/utils/skillMatching";

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Minimal shape needed from a job object to compute a match. */
export interface MatchableJob {
  id: string;
  skills_required?: string[] | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Provides skill-based matching helpers for the logged-in jobseeker.
 *
 * - `userSkills`       — the user's skill list (empty array when unavailable)
 * - `getMatchForJob`   — returns a `SkillMatchResult` for a single job (memoised)
 * - `sortJobsByMatch`  — returns a new array sorted by descending match score
 * - `hasSkills`        — quick boolean: does the user have any skills set?
 */
export function useSkillMatch() {
  const { profile, role } = useAuth();

  // Only jobseekers have skills; employers/admins get an empty array
  const userSkills = useMemo<string[]>(() => {
    if (role !== "jobseeker" || !profile) return [];
    return (profile as JobseekerProfile).skills ?? [];
  }, [profile, role]);

  /**
   * Compute match for a single job.
   * Results are derived purely from `userSkills` + `job.skills_required`,
   * so React's memo on the enclosing component handles caching automatically.
   */
  const getMatchForJob = useMemo(
    () =>
      (job: MatchableJob): SkillMatchResult =>
        computeMatchScore(userSkills, job.skills_required),
    [userSkills],
  );

  /**
   * Return a new array of jobs sorted by descending skill-match score.
   * Stable — equal-scoring jobs keep their original relative order.
   */
  const sortJobsByMatch = useMemo(
    () =>
      <T extends MatchableJob>(jobs: T[]): T[] =>
        sortJobsByMatchScore(jobs, userSkills),
    [userSkills],
  );

  return {
    userSkills,
    hasSkills: userSkills.length > 0,
    getMatchForJob,
    sortJobsByMatch,
  };
}
