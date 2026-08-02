// supabase/functions/confirm-checkout-session/index.ts
//
// Called by the client immediately after it returns from the Stripe Checkout
// browser tab, so the UI can reflect success/failure right away instead of
// waiting on the webhook. `stripe-webhook` remains the durable, authoritative
// source of truth (it's what still grants premium if the app is closed mid
// payment) — this endpoint shares the exact same idempotent finalize logic,
// so it's safe regardless of which one runs first.
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "npm:stripe@17.5.0";
import { corsHeaders } from "../_shared/cors.ts";
import { finalizeCheckoutSession } from "../_shared/finalizeCheckout.ts";

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

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt);
  if (userError || !userData?.user) {
    return json({ error: "Invalid or expired session" }, 401);
  }

  let payload: { sessionId?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const sessionId = payload.sessionId;
  if (!sessionId) {
    return json({ error: "`sessionId` is required" }, 400);
  }

  // Ownership check — a user may only ever confirm their own checkout session.
  const { data: sessionRow, error: sessionRowError } = await supabaseAdmin
    .from("payment_checkout_sessions")
    .select("status, plan")
    .eq("stripe_checkout_session_id", sessionId)
    .eq("user_id", userData.user.id)
    .single();

  if (sessionRowError || !sessionRow) {
    return json({ error: "Checkout session not found" }, 404);
  }

  if (sessionRow.status === "completed") {
    return json({ status: "completed", plan: sessionRow.plan }, 200);
  }

  // Never trust the client's optimistic "?status=success" redirect param —
  // ask Stripe directly what actually happened.
  let stripeSession: Stripe.Checkout.Session;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("Failed to retrieve Stripe session:", err);
    return json({ error: "Failed to verify payment with Stripe" }, 502);
  }

  if (stripeSession.payment_status === "paid") {
    await finalizeCheckoutSession(supabaseAdmin, stripeSession);
    return json({ status: "completed", plan: sessionRow.plan }, 200);
  }

  if (stripeSession.status === "expired") {
    await supabaseAdmin
      .from("payment_checkout_sessions")
      .update({ status: "expired" })
      .eq("stripe_checkout_session_id", sessionId);
    return json({ status: "expired" }, 200);
  }

  return json({ status: "pending" }, 200);
});
