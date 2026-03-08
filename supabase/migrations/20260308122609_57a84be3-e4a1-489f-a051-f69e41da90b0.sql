
DROP POLICY "System can insert notifications" ON public.notifications;

-- Only authenticated users or service role can insert notifications for themselves
CREATE POLICY "Authenticated users can receive notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
