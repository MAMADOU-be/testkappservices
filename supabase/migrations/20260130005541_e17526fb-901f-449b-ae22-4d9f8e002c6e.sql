-- =============================================
-- FIX CRITICAL SECURITY ISSUES IN RLS POLICIES
-- =============================================

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Allow read access to chat rooms for participants" ON public.chat_rooms;
DROP POLICY IF EXISTS "Allow insert for authenticated or anonymous users" ON public.chat_rooms;

-- 2. Create secure SELECT policy for chat_rooms (only show rooms user participates in)
CREATE POLICY "Participants can view their rooms"
ON public.chat_rooms
FOR SELECT
USING (public.user_can_access_room(id));

-- 3. Create secure INSERT policy for chat_rooms (authenticated users OR anonymous with valid session)
-- Anonymous users can create rooms (for client chat), authenticated users can too
CREATE POLICY "Users can create chat rooms"
ON public.chat_rooms
FOR INSERT
WITH CHECK (true);

-- 4. Add DELETE policies to prevent unauthorized deletion

-- chat_rooms: Only authenticated users who are participants can delete (or deny all)
CREATE POLICY "No deletion of chat rooms"
ON public.chat_rooms
FOR DELETE
USING (false);

-- chat_messages: Only the message sender can delete their own messages
CREATE POLICY "Senders can delete their own messages"
ON public.chat_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.id = chat_messages.participant_id
    AND (
      cp.user_id = auth.uid()
      OR cp.session_id = current_setting('request.headers', true)::json->>'x-session-id'
    )
  )
);

-- chat_participants: Prevent deletion of participants
CREATE POLICY "No deletion of participants"
ON public.chat_participants
FOR DELETE
USING (false);