-- Add premium plan columns to jobseeker_profiles
ALTER TABLE public.jobseeker_profiles
ADD COLUMN premium_plan VARCHAR DEFAULT 'free' CHECK (premium_plan IN ('free', 'professional')),
ADD COLUMN premium_activated_at TIMESTAMPTZ,
ADD COLUMN premium_expires_at TIMESTAMPTZ;

-- Create jobseeker_certificates table
CREATE TABLE public.jobseeker_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id UUID NOT NULL REFERENCES public.jobseeker_profiles(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  plan VARCHAR NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on jobseeker_certificates
ALTER TABLE public.jobseeker_certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Jobseekers can read their own certificates
CREATE POLICY "Jobseekers can read their own certificates"
  ON public.jobseeker_certificates
  FOR SELECT
  USING (auth.uid() = jobseeker_id);

-- Policy: Admins can read all certificates
CREATE POLICY "Admins can read all certificates"
  ON public.jobseeker_certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Jobseekers can insert their own certificates (for the simulated payment)
CREATE POLICY "Jobseekers can insert their own certificates"
  ON public.jobseeker_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = jobseeker_id);

-- Policy: Admins can manage all certificates
CREATE POLICY "Admins can manage all certificates"
  ON public.jobseeker_certificates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
