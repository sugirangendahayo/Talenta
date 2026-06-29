-- Add business verification and premium plan columns to employer_profiles
ALTER TABLE public.employer_profiles
ADD COLUMN business_verification_status VARCHAR DEFAULT 'not_submitted' CHECK (business_verification_status IN ('not_submitted', 'pending_review', 'approved', 'rejected')),
ADD COLUMN business_rejection_reason TEXT,
ADD COLUMN business_docs_urls TEXT[],
ADD COLUMN business_docs_submitted_at TIMESTAMPTZ,
ADD COLUMN premium_plan VARCHAR DEFAULT 'free' CHECK (premium_plan IN ('free', 'professional', 'business', 'enterprise')),
ADD COLUMN premium_activated_at TIMESTAMPTZ,
ADD COLUMN premium_expires_at TIMESTAMPTZ;

-- Create employer_certificates table
CREATE TABLE public.employer_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  plan VARCHAR NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on employer_certificates
ALTER TABLE public.employer_certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Employers can read their own certificates
CREATE POLICY "Employers can read their own certificates"
  ON public.employer_certificates
  FOR SELECT
  USING (auth.uid() = employer_id);

-- Policy: Admins can read all certificates
CREATE POLICY "Admins can read all certificates"
  ON public.employer_certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Employers can insert their own certificates (for the simulated payment)
CREATE POLICY "Employers can insert their own certificates"
  ON public.employer_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

-- Policy: Admins can manage all certificates
CREATE POLICY "Admins can manage all certificates"
  ON public.employer_certificates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Modify notifications type constraint to allow business verification statuses
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (
  type::text = ANY (ARRAY[
    'application_shortlisted'::character varying,
    'application_rejected'::character varying,
    'application_hired'::character varying,
    'new_application'::character varying,
    'interview_scheduled'::character varying,
    'interview_updated'::character varying,
    'business_approved'::character varying,
    'business_rejected'::character varying
  ]::text[])
);
