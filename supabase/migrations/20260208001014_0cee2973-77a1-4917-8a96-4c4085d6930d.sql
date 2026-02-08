-- Drop and recreate INSERT policy targeting all roles (not just authenticated)
DROP POLICY IF EXISTS "Authenticated users can insert as participant" ON public.chat_participants;

CREATE POLICY "Users can insert as participant"
ON public.chat_participants
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Clean up orphan rooms
DELETE FROM public.chat_rooms
WHERE id NOT IN (SELECT DISTINCT room_id FROM public.chat_participants);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
