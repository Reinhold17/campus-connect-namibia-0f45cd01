-- Create table to store tutor agreement acceptances
CREATE TABLE public.tutor_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  info_accurate BOOLEAN NOT NULL DEFAULT false,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  contract_understood BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.tutor_agreements ENABLE ROW LEVEL SECURITY;

-- Users can insert their own agreement
CREATE POLICY "Users can insert own agreement"
ON public.tutor_agreements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own agreement
CREATE POLICY "Users can view own agreement"
ON public.tutor_agreements FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all agreements
CREATE POLICY "Admins can view all agreements"
ON public.tutor_agreements FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add hourly_rate column to profiles for tutors
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT NULL;