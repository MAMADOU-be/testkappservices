-- Drop and recreate the chat_rooms INSERT policy with explicit TO clause
DROP POLICY IF EXISTS "Anyone can create chat rooms" ON public.chat_rooms;

CREATE POLICY "Anyone can create chat rooms"
ON public.chat_rooms
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also make sure chat_participants INSERT policy covers authenticated users correctly
DROP POLICY IF EXISTS "Users can join as participant" ON public.chat_participants;

CREATE POLICY "Users can join as participant"
ON public.chat_participants
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);