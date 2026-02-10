-- Drop the restrictive INSERT policy and replace with a permissive one
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.admin_notifications;

CREATE POLICY "Authenticated can create notifications"
ON public.admin_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
