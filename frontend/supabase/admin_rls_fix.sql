-- ============================================================
-- Fix: Allow admins to read all jobseeker and employer profiles
-- Run this in your Supabase SQL editor if admins see empty lists
-- ============================================================

-- Allow admins to read all jobseeker_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'jobseeker_profiles'
      AND policyname = 'Admins can read all jobseeker profiles'
  ) THEN
    CREATE POLICY "Admins can read all jobseeker profiles"
      ON public.jobseeker_profiles
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow admins to read all employer_profiles (in case this is also missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'employer_profiles'
      AND policyname = 'Admins can read all employer profiles'
  ) THEN
    CREATE POLICY "Admins can read all employer profiles"
      ON public.employer_profiles
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow admins to update employer_profiles (needed for verify/reject actions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'employer_profiles'
      AND policyname = 'Admins can update all employer profiles'
  ) THEN
    CREATE POLICY "Admins can update all employer profiles"
      ON public.employer_profiles
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow admins to read all jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'jobs'
      AND policyname = 'Admins can read all jobs'
  ) THEN
    CREATE POLICY "Admins can read all jobs"
      ON public.jobs
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow admins to update jobs (needed for status changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'jobs'
      AND policyname = 'Admins can update all jobs'
  ) THEN
    CREATE POLICY "Admins can update all jobs"
      ON public.jobs
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
