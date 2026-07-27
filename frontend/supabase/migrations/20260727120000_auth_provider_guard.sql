-- =============================================================================
-- Auth provider guard
--
-- Goal: prevent duplicate accounts for the same email across different
-- authentication providers, and let the app give users clear guidance about
-- which provider they should use (e.g. "This account was created using
-- Google Sign-In").
--
-- This is intentionally built on top of Supabase's native `auth.identities`
-- table (one row per linked provider, per user) instead of a bespoke table,
-- so it stays correct and extensible if a user ever links *multiple*
-- providers (email/password + Google) to a single account in the future.
-- =============================================================================

-- ── 1. RPC: get_account_auth_info ───────────────────────────────────────────
-- Given an email, reports whether an account exists and which providers are
-- linked to it. SECURITY DEFINER is required because `auth.users` /
-- `auth.identities` are not directly readable by the anon/authenticated
-- roles used by PostgREST.
create or replace function public.get_account_auth_info(p_email text)
returns table (
  "exists" boolean,
  user_id uuid,
  providers text[],
  has_password boolean,
  has_google boolean
)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid;
  v_providers text[];
begin
  select u.id
    into v_user_id
    from auth.users u
   where lower(u.email) = lower(p_email)
   limit 1;

  if v_user_id is null then
    return query select false, null::uuid, array[]::text[], false, false;
    return;
  end if;

  select coalesce(array_agg(distinct i.provider), array[]::text[])
    into v_providers
    from auth.identities i
   where i.user_id = v_user_id;

  return query
    select
      true,
      v_user_id,
      v_providers,
      ('email' = any (v_providers)),
      ('google' = any (v_providers));
end;
$$;

comment on function public.get_account_auth_info(text) is
  'Returns whether an account exists for an email and which auth providers '
  '(identities) are linked to it. Used to guide users to the correct sign-in '
  'method instead of generic auth errors.';

revoke all on function public.get_account_auth_info(text) from public;
grant execute on function public.get_account_auth_info(text) to anon, authenticated, service_role;

-- ── 2. Trigger: block silent cross-provider auto-linking ───────────────────
-- By default, Supabase Auth automatically links a new Google identity to an
-- existing user that already has the same (verified) email — even if that
-- user originally signed up with email/password. That would let someone
-- silently log into an existing password account via Google, and it hides
-- the fact that a distinct sign-in method already exists.
--
-- We block that specific case at the database level (the real "source of
-- truth" for identity linking) so it can never be bypassed, regardless of
-- which client performs the OAuth flow. When blocked, Supabase Auth surfaces
-- the raised message back to the app via the OAuth redirect's
-- `error_description` query parameter.
create or replace function public.prevent_cross_provider_auto_link()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_existing_providers text[];
begin
  -- Only Google sign-ins can trigger unwanted auto-linking today. Extend this
  -- list if/when more OAuth providers are added.
  if new.provider <> 'google' then
    return new;
  end if;

  select coalesce(array_agg(distinct i.provider), array[]::text[])
    into v_existing_providers
    from auth.identities i
   where i.user_id = new.user_id
     and i.provider <> 'google';

  if 'email' = any (v_existing_providers) then
    raise exception
      using errcode = 'P0001',
            message = 'An account with this email already exists. Please sign in using your email and password.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_cross_provider_auto_link on auth.identities;

create trigger trg_prevent_cross_provider_auto_link
  before insert on auth.identities
  for each row
  execute function public.prevent_cross_provider_auto_link();
