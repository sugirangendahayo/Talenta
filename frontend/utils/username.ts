/**
 * username.ts
 *
 * Centralised username utility — single source of truth for:
 *   • generating a base username from a full name
 *   • generating smart suggestions when a username is taken
 *   • validating username format
 *   • checking availability against Supabase (case-insensitive)
 *
 * Import from any registration or profile-editing screen.
 */

import { supabase } from "@/lib/supabase";

// ─── Format rules ─────────────────────────────────────────────────────────────

/** Allowed characters: lowercase letters, digits, underscore, dot */
const USERNAME_REGEX = /^[a-z0-9_.]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 30;

/**
 * Validate username format.
 * @returns An error message string, or `null` if valid.
 */
export function validateUsernameFormat(username: string): string | null {
  const trimmed = username.trim();
  if (trimmed.length < MIN_LENGTH) {
    return `Username must be at least ${MIN_LENGTH} characters`;
  }
  if (trimmed.length > MAX_LENGTH) {
    return `Username must be at most ${MAX_LENGTH} characters`;
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return "Only lowercase letters, numbers, _ and . are allowed";
  }
  if (trimmed.startsWith(".") || trimmed.endsWith(".")) {
    return "Username cannot start or end with a dot";
  }
  if (trimmed.includes("..")) {
    return "Username cannot have consecutive dots";
  }
  return null;
}

// ─── Base generation ──────────────────────────────────────────────────────────

/**
 * Normalise a full name into a base username candidate.
 *
 * "Salomon Elisha" → "salomonelisha"
 * "João Da Silva"  → "joaodasilva"
 */
export function generateBaseUsername(fullName: string): string {
  // 1. Lowercase
  let base = fullName.toLowerCase();

  // 2. Strip common accent characters → ASCII equivalents
  base = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ý]/g, "y")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c");

  // 3. Remove everything that isn't a-z, 0-9, or a space
  base = base.replace(/[^a-z0-9 ]/g, "");

  // 4. Remove spaces (concatenate words)
  base = base.replace(/\s+/g, "");

  // 5. Enforce max length at generation stage
  return base.slice(0, MAX_LENGTH);
}

// ─── Smart suggestions ────────────────────────────────────────────────────────

/**
 * Generate up to 6 ordered username suggestions when the base is already taken.
 *
 * Priority:
 *   1. base (e.g. "salomonelisha")
 *   2. base + sequential numbers (1, 2, 3 …)
 *   3. firstName + "." + lastInitial  (e.g. "salomon.e")
 *   4. firstName + "_" + lastName     (e.g. "salomon_elisha")
 *   5. base + current year suffix      (e.g. "salomonelisha2005")  ← only if different from above
 *   6. base + 4 predictable digits from hash
 *
 * @param fullName  The user's typed full name (used to derive name parts)
 * @param takenSet  Set of lowercase usernames already known to be taken (from API check)
 */
export function generateUsernameSuggestions(
  fullName: string,
  takenSet: Set<string> = new Set()
): string[] {
  const base = generateBaseUsername(fullName);
  if (!base) return [];

  const parts = fullName.trim().toLowerCase().split(/\s+/);
  const firstName = (parts[0] || "").replace(/[^a-z0-9]/g, "");
  const lastName = (parts[parts.length - 1] || "").replace(/[^a-z0-9]/g, "");
  const lastInitial = lastName.charAt(0);

  const candidates: string[] = [];

  const add = (candidate: string) => {
    const clean = candidate.slice(0, MAX_LENGTH).toLowerCase();
    if (
      clean.length >= MIN_LENGTH &&
      !takenSet.has(clean) &&
      !candidates.includes(clean) &&
      validateUsernameFormat(clean) === null
    ) {
      candidates.push(clean);
    }
  };

  // Tier 1 — base
  add(base);

  // Tier 2 — base + sequential numbers
  for (let i = 1; i <= 9 && candidates.length < 6; i++) {
    add(`${base}${i}`);
  }

  // Tier 3 — firstName.lastInitial
  if (firstName && lastInitial && firstName !== lastName) {
    add(`${firstName}.${lastInitial}`);
    add(`${firstName}.${lastName.slice(0, 4)}`);
  }

  // Tier 4 — firstName_lastName
  if (firstName && lastName && firstName !== lastName) {
    add(`${firstName}_${lastName}`);
  }

  // Tier 5 — base + current year
  const year = new Date().getFullYear().toString();
  add(`${base}${year}`);

  // Tier 6 — stable 4-digit suffix derived from base chars (reproducible, not random)
  const charSum = base
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const stableSuffix = String(charSum % 9000 + 1000);
  add(`${base}${stableSuffix}`);

  return candidates.slice(0, 6);
}

// ─── Availability check ───────────────────────────────────────────────────────

export type UsernameTable = "jobseeker_profiles" | "employer_profiles";
export type UsernameColumn = "username" | "company_username";

/**
 * Check whether a username is available in Supabase.
 *
 * The check is case-insensitive and runs through a narrow database RPC. This
 * is necessary during sign-up: anonymous users cannot read other profile rows
 * under RLS, which would otherwise make every hidden username look available.
 *
 * @param username     The username string to test
 * @param table        "jobseeker_profiles" | "employer_profiles"
 * @param column       "username" | "company_username"
 * @param excludeId    The current user's own ID — exclude it from the check so
 *                     a profile edit doesn't falsely say their own username is taken
 * @returns            `true` if available, `false` if taken
 */
export async function checkUsernameAvailability(
  username: string,
  table: UsernameTable,
  column: UsernameColumn,
  excludeId?: string
): Promise<boolean> {
  if (!username || validateUsernameFormat(username) !== null) return false;

  try {
    const { data, error } = await supabase.rpc("is_username_available", {
      p_candidate: username.trim().toLowerCase(),
      p_profile_table: table,
      p_exclude_id: excludeId ?? null,
    });
    if (error) throw error;

    return data === true;
  } catch (err) {
    console.error("checkUsernameAvailability error:", err);
    // Never offer a username when its availability could not be verified.
    return false;
  }
}

/**
 * Convenience: check multiple suggestions in parallel and return only those that are available.
 */
export async function filterAvailableSuggestions(
  suggestions: string[],
  table: UsernameTable,
  column: UsernameColumn,
  excludeId?: string
): Promise<string[]> {
  const results = await Promise.all(
    suggestions.map((s) => checkUsernameAvailability(s, table, column, excludeId))
  );
  return suggestions.filter((_, i) => results[i]);
}
