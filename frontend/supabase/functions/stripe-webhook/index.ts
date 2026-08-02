// supabase/functions/stripe-webhook/index.ts
//
// Durable, authoritative source of truth for premium activation. Stripe
// calls this directly (no Supabase JWT is ever sent — authenticity is
// verified via the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`,
// which is why `verify_jwt = false` is required for this function in
// config.toml). This is the ONLY place a payment is guaranteed to be
// processed even if the app was closed/killed mid-checkout.
//
// Registered events (see Phase 2 write-up for why):
//   - checkout.session.completed
//   - checkout.session.async_payment_succeeded
//   - checkout.session.async_payment_failed
//   - checkout.session.expired
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "npm:stripe@17.5.0";
import { finalizeCheckoutSession } from "../_shared/finalizeCheckout.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("Stripe-Signature");
  // IMPORTANT: read the raw body as text — signature verification fails if
  // the body has already been parsed/re-serialized as JSON.
  const body = await req.text();

  if (!signature) {
    return new Response("Missing Stripe-Signature header", { status: 400 });
  }
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return new Response("Webhook not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await finalizeCheckoutSession(supabaseAdmin, session);
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabaseAdmin
          .from("payment_checkout_sessions")
          .update({ status: "failed" })
          .eq("stripe_checkout_session_id", session.id);

        if (session.metadata?.supabase_user_id) {
          await supabaseAdmin.from("notifications").insert({
            user_id: session.metadata.supabase_user_id,
            type: "premium_payment_failed",
            title: "Payment failed",
            message: "Your premium plan payment could not be completed. Please try again.",
          });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabaseAdmin
          .from("payment_checkout_sessions")
          .update({ status: "expired" })
          .eq("stripe_checkout_session_id", session.id);
        break;
      }

      default:
        // Ignore anything else — only the events above are registered.
        break;
    }
  } catch (err) {
    console.error(`Error handling webhook event ${event.type}:`, err);
    // 500 so Stripe retries — finalizeCheckoutSession is idempotent, so a
    // retry can never double-grant premium.
    return new Response("Internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
