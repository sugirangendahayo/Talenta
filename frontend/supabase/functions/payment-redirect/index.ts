// supabase/functions/payment-redirect/index.ts
//
// Stripe Checkout Sessions require `success_url`/`cancel_url` to be real
// http(s) URLs — it rejects custom URL schemes like `talenta://...` (or
// Expo Go's `exp://...`) outright with a "Not a valid URL" error. This
// public, unauthenticated endpoint is the https "bounce page" Stripe
// redirects the in-app browser to.
//
// IMPORTANT: the app's hooks (usePremiumStatus / useJobseekerPremiumStatus)
// no longer depend on the deep-link handoff below actually working. They
// always call `confirm-checkout-session` (which verifies directly with
// Stripe) the moment this browser session ends, REGARDLESS of whether that
// happened via a successful redirect or the user just closing the tab. So
// the automatic redirect + "Return to Talenta" button here are a
// best-effort convenience, not a correctness requirement — the primary
// guidance is simply "you can close this page now", since many mobile
// browsers block automatic navigation to non-http custom schemes anyway.
//
// This function performs NO database writes and requires NO auth — it only
// ever forwards `status`/`session_id` into a deep link redirect. All real
// payment verification/activation happens in `confirm-checkout-session`
// (client-triggered) and `stripe-webhook` (Stripe-triggered, authoritative).
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Light-touch open-redirect guard: only ever forward to this app's own
// custom scheme (production/dev-client builds) or Expo Go's dev scheme.
function isAllowedReturnUrl(value: string): boolean {
  return value.startsWith("talenta://") || value.startsWith("exp://") || value.startsWith("exp+talenta://");
}

serve((req: Request) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "unknown";
  const sessionId = url.searchParams.get("session_id");
  const returnUrl = url.searchParams.get("return_url");

  if (!returnUrl || !isAllowedReturnUrl(returnUrl)) {
    return new Response("Invalid or missing return_url", { status: 400 });
  }

  let deepLink: URL;
  try {
    deepLink = new URL(returnUrl);
  } catch {
    return new Response("Invalid return_url", { status: 400 });
  }

  deepLink.searchParams.set("status", status);
  if (sessionId) deepLink.searchParams.set("session_id", sessionId);

  const deepLinkStr = deepLink.toString();
  const heading = status === "success" ? "Payment received!" : "Checkout cancelled";
  const primaryMessage =
    status === "success"
      ? "You're all set. You can close this page now and go back to Talenta - your plan is already being activated."
      : "You can close this page now and go back to Talenta.";

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=${deepLinkStr}" />
    <title>Talenta</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        background: #080A08;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        text-align: center;
        padding: 24px;
        box-sizing: border-box;
      }
      .card { max-width: 340px; }
      h1 { font-size: 20px; margin: 0 0 12px; }
      p.primary { color: #fff; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
      a.button {
        display: block;
        background: transparent;
        color: #22d3ee;
        text-decoration: none;
        font-weight: 500;
        padding: 10px 16px;
        font-size: 14px;
      }
    </style>
    <script>
      // Best-effort automatic handoff. Many mobile browsers block automatic
      // navigation to non-http schemes without a user tap, so this may
      // silently no-op - that's fine, closing the page manually works too.
      window.location.replace(${JSON.stringify(deepLinkStr)});
    </script>
  </head>
  <body>
    <div class="card">
      <h1>${heading}</h1>
      <p class="primary">${primaryMessage}</p>
      <a class="button" href="${deepLinkStr}">Or tap here to return automatically</a>
    </div>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
