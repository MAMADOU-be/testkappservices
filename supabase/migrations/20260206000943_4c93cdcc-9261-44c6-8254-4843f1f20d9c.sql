
-- Only authenticated users can join as participants (no more anonymous)
DROP POLICY IF EXISTS "Users can join as participant" ON public.chat_participants;

CREATE POLICY "Authenticated users can join as participant"
ON public.chat_participants
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);
