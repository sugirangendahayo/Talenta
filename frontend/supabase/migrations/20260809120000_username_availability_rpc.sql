-- Public sign-up happens before a user has a session, so RLS prevents the
-- client from reading existing profile rows. Expose only the boolean needed
-- for username validation rather than exposing profile data.

create or replace function public.is_username_available(
  p_candidate text,
  p_profile_table text,
  p_exclude_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_candidate text := lower(btrim(p_candidate));
begin
  if normalized_candidate is null or normalized_candidate = '' then
    return false;
  end if;

  if p_profile_table = 'jobseeker_profiles' then
    return not exists (
      select 1
      from public.jobseeker_profiles
      where lower(username) = normalized_candidate
        and (p_exclude_id is null or id <> p_exclude_id)
    );
  end if;

  if p_profile_table = 'employer_profiles' then
    return not exists (
      select 1
      from public.employer_profiles
      where lower(company_username) = normalized_candidate
        and (p_exclude_id is null or id <> p_exclude_id)
    );
  end if;

  return false;
end;
$$;

-- The function exposes no profile data and is needed before authentication.
revoke all on function public.is_username_available(text, text, uuid) from public;
grant execute on function public.is_username_available(text, text, uuid) to anon, authenticated;
