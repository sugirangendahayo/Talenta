// supabase/functions/auth-precheck/index.ts
//
// Pre-flight check used by the sign-in / Google sign-in flows to guide users
// to the correct authentication method instead of generic auth errors.
//
// It answers: "For this email, which provider(s) is the account already
// using?" based on Supabase's own `auth.identities` table (via the
// `public.get_account_auth_info` RPC), then maps that to a structured
// response with an HTTP status the frontend can branch on.
//
// Statuses:
//   - "ok"            → safe to proceed with the requested sign-in method
//   - "not_found"      (404) → no account exists for this email
//   - "google_only"    (409) → account exists, but only has a Google identity
//                               (used when intent = "password")
//   - "password_only"  (409) → account exists, but only has an email/password
//                               identity (used when intent = "google")
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Intent = "password" | "google";

interface PrecheckPayload {
  email: string;
  intent: Intent;
}

interface AccountAuthInfo {
  exists: boolean;
  user_id: string | null;
  providers: string[];
  has_password: boolean;
  has_google: boolean;
}

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
    return json({ status: "error", message: "Method not allowed" }, 405);
  }

  let payload: PrecheckPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ status: "error", message: "Invalid JSON body" }, 400);
  }

  const email = payload?.email?.trim().toLowerCase();
  const intent = payload?.intent;

  if (!email || (intent !== "password" && intent !== "google")) {
    return json(
      { status: "error", message: "`email` and `intent` ('password' | 'google') are required" },
      400,
    );
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabaseAdmin
    .rpc("get_account_auth_info", { p_email: email })
    .single<AccountAuthInfo>();

  if (error) {
    console.error("get_account_auth_info RPC failed:", error);
    return json({ status: "error", message: "Failed to check account" }, 500);
  }

  const info = data as AccountAuthInfo;

  if (!info.exists) {
    return json(
      {
        status: "not_found",
        message: "No account found with this email address.",
        providers: [],
      },
      404,
    );
  }

  if (intent === "password" && info.has_google && !info.has_password) {
    return json(
      {
        status: "google_only",
        message:
          "This account was created using Google Sign-In. Please continue with Google.",
        providers: info.providers,
      },
      409,
    );
  }

  if (intent === "google" && info.has_password && !info.has_google) {
    return json(
      {
        status: "password_only",
        message:
          "An account with this email already exists. Please sign in using your email and password.",
        providers: info.providers,
      },
      409,
    );
  }

  return json({ status: "ok", providers: info.providers }, 200);
});
