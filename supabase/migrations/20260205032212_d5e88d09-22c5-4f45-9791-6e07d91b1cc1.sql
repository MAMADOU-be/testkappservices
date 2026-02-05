-- Fix chat_participants INSERT policy - must be PERMISSIVE
DROP POLICY IF EXISTS "Users can join as participant" ON public.chat_participants;

CREATE POLICY "Users can join as participant"
ON public.chat_participants
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  -- Authenticated users: must set their own user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Anonymous users: must have null user_id and provide session_id
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);