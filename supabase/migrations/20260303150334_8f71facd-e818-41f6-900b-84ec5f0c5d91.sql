
-- Sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  module_id UUID REFERENCES public.modules(id),
  subject TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'group' CHECK (type IN ('group', 'one-on-one')),
  price NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_students INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Tutors can create own sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Tutors can update own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can delete own sessions" ON public.sessions FOR DELETE USING (auth.uid() = tutor_id);

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'uploaded', 'confirmed', 'rejected')),
  payment_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Tutors can view bookings for their sessions" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = bookings.session_id AND sessions.tutor_id = auth.uid())
);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Admins can update any booking" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

CREATE POLICY "Students can upload own payment proofs" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view own payment proofs" ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all payment proofs" ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tutors can view payment proofs for their sessions" ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');
