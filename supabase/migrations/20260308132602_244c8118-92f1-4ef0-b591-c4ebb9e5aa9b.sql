-- Allow admins to insert modules
CREATE POLICY "Admins can insert modules"
ON public.modules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update modules
CREATE POLICY "Admins can update modules"
ON public.modules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete modules
CREATE POLICY "Admins can delete modules"
ON public.modules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update user_roles (for role changes on approval)
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));