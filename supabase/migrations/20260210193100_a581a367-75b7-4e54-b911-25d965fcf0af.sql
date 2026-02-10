
-- Fix overly permissive INSERT policy on admin_notifications
DROP POLICY "Anyone can create notifications" ON public.admin_notifications;

-- Only authenticated users or service role can create notifications
CREATE POLICY "Authenticated can create notifications"
ON public.admin_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
