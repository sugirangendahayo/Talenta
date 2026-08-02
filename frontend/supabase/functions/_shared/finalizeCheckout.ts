// supabase/functions/_shared/finalizeCheckout.ts
//
// Single source of truth for "grant premium after a paid Stripe Checkout
// Session". Called from BOTH `stripe-webhook` (durable — works even if the
// app was closed mid-payment) and `confirm-checkout-session` (fast
// client-side feedback right after returning from the Stripe payment page).
//
// MUST stay idempotent: Stripe retries webhooks, and the client-confirm path
// can race the webhook for the same session, so this is safe to call more
// than once for the same `stripe_checkout_session_id`.
// deno-lint-ignore-file no-explicit-any
import type Stripe from "npm:stripe@17.5.0";

export async function finalizeCheckoutSession(
  supabaseAdmin: any,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const stripeSessionId = session.id;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("payment_checkout_sessions")
    .select("status")
    .eq("stripe_checkout_session_id", stripeSessionId)
    .single();

  if (existingError) {
    console.error("finalizeCheckoutSession: could not load session row:", existingError);
    return;
  }
  if (existing?.status === "completed") {
    // Already processed — nothing to do.
    return;
  }

  const userId = session.metadata?.supabase_user_id;
  const role = session.metadata?.role;
  const plan = session.metadata?.plan;
  const durationDays = Number(session.metadata?.duration_days ?? "365");

  if (!userId || !role || !plan) {
    console.error("finalizeCheckoutSession: missing metadata on session", stripeSessionId, session.metadata);
    return;
  }

  const table = role === "employer" ? "employer_profiles" : "jobseeker_profiles";
  const certTable = role === "employer" ? "employer_certificates" : "jobseeker_certificates";
  const certIdColumn = role === "employer" ? "employer_id" : "jobseeker_id";
  const certPrefix = role === "employer" ? "TALENTA-CERT" : "TALENTA-JS";

  const issuedAt = new Date().toISOString();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);
  const expiresAtStr = expiresAt.toISOString();

  const { error: profileError } = await supabaseAdmin
    .from(table)
    .update({
      premium_plan: plan,
      premium_activated_at: issuedAt,
      premium_expires_at: expiresAtStr,
      updated_at: issuedAt,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("finalizeCheckoutSession: failed to activate plan:", profileError);
    throw profileError;
  }

  const certNumber = `${certPrefix}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

  const { error: certError } = await supabaseAdmin.from(certTable).insert({
    [certIdColumn]: userId,
    certificate_number: certNumber,
    plan,
    issued_at: issuedAt,
    expires_at: expiresAtStr,
    status: "active",
  });

  if (certError) {
    // Non-fatal — the plan is already active, the certificate is a bonus
    // record. Log loudly so it can be backfilled if needed.
    console.error("finalizeCheckoutSession: failed to insert certificate:", certError);
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const { error: sessionUpdateError } = await supabaseAdmin
    .from("payment_checkout_sessions")
    .update({
      status: "completed",
      completed_at: issuedAt,
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("stripe_checkout_session_id", stripeSessionId);

  if (sessionUpdateError) {
    console.error("finalizeCheckoutSession: failed to mark session completed:", sessionUpdateError);
  }

  const { error: notificationError } = await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    type: "premium_activated",
    title: "Premium activated!",
    message: `Your ${plan} plan is now active. Welcome to Talenta Premium.`,
  });

  if (notificationError) {
    console.error("finalizeCheckoutSession: failed to insert notification:", notificationError);
  }
}
