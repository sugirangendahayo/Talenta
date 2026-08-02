// supabase/functions/_shared/cors.ts
// Shared CORS headers for the payment-related Edge Functions. Mirrors the
// headers already used in send-interview-email / send-push-notification /
// auth-precheck, plus `stripe-signature` since the webhook needs it exposed.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
