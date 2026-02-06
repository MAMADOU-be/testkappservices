
-- Only authenticated participants can send messages
DROP POLICY IF EXISTS "Participants can send messages" ON public.chat_messages;

CREATE POLICY "Authenticated participants can send messages"
ON public.chat_messages
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.id = chat_messages.participant_id
    AND chat_participants.user_id = auth.uid()
  )
);
