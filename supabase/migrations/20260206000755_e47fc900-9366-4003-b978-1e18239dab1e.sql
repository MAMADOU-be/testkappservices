
-- Ensure chat_rooms INSERT policy is PERMISSIVE (fix for authenticated users)
DROP POLICY IF EXISTS "Anyone can create chat rooms" ON public.chat_rooms;

CREATE POLICY "Authenticated users can create chat rooms"
ON public.chat_rooms
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  name IS NOT NULL AND length(name) <= 200
);
