
-- Remove old duplicate permissive INSERT policy on admin_notifications
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.admin_notifications;

-- Remove public read access on chat-files storage bucket (chat feature removed)
DROP POLICY IF EXISTS "Chat files are publicly readable" ON storage.objects;

-- Restrict user_presence visibility to own data or staff
DROP POLICY IF EXISTS "Authenticated users can view presence" ON public.user_presence;

CREATE POLICY "Users can view own presence or staff can view all"
  ON public.user_presence FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'employee')
  );
