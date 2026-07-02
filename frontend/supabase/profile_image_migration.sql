-- Migration: Add profile_image_url to employer and jobseeker profiles
-- Run this in your Supabase SQL Editor

-- 1. Add profile_image_url to employer_profiles
ALTER TABLE public.employer_profiles
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT NULL;

-- 2. Add profile_image_url to jobseeker_profiles
ALTER TABLE public.jobseeker_profiles
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT NULL;

-- 3. Create a storage bucket for profile images (run if it doesn't already exist)
-- If the bucket already exists, this will be a no-op:
INSERT INTO storage.buckets (id, name, public)
  VALUES ('profiles', 'profiles', true)
  ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS: allow authenticated users to upload their own profile image
CREATE POLICY "Users can upload their own profile image"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Storage RLS: allow authenticated users to update their own profile image
CREATE POLICY "Users can update their own profile image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. Storage RLS: allow authenticated users to delete their own profile image
CREATE POLICY "Users can delete their own profile image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. Storage RLS: everyone can read profile images (they are public)
CREATE POLICY "Profile images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');
