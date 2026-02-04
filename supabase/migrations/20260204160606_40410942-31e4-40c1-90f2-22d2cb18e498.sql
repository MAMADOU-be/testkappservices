-- Fix chat_rooms INSERT policy: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create chat rooms" ON public.chat_rooms;

CREATE POLICY "Anyone can create chat rooms"
ON public.chat_rooms
FOR INSERT
TO public
WITH CHECK (true);

-- Also fix chat_participants INSERT policy
DROP POLICY IF EXISTS "Users can join as participant" ON public.chat_participants;

CREATE POLICY "Users can join as participant"
ON public.chat_participants
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);