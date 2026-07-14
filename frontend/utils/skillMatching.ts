// utils/skillMatching.ts
// Pure skill-matching engine — no React, no Supabase, fully testable in isolation.
// This is the single source of truth for all skill-match calculations across the app.

export type MatchLabel = "high" | "medium" | "low" | "none";

export interface SkillMatchResult {
  /** 0–100 percentage */
  score: number;
  /** User skills that match a job requirement (using the job's original casing) */
  matchedSkills: string[];
  /** Job requirements the user does NOT have */
  missingSkills: string[];
  /** Categorical tier for colour-coding */
  label: MatchLabel;
  /** Human-readable summary, e.g. "You match 4 of 6 required skills." */
  summary: string;
}

// ─── Normalisation ─────────────────────────────────────────────────────────────
// Lower-case + trim so "React.js" matches "react" and vice-versa.
function normalise(skill: string): string {
  return skill.toLowerCase().trim();
}

// Bidirectional substring match handles "React" ↔ "React.js", "Node" ↔ "Node.js", etc.
function skillsMatch(userSkill: string, jobSkill: string): boolean {
  const u = normalise(userSkill);
  const j = normalise(jobSkill);
  return u === j || j.includes(u) || u.includes(j);
}

// ─── Core algorithm ────────────────────────────────────────────────────────────

/**
 * Compute a skill-match result for a single job.
 *
 * @param userSkills  Skills from the logged-in jobseeker's profile (may be empty).
 * @param jobSkills   `skills_required` array from the job record (may be empty/undefined).
 */
export function computeMatchScore(
  userSkills: string[],
  jobSkills: string[] | undefined | null,
): SkillMatchResult {
  const required = jobSkills ?? [];

  // Edge case: job has no required skills → perfect match by definition
  if (required.length === 0) {
    return {
      score: 100,
      matchedSkills: [],
      missingSkills: [],
      label: "high",
      summary: "No specific skills required.",
    };
  }

  // Edge case: user has no skills → nothing matched
  if (userSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [...required],
      label: "none",
      summary: `Add skills to your profile to see how well you match.`,
    };
  }

  // Determine which job skills the user covers (using job's original casing for display)
  const matchedSkills = required.filter((jobSkill) =>
    userSkills.some((userSkill) => skillsMatch(userSkill, jobSkill)),
  );

  const missingSkills = required.filter(
    (jobSkill) =>
      !userSkills.some((userSkill) => skillsMatch(userSkill, jobSkill)),
  );

  const score = Math.round((matchedSkills.length / required.length) * 100);

  const label: MatchLabel =
    score >= 70 ? "high" : score >= 40 ? "medium" : score > 0 ? "low" : "none";

  const summary =
    matchedSkills.length === required.length
      ? `You match all ${required.length} required skill${required.length === 1 ? "" : "s"}.`
      : `You match ${matchedSkills.length} of ${required.length} required skill${required.length === 1 ? "" : "s"}.`;

  return { score, matchedSkills, missingSkills, label, summary };
}

/**
 * Sort an array of jobs by descending match score.
 * Jobs with the same score maintain their original relative order (stable sort).
 *
 * @param jobs       Any array whose items have a `skills_required` field.
 * @param userSkills Skills from the logged-in jobseeker's profile.
 */
export function sortJobsByMatchScore<
  T extends { skills_required?: string[] | null },
>(jobs: T[], userSkills: string[]): T[] {
  if (userSkills.length === 0) return jobs; // nothing to rank — keep original order

  return [...jobs].sort((a, b) => {
    const scoreA = computeMatchScore(userSkills, a.skills_required).score;
    const scoreB = computeMatchScore(userSkills, b.skills_required).score;
    return scoreB - scoreA;
  });
}
