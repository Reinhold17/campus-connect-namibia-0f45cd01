-- Allow authenticated users to see tutor roles (needed for Browse Tutors page)
CREATE POLICY "Authenticated users can view tutor roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role = 'tutor');