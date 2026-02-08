
-- Enhanced RLS policy: validate role on INSERT
DROP POLICY IF EXISTS "Users can insert as participant" ON public.chat_participants;

CREATE POLICY "Users can insert as participant"
ON public.chat_participants
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
  AND (
    role = 'client'
    OR (role = 'employee' AND (public.has_role(auth.uid(), 'employee'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)))
  )
);
