-- ============================================================
-- Trust & Safety / Moderation System Schema  (v2 — corrected)
-- ============================================================
-- Run each block separately in the Supabase SQL editor.
-- ============================================================


-- ── 1. Account Status on profiles ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status  VARCHAR DEFAULT 'active'
    CHECK (account_status IN ('active', 'under_review', 'suspended', 'banned')),
  ADD COLUMN IF NOT EXISTS suspension_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reputation_score   INT DEFAULT 100;

ALTER TABLE public.jobseeker_profiles
  ADD COLUMN IF NOT EXISTS account_status VARCHAR DEFAULT 'active'
    CHECK (account_status IN ('active', 'under_review', 'suspended', 'banned'));

ALTER TABLE public.employer_profiles
  ADD COLUMN IF NOT EXISTS account_status VARCHAR DEFAULT 'active'
    CHECK (account_status IN ('active', 'under_review', 'suspended', 'banned'));

-- Create a SECURITY DEFINER function to securely check admin status without triggering infinite RLS loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Ensure admins can read all profiles (fixes PGRST116 and 'unknown' reporter bugs)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all jobseeker_profiles" ON public.jobseeker_profiles;
CREATE POLICY "Admins can read all jobseeker_profiles"
  ON public.jobseeker_profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all employer_profiles" ON public.employer_profiles;
CREATE POLICY "Admins can read all employer_profiles"
  ON public.employer_profiles FOR SELECT
  USING (public.is_admin());

-- ── 2. Generic Reports Table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reports (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type   VARCHAR NOT NULL CHECK (target_type IN ('user', 'job', 'post', 'comment', 'company')),
    target_id     UUID NOT NULL,
    reason        VARCHAR NOT NULL CHECK (reason IN ('spam', 'harassment', 'fraud', 'inappropriate', 'suspicious', 'other')),
    details       TEXT,
    status        VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now(),

    -- Prevent the same reporter from filing the same reason against the same target twice
    CONSTRAINT reports_unique_per_reporter UNIQUE (reporter_id, target_id, target_type, reason)
);

-- Useful index for admins filtering by status
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target  ON public.reports(target_id, target_type);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert reports"           ON public.reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view their own reports"   ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports"        ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports"          ON public.reports;

CREATE POLICY "Users can insert their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ── 3. Moderation Actions (Audit Trail) ────────────────────────────────────────
-- NOTE: admin_id is NULLABLE (ON DELETE SET NULL) so history survives even if
-- the admin account is removed.  NOT NULL would contradict ON DELETE SET NULL.

CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- nullable, intentionally
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type    VARCHAR NOT NULL CHECK (action_type IN (
                     'warning', 'under_review', 'suspension', 'ban', 'unban',
                     'flag_suspicious', 'verification_revoked', 'unsuspend'
                   )),
    reason         TEXT NOT NULL,
    internal_notes TEXT,
    duration_hours INT,  -- for suspensions
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_target ON public.moderation_actions(target_user_id);

-- RLS — only admins
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage moderation actions" ON public.moderation_actions;

