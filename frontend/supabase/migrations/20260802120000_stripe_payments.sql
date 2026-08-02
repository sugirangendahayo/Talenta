-- =============================================================================
-- Real Stripe payment infrastructure, replacing the simulated premium upgrade
-- flow (previously: client called `simulate*PaymentAndActivate()` and wrote
-- directly to `employer_profiles` / `jobseeker_profiles` / the certificate
-- tables using its own session).
--
-- From this migration onward, `premium_plan` / `premium_activated_at` /
-- `premium_expires_at` and the certificate tables are ONLY ever written by
-- Supabase Edge Functions (create-checkout-session, confirm-checkout-session,
-- stripe-webhook) using the service-role key, which bypasses RLS entirely.
-- Regular users keep read-only access to their own rows.
-- =============================================================================

-- Track a Stripe Customer per profile so repeat purchases reuse the same
-- Stripe Customer instead of creating duplicates.
ALTER TABLE public.employer_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

ALTER TABLE public.jobseeker_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- One row per Stripe Checkout Session created. Serves as both an audit trail
-- and the idempotency guard that stops a single successful payment from
-- being processed twice (webhook retry vs. client-side confirm racing, or
-- Stripe's at-least-once webhook delivery).
CREATE TABLE IF NOT EXISTS public.payment_checkout_sessions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role                        VARCHAR NOT NULL CHECK (role IN ('employer', 'jobseeker')),
  plan                        VARCHAR NOT NULL,
  stripe_checkout_session_id  TEXT NOT NULL UNIQUE,
  stripe_customer_id          TEXT,
  stripe_payment_intent_id    TEXT,
  amount_total                INTEGER,
  currency                    VARCHAR DEFAULT 'usd',
  status                      VARCHAR NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  created_at                  TIMESTAMPTZ DEFAULT now(),
  completed_at                TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_checkout_sessions_user
  ON public.payment_checkout_sessions(user_id);

ALTER TABLE public.payment_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Users may only ever READ their own checkout sessions (e.g. so the client
-- can look up a session's status). All writes happen exclusively via the
-- service-role key inside Edge Functions — intentionally NO insert/update/
-- delete policy exists here for regular users.
DROP POLICY IF EXISTS "Users can view their own checkout sessions" ON public.payment_checkout_sessions;
CREATE POLICY "Users can view their own checkout sessions"
  ON public.payment_checkout_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all checkout sessions" ON public.payment_checkout_sessions;
CREATE POLICY "Admins can view all checkout sessions"
  ON public.payment_checkout_sessions
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Close the hole the simulated-payment flow left open: certificates could
-- previously be inserted directly by the client with their own session.
-- Certificates are now only ever issued by Edge Functions after a verified
-- Stripe payment (service role bypasses RLS regardless of these policies).
DROP POLICY IF EXISTS "Jobseekers can insert their own certificates" ON public.jobseeker_certificates;
DROP POLICY IF EXISTS "Employers can insert their own certificates" ON public.employer_certificates;

-- Let the notifications system announce a successful/failed premium purchase.
-- Additive change, following the same pattern as previous migrations.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (
  type::text = ANY (ARRAY[
    'application_shortlisted',
    'application_rejected',
    'application_hired',
    'new_application',
    'interview_scheduled',
    'interview_updated',
    'business_approved',
    'business_rejected',
    'moderation_warning',
    'moderation_suspension',
    'moderation_unsuspended',
    'moderation_banned',
    'moderation_unbanned',
    'moderation_under_review',
    'moderation_verification_revoked',
    'premium_activated',
    'premium_payment_failed'
  ]::text[])
);
