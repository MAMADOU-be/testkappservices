-- Allow staff (admins and employees) to send messages once they are participants
DROP POLICY IF EXISTS "Participants can send messages" ON public.chat_messages;

CREATE POLICY "Participants can send messages"
ON public.chat_messages
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.id = chat_messages.participant_id
    AND (
      chat_participants.user_id = auth.uid()
      OR chat_participants.session_id IS NOT NULL
    )
  )
);