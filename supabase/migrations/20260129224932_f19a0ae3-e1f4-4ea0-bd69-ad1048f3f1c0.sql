-- Create a security definer function to check if a user is a participant in a room
-- This breaks the infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_room_participant(p_room_id uuid, p_user_id uuid, p_session_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE room_id = p_room_id
    AND (
      user_id = p_user_id
      OR (session_id IS NOT NULL AND session_id = p_session_id)
    )
  )
$$;

-- Create a function to check if a user has access to a participant record
CREATE OR REPLACE FUNCTION public.can_view_participant(p_target_room_id uuid, p_user_id uuid, p_session_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE room_id = p_target_room_id
    AND (
      user_id = p_user_id
      OR (session_id IS NOT NULL AND session_id = p_session_id)
    )
  )
$$;

-- Drop and recreate the problematic policies using the security definer functions

-- Fix chat_rooms SELECT policy
DROP POLICY IF EXISTS "Anyone can view chat rooms they participate in" ON public.chat_rooms;
CREATE POLICY "Anyone can view chat rooms they participate in"
ON public.chat_rooms FOR SELECT
USING (
  public.is_room_participant(id, auth.uid(), current_setting('request.headers', true)::json->>'x-session-id')
  OR EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.room_id = chat_rooms.id
    AND (
      chat_participants.user_id = auth.uid()
      OR chat_participants.session_id IS NOT NULL
    )
  )
);

-- Fix chat_participants SELECT policy  
DROP POLICY IF EXISTS "Participants can view room participants" ON public.chat_participants;
CREATE POLICY "Participants can view room participants"
ON public.chat_participants FOR SELECT
USING (
  public.can_view_participant(room_id, auth.uid(), session_id)
);

-- Fix chat_messages SELECT policy
DROP POLICY IF EXISTS "Participants can view messages in their rooms" ON public.chat_messages;
CREATE POLICY "Participants can view messages in their rooms"
ON public.chat_messages FOR SELECT
USING (
  public.is_room_participant(room_id, auth.uid(), NULL)
  OR EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.room_id = chat_messages.room_id
    AND chat_participants.session_id IS NOT NULL
  )
);