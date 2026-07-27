-- =============================================================================
-- Keep `profile_completed` authoritative at the database level
--
-- Bug: jobseeker profile completion could go out of sync. `useProfileCompletion`
-- computes and writes `profile_completed` when the main profile form is saved,
-- but CV upload/delete (`useCVManagement`) writes directly to
-- `jobseeker_profiles.cv_document_url` without recomputing `profile_completed`.
-- Result: a user could have every required field filled (100% complete by
-- actual data) while the stored `profile_completed` flag stays stuck at
-- whatever it was last computed as — exactly what showed up in
-- `premium-upgrade.tsx` and the mismatched banner on the Profile screen.
--
-- Employers didn't hit this because they only have a single save path
-- (`useEmployerProfileCompletion`) that touches every field.
--
-- Fix: make `profile_completed` a trigger-computed column on BOTH tables, so
-- it's always derived from the row's actual data regardless of which code
-- path (current or future) writes to it. Client-submitted values for this
-- column are ignored/overwritten — this is now the single source of truth.
-- =============================================================================

create or replace function public.sync_jobseeker_profile_completed()
returns trigger
language plpgsql
as $$
begin
  new.profile_completed :=
    coalesce(new.full_name::text, '') <> ''
    and coalesce(new.username::text, '') <> ''
    and coalesce(new.email::text, '') <> ''
    and coalesce(new.phone::text, '') <> ''
    and coalesce(new.date_of_birth::text, '') <> ''
    and coalesce(new.gender::text, '') <> ''
    and coalesce(new.country::text, '') <> ''
    and coalesce(new.city::text, '') <> ''
    and coalesce(new.education_level::text, '') <> ''
    and coalesce(new.experience_level::text, '') <> ''
    and coalesce(new.skills::text, '') not in ('', '{}', '[]', 'null')
    and coalesce(new.cv_document_url::text, '') <> ''
    and coalesce(new.profile_image_url::text, '') <> '';

  return new;
end;
$$;

drop trigger if exists trg_sync_jobseeker_profile_completed on public.jobseeker_profiles;

create trigger trg_sync_jobseeker_profile_completed
  before insert or update on public.jobseeker_profiles
  for each row
  execute function public.sync_jobseeker_profile_completed();

-- Same treatment for employers, so this can never silently drift for them
-- either as new profile fields/upload flows are added in the future.
create or replace function public.sync_employer_profile_completed()
returns trigger
language plpgsql
as $$
begin
  new.profile_completed :=
    coalesce(new.company_name::text, '') <> ''
    and coalesce(new.company_username::text, '') <> ''
    and coalesce(new.email::text, '') <> ''
    and coalesce(new.phone::text, '') <> ''
    and coalesce(new.country::text, '') <> ''
    and coalesce(new.city::text, '') <> ''
    and coalesce(new.company_address::text, '') <> ''
    and coalesce(new.company_website::text, '') <> ''
    and coalesce(new.profile_image_url::text, '') <> '';

  return new;
end;
$$;

drop trigger if exists trg_sync_employer_profile_completed on public.employer_profiles;

create trigger trg_sync_employer_profile_completed
  before insert or update on public.employer_profiles
  for each row
  execute function public.sync_employer_profile_completed();

-- One-off backfill so existing rows reflect reality immediately instead of
-- waiting for the next update to each row.
update public.jobseeker_profiles set updated_at = updated_at;
update public.employer_profiles set updated_at = updated_at;
