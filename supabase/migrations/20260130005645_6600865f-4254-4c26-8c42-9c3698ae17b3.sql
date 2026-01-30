-- =============================================
-- CLEAN UP DUPLICATE/OLD RLS POLICIES
-- =============================================

-- 1. Drop ALL existing policies on chat_rooms to start fresh
DROP POLICY IF EXISTS "Anyone can view chat rooms they participate in" ON public.chat_rooms;
DROP POLICY IF EXISTS "Authenticated or session users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Participants can view their rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "No deletion of chat rooms" ON public.chat_rooms;

-- 2. Drop problematic DELETE policy on chat_messages
DROP POLICY IF EXISTS "Senders can delete their own messages" ON public.chat_messages;

-- 3. Create clean, secure policies for chat_rooms

-- SELECT: Only participants can view rooms they belong to
CREATE POLICY "Participants can view their rooms"
ON public.chat_rooms
FOR SELECT
USING (public.user_can_access_room(id));

-- INSERT: Allow room creation (needed for anonymous client chat)
-- Security is enforced by requiring immediate participant creation
CREATE POLICY "Anyone can create chat rooms"
ON public.chat_rooms
FOR INSERT
WITH CHECK (true);

-- DELETE: No one can delete rooms
CREATE POLICY "Rooms cannot be deleted"
ON public.chat_rooms
FOR DELETE
USING (false);

-- 4. Create secure DELETE policy for messages (authenticated users only)
CREATE POLICY "Authenticated users can delete their own messages"
ON public.chat_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.id = chat_messages.participant_id
    AND cp.user_id = auth.uid()
  )
);