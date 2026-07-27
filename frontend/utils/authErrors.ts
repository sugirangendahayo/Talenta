/**
 * Detects Supabase Auth's "email rate limit exceeded" error, which fires
 * when too many auth emails (signup confirmation, password reset, resend,
 * magic link, etc.) are sent in a short window. This is especially easy to
 * hit while testing, since the project's default built-in email service has
 * a very low quota (a handful of emails per hour) — production apps should
 * configure a custom SMTP provider in the Supabase Dashboard under
 * Authentication → SMTP Settings to raise this limit.
 */
export function isEmailRateLimitError(error: unknown): boolean {
  const message = (error as { message?: string })?.message?.toLowerCase() || "";
  return message.includes("rate limit") || message.includes("too many requests");
}
