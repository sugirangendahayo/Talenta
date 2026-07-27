-- =============================================================================
-- Auto-create role-specific profile rows on signup
--
-- Problem: `useSignupForm` inserted into `jobseeker_profiles` /
-- `employer_profiles` from the client immediately after
-- `supabase.auth.signUp()`. When "Confirm email" is required, `signUp()`
-- does not return a session, so that insert runs as the anonymous role and
-- is rejected by RLS:
--
--   new row violates row-level security policy for table "jobseeker_profiles"
--
-- Fix: create the row from a trigger on `auth.users`, mirroring the existing
-- trigger that already populates `public.profiles` from signup metadata.
-- Triggers fired by Supabase Auth's own INSERT into `auth.users` run under
-- its privileged database role, which bypasses RLS — so this works
-- regardless of the project's email-confirmation setting.
--
-- This only fires for password/email sign-ups that already carry the
-- role-specific fields collected on the sign-up form (passed via
-- `options.data`). Google OAuth sign-ins are unaffected — those users still
-- finish setup on the "complete-oauth-profile" screen, which creates its
-- own profile row once a role is chosen.
--
-- Defensive by design: any unexpected failure here is caught and logged
-- rather than raised, so it can never block account creation. As a second
-- safety net, `AuthContext.fetchProfile` also self-heals a missing
-- role-specific profile the first time the user has an authenticated
-- session (see the frontend change accompanying this migration).
-- =============================================================================

create or replace function public.handle_new_user_role_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text := new.raw_user_meta_data->>'role';
  v_username text := new.raw_user_meta_data->>'username';
  v_full_name text := coalesce(new.raw_user_meta_data->>'full_name', '');
  v_company_name text := coalesce(new.raw_user_meta_data->>'company_name', '');
  v_company_username text := new.raw_user_meta_data->>'company_username';
  v_website text := new.raw_user_meta_data->>'website';
begin
  if v_role = 'jobseeker' and v_username is not null then
    begin
      insert into public.jobseeker_profiles (id, full_name, username, email, profile_completed)
      values (new.id, v_full_name, v_username, new.email, false);
    exception when unique_violation then
      -- Username was taken by a race condition; fall back to a
      -- guaranteed-unique suffix rather than failing the whole sign-up.
      insert into public.jobseeker_profiles (id, full_name, username, email, profile_completed)
      values (new.id, v_full_name, v_username || '_' || substr(new.id::text, 1, 6), new.email, false)
      on conflict (id) do nothing;
    end;
  elsif v_role = 'employer' and v_company_username is not null then
    begin
      insert into public.employer_profiles (id, company_name, company_username, email, company_website, profile_completed, is_verified)
      values (new.id, v_company_name, v_company_username, new.email, v_website, false, false);
    exception when unique_violation then
      insert into public.employer_profiles (id, company_name, company_username, email, company_website, profile_completed, is_verified)
      values (new.id, v_company_name, v_company_username || '_' || substr(new.id::text, 1, 6), new.email, v_website, false, false)
      on conflict (id) do nothing;
    end;
  end if;

  return new;
exception when others then
  -- Never block account creation because of this convenience insert; worst
  -- case AuthContext's self-heal (or the user) completes it later.
  raise warning 'handle_new_user_role_profile failed for user %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists trg_create_role_profile_on_signup on auth.users;

create trigger trg_create_role_profile_on_signup
  after insert on auth.users
  for each row
  execute function public.handle_new_user_role_profile();
