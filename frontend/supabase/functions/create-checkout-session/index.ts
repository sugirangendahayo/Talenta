// supabase/functions/create-checkout-session/index.ts
//
// Creates a Stripe Checkout Session for a premium plan upgrade (employer or
// jobseeker). Replaces the old client-side `simulate*PaymentAndActivate()`
// fake-payment flow — this function never grants premium itself, it only
// starts a real Stripe payment. Premium is only ever granted after payment
// is verified, in `_shared/finalizeCheckout.ts` (invoked from
// `confirm-checkout-session` and `stripe-webhook`).
//
// Security:
// - The caller's identity is derived ONLY from their verified Supabase JWT
//   (`Authorization` header) — never trusted from the request body. A user
//   can only ever buy a plan for themselves.
// - Which plan a user may buy is validated server-side against their actual
//   role, business-verification status (employer) / profile completion
//   (jobseeker) — mirrors the client-side gating in the premium screens, but
//   is the authoritative check. The client is never trusted.
// - No price amounts are hardcoded here — the Stripe Price is resolved by
//   `lookup_key` (see `_shared/plans.ts`), so pricing changes happen entirely
//   in the Stripe Dashboard.
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "npm:stripe@17.5.0";
import { corsHeaders } from "../_shared/cors.ts";
import { findPlan, PlanRole } from "../_shared/plans.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // Resolve the *real* authenticated user from their JWT — never trust a
  // client-supplied user id.
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt);
  if (userError || !userData?.user) {
    return json({ error: "Invalid or expired session" }, 401);
  }
  const authUser = userData.user;

  let payload: { plan?: string; redirectUrl?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { plan, redirectUrl } = payload;
  if (!plan || !redirectUrl) {
    return json({ error: "`plan` and `redirectUrl` are required" }, 400);
  }

  // Resolve the user's role authoritatively from the DB — never from the client.
  const { data: profileRow, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (profileError || !profileRow) {
    return json({ error: "Profile not found" }, 404);
  }

  const role = profileRow.role as PlanRole | "admin";
  if (role !== "employer" && role !== "jobseeker") {
    return json({ error: "Only employers and jobseekers can purchase premium plans" }, 403);
  }

  const planDef = findPlan(role, plan);
  if (!planDef) {
    return json({ error: `'${plan}' is not a purchasable plan for role '${role}'` }, 400);
  }

  const table = role === "employer" ? "employer_profiles" : "jobseeker_profiles";
  const selectColumns =
    role === "employer"
      ? "email, premium_plan, premium_expires_at, stripe_customer_id, business_verification_status"
      : "email, premium_plan, premium_expires_at, stripe_customer_id, profile_completed";

  const { data: roleProfile, error: roleProfileError } = await supabaseAdmin
    .from(table)
    .select(selectColumns)
    .eq("id", authUser.id)
    .single();

  if (roleProfileError || !roleProfile) {
    return json({ error: `${role} profile not found` }, 404);
  }

  // Server-side gating — mirrors and enforces what the UI already shows.
  if (role === "employer" && roleProfile.business_verification_status !== "approved") {
    return json(
      { error: "Business verification must be approved before purchasing a premium plan" },
      403,
    );
  }
  if (role === "jobseeker" && !roleProfile.profile_completed) {
    return json({ error: "Complete your profile before purchasing a premium plan" }, 403);
  }

  // Block only if already on this exact plan AND it's still active.
  const stillActive =
    !!roleProfile.premium_expires_at && new Date(roleProfile.premium_expires_at) > new Date();
  if (roleProfile.premium_plan === plan && stillActive) {
    return json({ error: "You are already subscribed to this plan" }, 409);
  }

  // Resolve the Stripe Price via lookup_key — set once in the Stripe
  // Dashboard. No amounts are ever hardcoded in this codebase.
  let price: Stripe.Price | undefined;
  try {
    const prices = await stripe.prices.list({
      lookup_keys: [planDef.lookupKey],
      active: true,
      limit: 1,
    });
    price = prices.data[0];
  } catch (err) {
    console.error("Failed to look up Stripe price:", err);
    return json({ error: "Failed to reach Stripe" }, 502);
  }

  if (!price) {
    return json(
      {
        error: `No active Stripe Price found for lookup_key '${planDef.lookupKey}'. Create it in the Stripe Dashboard first.`,
      },
      500,
    );
  }

  // Reuse an existing Stripe Customer for this profile if we have one.
  let customerId = roleProfile.stripe_customer_id as string | null;
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: roleProfile.email ?? authUser.email ?? undefined,
        metadata: { supabase_user_id: authUser.id, role },
      });
      customerId = customer.id;
      await supabaseAdmin.from(table).update({ stripe_customer_id: customerId }).eq("id", authUser.id);
    } catch (err) {
      console.error("Failed to create Stripe customer:", err);
      return json({ error: "Failed to set up payment profile" }, 502);
    }
  }

  // Stripe rejects custom URL schemes (`talenta://...`, `exp://...`) for
  // success_url/cancel_url outright ("Not a valid URL") — it requires real
  // http(s) URLs. Route through an https "bounce page" that immediately
  // hands off to the real `redirectUrl` deep link the client is watching
  // for via `WebBrowser.openAuthSessionAsync`.
  //
  // ===> PLACEHOLDER: set PAYMENT_REDIRECT_BASE_URL if you want to use your
  // own React app's page instead of the built-in `payment-redirect` Edge
  // Function (e.g. `supabase secrets set
  // PAYMENT_REDIRECT_BASE_URL=https://your-react-app.com/payment-redirect`).
  // That page must read `status`, `session_id`, and `return_url` from its
  // own query string and redirect to `return_url` with `status`/`session_id`
  // appended — see supabase/functions/payment-redirect/index.ts for the
  // exact reference implementation/contract. Falls back to the built-in
  // Supabase page automatically if unset.
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const customRedirectBase = Deno.env.get("PAYMENT_REDIRECT_BASE_URL");
  const bounceUrl = customRedirectBase || `${supabaseUrl}/functions/v1/payment-redirect`;
  const encodedReturnUrl = encodeURIComponent(redirectUrl);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${bounceUrl}?status=success&session_id={CHECKOUT_SESSION_ID}&return_url=${encodedReturnUrl}`,
      cancel_url: `${bounceUrl}?status=cancel&return_url=${encodedReturnUrl}`,
      metadata: {
        supabase_user_id: authUser.id,
        role,
        plan,
        duration_days: String(planDef.durationDays),
      },
      payment_intent_data: {
        metadata: { supabase_user_id: authUser.id, role, plan },
      },
    });
  } catch (err) {
    console.error("Failed to create Stripe checkout session:", err);
    return json({ error: "Failed to start checkout" }, 502);
  }

  const { error: insertError } = await supabaseAdmin.from("payment_checkout_sessions").insert({
    user_id: authUser.id,
    role,
    plan,
    stripe_checkout_session_id: session.id,
    stripe_customer_id: customerId,
    amount_total: session.amount_total,
    currency: session.currency,
    status: "pending",
  });

  if (insertError) {
    console.error("Failed to record checkout session:", insertError);
    // Not fatal to the payment itself — the webhook can still finalize it
    // using Stripe's own session id — but log loudly since it breaks the
    // idempotency guard for this one session.
  }

  return json({ url: session.url, sessionId: session.id }, 200);
});
