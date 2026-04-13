
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.admin_notifications;

CREATE POLICY "Staff can create notifications"
  ON public.admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee')
  );
