-- Public Talenta profile links must work before sign-in. RLS intentionally
-- prevents direct anonymous reads of profile tables, so expose only the fields
-- rendered on the public profile screen through this narrowly scoped function.

create or replace function public.get_public_user_profile(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_role text;
  public_profile jsonb;
begin
  select role
    into target_role
  from public.profiles
  where id = p_user_id;

  if target_role = 'employer' then
    select jsonb_build_object(
      'id', id,
      'role', 'employer',
      'company_name', company_name,
      'company_username', company_username,
      'email', email,
      'phone', phone,
      'company_website', company_website,
      'company_address', company_address,
      'country', country,
      'city', city,
      'profile_image_url', profile_image_url,
      'business_verification_status', business_verification_status,
      'premium_plan', premium_plan
    )
      into public_profile
    from public.employer_profiles
    where id = p_user_id;
  elsif target_role = 'jobseeker' then
    select jsonb_build_object(
      'id', id,
      'role', 'jobseeker',
      'full_name', full_name,
      'username', username,
      'country', country,
      'city', city,
      'experience_level', experience_level,
      'education_level', education_level,
      'skills', skills,
      'profile_image_url', profile_image_url,
      'premium_plan', premium_plan
    )
      into public_profile
    from public.jobseeker_profiles
    where id = p_user_id;
  end if;

  return public_profile;
end;
$$;

revoke all on function public.get_public_user_profile(uuid) from public;
grant execute on function public.get_public_user_profile(uuid) to anon, authenticated;
