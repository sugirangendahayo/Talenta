import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

export type AuthPrecheckIntent = "password" | "google";

export type AuthPrecheckStatus =
  | "ok"
  | "not_found"
  | "google_only"
  | "password_only"
  | "error";

export interface AuthPrecheckResult {
  status: AuthPrecheckStatus;
  message?: string;
  providers?: string[];
}

/**
 * Checks which authentication provider(s) are linked to an email address
 * *before* attempting to sign in, so the UI can guide the user to the right
 * method instead of a generic "Invalid email or password" error.
 *
 * - intent "password" → flags accounts that only have a Google identity.
 * - intent "google"   → flags accounts that only have an email/password identity.
 *
 * The `auth-precheck` Edge Function intentionally returns non-2xx statuses
 * (404/409) for the "blocked" cases, which `supabase.functions.invoke`
 * surfaces as a `FunctionsHttpError` rather than populating `data`. We parse
 * the structured JSON body off that error's response before falling back to
 * "fail open" (status "ok") for genuine network/infra errors, so a temporary
 * outage of this check never blocks a legitimate sign-in — the real
 * Supabase auth call that follows still enforces actual auth rules.
 */
export async function checkAuthProvider(
  email: string,
  intent: AuthPrecheckIntent,
): Promise<AuthPrecheckResult> {
  try {
    const { data, error } = await supabase.functions.invoke("auth-precheck", {
      body: { email, intent },
    });

    if (error) {
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json();
          if (body && typeof body.status === "string") {
            return body as AuthPrecheckResult;
          }
        } catch (parseErr) {
          console.warn("auth-precheck: failed to parse error response body:", parseErr);
        }
      }

      console.warn("auth-precheck unavailable, proceeding normally:", error.message);
      return { status: "ok" };
    }

    if (!data) return { status: "ok" };

    return data as AuthPrecheckResult;
  } catch (err) {
    console.warn("auth-precheck failed, proceeding normally:", err);
    return { status: "ok" };
  }
}
