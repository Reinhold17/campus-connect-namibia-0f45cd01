
-- Add new columns to profiles for tutor application
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS campus text,
ADD COLUMN IF NOT EXISTS neighbourhood text,
ADD COLUMN IF NOT EXISTS teaching_style text,
ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS student_id_url text,
ADD COLUMN IF NOT EXISTS government_id_url text;

-- Create tutor_module_grades table for module + grade pairs
CREATE TABLE IF NOT EXISTS public.tutor_module_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  grade text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tutor_module_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own module grades" ON public.tutor_module_grades
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own module grades" ON public.tutor_module_grades
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own module grades" ON public.tutor_module_grades
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all module grades" ON public.tutor_module_grades
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for identity documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-documents', 'identity-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for identity-documents bucket
CREATE POLICY "Users can upload own identity docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own identity docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all identity docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'identity-documents' AND public.has_role(auth.uid(), 'admin'));
