
-- Universities table
CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view universities" ON public.universities FOR SELECT USING (true);

-- Faculties table
CREATE TABLE public.faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(university_id, name)
);
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view faculties" ON public.faculties FOR SELECT USING (true);

-- Modules table
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(faculty_id, name)
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);

-- Tutor-modules many-to-many
CREATE TABLE public.tutor_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);
ALTER TABLE public.tutor_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tutor modules" ON public.tutor_modules FOR SELECT USING (true);
CREATE POLICY "Tutors can manage own modules" ON public.tutor_modules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tutors can delete own modules" ON public.tutor_modules FOR DELETE USING (auth.uid() = user_id);

-- Add phone_number to profiles
ALTER TABLE public.profiles ADD COLUMN phone_number text;