CREATE POLICY "Admins can manage moderation actions"
  ON public.moderation_actions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ── 4. User Blocks ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_blocks (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Admins can view all blocks"        ON public.user_blocks;

CREATE POLICY "Users can manage their own blocks"
  ON public.user_blocks FOR ALL
  USING (auth.uid() = blocker_id);

CREATE POLICY "Admins can view all blocks"
  ON public.user_blocks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ── 5. RPC: admin_ban_user ─────────────────────────────────────────────────────
-- Bans a user permanently via Supabase's native banned_until mechanism.
-- Uses SECURITY DEFINER so it can write to auth.users from a regular client.

CREATE OR REPLACE FUNCTION public.admin_ban_user(
    target_user_id UUID,
    ban_reason     TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role VARCHAR;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized. Only admins can ban users.';
    END IF;

    -- Block Supabase login by setting banned_until far in the future
    UPDATE auth.users SET banned_until = '2099-12-31 00:00:00+00' WHERE id = target_user_id;

    -- Mirror status in public schema for easy querying
    UPDATE public.profiles           SET account_status = 'banned' WHERE id = target_user_id;
    UPDATE public.jobseeker_profiles SET account_status = 'banned' WHERE id = target_user_id;
    UPDATE public.employer_profiles  SET account_status = 'banned' WHERE id = target_user_id;

    -- Audit trail
    INSERT INTO public.moderation_actions (admin_id, target_user_id, action_type, reason, internal_notes)
    VALUES (auth.uid(), target_user_id, 'ban', ban_reason, 'Permanent ban via admin_ban_user()');
END;
$$;


-- ── 6. RPC: admin_unban_user ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_unban_user(
    target_user_id UUID,
    unban_reason   TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role VARCHAR;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized. Only admins can unban users.';
    END IF;

    UPDATE auth.users SET banned_until = NULL WHERE id = target_user_id;

    UPDATE public.profiles           SET account_status = 'active' WHERE id = target_user_id;
    UPDATE public.jobseeker_profiles SET account_status = 'active' WHERE id = target_user_id;
    UPDATE public.employer_profiles  SET account_status = 'active' WHERE id = target_user_id;

    INSERT INTO public.moderation_actions (admin_id, target_user_id, action_type, reason, internal_notes)
    VALUES (auth.uid(), target_user_id, 'unban', unban_reason, 'Account restored via admin_unban_user()');
END;
$$;


-- ── 7. RPC: admin_suspend_user ─────────────────────────────────────────────────
-- A time-limited suspension (different from a permanent ban).

CREATE OR REPLACE FUNCTION public.admin_suspend_user(
    target_user_id UUID,
    suspend_reason TEXT,
    hours          INT DEFAULT 72
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role VARCHAR;
    ends_at     TIMESTAMPTZ;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized. Only admins can suspend users.';
    END IF;

    ends_at := now() + (hours || ' hours')::INTERVAL;

    -- Use banned_until for the suspension window — native Supabase mechanism
    UPDATE auth.users SET banned_until = ends_at WHERE id = target_user_id;

    UPDATE public.profiles SET account_status = 'suspended', suspension_ends_at = ends_at
    WHERE id = target_user_id;

    UPDATE public.jobseeker_profiles SET account_status = 'suspended' WHERE id = target_user_id;
    UPDATE public.employer_profiles  SET account_status = 'suspended' WHERE id = target_user_id;

    INSERT INTO public.moderation_actions
      (admin_id, target_user_id, action_type, reason, internal_notes, duration_hours)
    VALUES
      (auth.uid(), target_user_id, 'suspension', suspend_reason,
       'Temporary suspension via admin_suspend_user()', hours);
END;
$$;


-- ── 8. RPC: admin_unsuspend_user ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_unsuspend_user(
    target_user_id UUID,
    unsuspend_reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role VARCHAR;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized. Only admins can unsuspend users.';
    END IF;

    UPDATE auth.users SET banned_until = NULL WHERE id = target_user_id;

    UPDATE public.profiles SET account_status = 'active', suspension_ends_at = NULL
    WHERE id = target_user_id;

    UPDATE public.jobseeker_profiles SET account_status = 'active' WHERE id = target_user_id;
    UPDATE public.employer_profiles  SET account_status = 'active' WHERE id = target_user_id;

    INSERT INTO public.moderation_actions (admin_id, target_user_id, action_type, reason, internal_notes)
    VALUES (auth.uid(), target_user_id, 'unsuspend', unsuspend_reason, 'Suspension lifted early by admin');
END;
$$;


-- ── 9. RPC: admin_set_under_review ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_set_under_review(
    target_user_id UUID,
    review_reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role VARCHAR;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized. Only admins can set users under review.';
    END IF;

    UPDATE public.profiles SET account_status = 'under_review' WHERE id = target_user_id;
    UPDATE public.jobseeker_profiles SET account_status = 'under_review' WHERE id = target_user_id;
    UPDATE public.employer_profiles  SET account_status = 'under_review' WHERE id = target_user_id;

    INSERT INTO public.moderation_actions (admin_id, target_user_id, action_type, reason, internal_notes)
    VALUES (auth.uid(), target_user_id, 'under_review', review_reason, 'Account placed under review');
END;
$$;


-- ── 10. Notification types for moderation (safe — only adds moderation types) ──
-- We do NOT drop the constraint; we recreate it with the original + new values.
-- If your notifications table already has a type constraint, replace it carefully:

-- First check what your current constraint looks like:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'notifications_type_check';

-- Then run ONE of the following depending on what currently exists:

-- OPTION A — if the table already has the application + business types:
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (
  type::text = ANY (ARRAY[
    'application_shortlisted',
    'application_rejected',
    'application_hired',
    'new_application',
    'business_approved',
    'business_rejected',
    'moderation_warning',
    'moderation_suspension',
    'moderation_banned'
  ]::text[])
);
