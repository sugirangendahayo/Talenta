import { supabase } from "@/lib/supabase";
import { EmployerCertificate, PremiumPlan } from "@/types/verification.types";
import { FunctionsHttpError } from "@supabase/supabase-js";

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export type CheckoutConfirmationStatus = "completed" | "pending" | "expired";

export interface ConfirmCheckoutResult {
  status: CheckoutConfirmationStatus;
  plan?: PremiumPlan;
}

/**
 * Starts a real Stripe Checkout session for the given employer plan.
 *
 * Replaces the old `simulatePaymentAndActivate()` fake-payment flow. This
 * never grants premium itself — it only asks the `create-checkout-session`
 * Edge Function (which owns the Stripe secret key) to open a real payment
 * page. The plan is only ever activated server-side after payment succeeds.
 */
export const createEmployerCheckoutSession = async (
  plan: PremiumPlan,
  redirectUrl: string,
): Promise<CheckoutSessionResult> => {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { plan, redirectUrl },
  });

  if (error) throw new Error(await extractFunctionErrorMessage(error));
  if (!data?.url || !data?.sessionId) throw new Error("Failed to start checkout");

  return data as CheckoutSessionResult;
};

/**
 * Confirms a checkout session immediately after the user returns from the
 * Stripe payment page, so the UI can reflect success/failure right away.
 * Safe to call even if the `stripe-webhook` has already processed (or will
 * shortly process) the same session — finalization is fully idempotent.
 */
export const confirmEmployerCheckoutSession = async (
  sessionId: string,
): Promise<ConfirmCheckoutResult> => {
  const { data, error } = await supabase.functions.invoke("confirm-checkout-session", {
    body: { sessionId },
  });

  if (error) throw new Error(await extractFunctionErrorMessage(error));

  return data as ConfirmCheckoutResult;
};

export const getEmployerPremiumStatus = async (
  userId: string
): Promise<{
  plan: PremiumPlan;
  certificate: EmployerCertificate | null;
}> => {
  const { data: profileData, error: profileError } = await supabase
    .from("employer_profiles")
    .select("premium_plan")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const { data: certData, error: certError } = await supabase
    .from("employer_certificates")
    .select("*")
    .eq("employer_id", userId)
    .eq("status", "active")
    .order("issued_at", { ascending: false })
    .limit(1)
    .single();

  // Ignore 406 (Not Acceptable) or PGRST116 (No rows found) when checking certificates
  if (certError && certError.code !== "PGRST116") {
      // we only care if it's a real error, no cert is fine
      console.error(certError);
  }

  return {
    plan: profileData?.premium_plan || "free",
    certificate: certData as EmployerCertificate | null,
  };
};

async function extractFunctionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error as string;
    } catch {
      // fall through to generic message below
    }
  }
  return error instanceof Error ? error.message : "Payment request failed";
}
