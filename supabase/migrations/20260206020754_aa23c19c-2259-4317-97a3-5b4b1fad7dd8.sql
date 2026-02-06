-- Drop and recreate INSERT policy for chat_participants to fix the issue
DROP POLICY IF EXISTS "Authenticated users can join as participant" ON public.chat_participants;
DROP POLICY IF EXISTS "Anyone can join as participant" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join chat rooms" ON public.chat_participants;

-- Simple permissive INSERT policy: authenticated users can insert with their own user_id
CREATE POLICY "Authenticated users can insert as participant"
ON public.chat_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also ensure chat_rooms INSERT policy is clean
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.chat_rooms;

CREATE POLICY "Authenticated users can create rooms"
ON public.chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (true);