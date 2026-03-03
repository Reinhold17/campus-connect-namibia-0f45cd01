
-- Add foreign keys for join queries
ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_tutor_id_fkey1
  FOREIGN KEY (tutor_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_student_id_fkey1
  FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
