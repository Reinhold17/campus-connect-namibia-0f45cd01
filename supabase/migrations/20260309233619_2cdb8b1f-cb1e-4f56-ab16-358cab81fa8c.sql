
-- Create tutor_photos table for multiple profile pictures
CREATE TABLE public.tutor_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutor_photos ENABLE ROW LEVEL SECURITY;

-- Tutors can insert their own photos
CREATE POLICY "Users can insert own photos"
  ON public.tutor_photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tutors can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON public.tutor_photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can view tutor photos
CREATE POLICY "Anyone can view tutor photos"
  ON public.tutor_photos FOR SELECT
  USING (true);

-- Create storage bucket for tutor profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-photos', 'tutor-photos', true);

-- Storage policies for tutor photos
CREATE POLICY "Users can upload own tutor photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tutor-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own tutor photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tutor-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view tutor photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tutor-photos');
