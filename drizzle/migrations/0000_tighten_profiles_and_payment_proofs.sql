DROP POLICY IF EXISTS "Anyone can view approved profiles" ON public.profiles;
CREATE POLICY "Profiles visible to owner, admins, tutors public, and booking partners"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(user_id, 'tutor'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.sessions s ON s.id = b.session_id
    WHERE b.student_id = profiles.user_id AND s.tutor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Tutors can view payment proofs for their sessions" ON storage.objects;
CREATE POLICY "Tutors can view payment proofs for their sessions"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.sessions s ON s.id = b.session_id
    WHERE b.payment_proof_url = storage.objects.name
      AND s.tutor_id = auth.uid()
  )
);