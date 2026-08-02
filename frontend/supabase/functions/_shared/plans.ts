// supabase/functions/_shared/plans.ts
//
// Single source of truth (server-side) for which premium plans exist per
// role, and which Stripe Price `lookup_key` each one maps to. No dollar
// amounts live here or anywhere else in the code — the actual price is
// whatever you set on the Stripe Price object in the Dashboard. This file
// only decides WHICH Stripe Price to use and for how long the plan lasts.
//
// The `plan` values below must exactly match the `premium_plan` CHECK
// constraints in `employer_profiles` / `jobseeker_profiles`
// (see supabase/verification_migration.sql and
// supabase/jobseeker_premium_migration.sql). "free" and employer's
// "enterprise" are intentionally NOT listed here — "free" needs no payment,
// and "enterprise" is a custom/contact-sales plan with no self-serve
// Stripe Price.
export type PlanRole = "employer" | "jobseeker";

export interface PlanDefinition {
  role: PlanRole;
  plan: string;
  /** Must match the `lookup_key` set on the corresponding Stripe Price. */
  lookupKey: string;
  /** How long the plan stays active after a successful payment. */
  durationDays: number;
}

export const PAYABLE_PLANS: PlanDefinition[] = [
  { role: "employer", plan: "professional", lookupKey: "employer_professional", durationDays: 365 },
  { role: "employer", plan: "business", lookupKey: "employer_business", durationDays: 365 },
  { role: "jobseeker", plan: "professional", lookupKey: "jobseeker_professional", durationDays: 365 },
];

export function findPlan(role: PlanRole, plan: string): PlanDefinition | undefined {
  return PAYABLE_PLANS.find((p) => p.role === role && p.plan === plan);
}
