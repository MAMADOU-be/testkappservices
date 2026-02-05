-- Allow admins and employees to view ALL chat rooms for support purposes
DROP POLICY IF EXISTS "Participants can view their rooms" ON public.chat_rooms;

-- Users can view rooms they participate in OR admins/employees can view all
CREATE POLICY "Users and staff can view rooms"
ON public.chat_rooms
AS PERMISSIVE
FOR SELECT
TO public
USING (
  user_can_access_room(id) 
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'employee')
);

-- Also allow admins/employees to see all participants for support
DROP POLICY IF EXISTS "Participants can view room participants" ON public.chat_participants;

CREATE POLICY "Participants and staff can view participants"
ON public.chat_participants
AS PERMISSIVE
FOR SELECT
TO public
USING (
  user_can_access_room(room_id)
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'employee')
);

-- Allow admins/employees to see all messages for support
DROP POLICY IF EXISTS "Participants can view messages in their rooms" ON public.chat_messages;

CREATE POLICY "Participants and staff can view messages"
ON public.chat_messages
AS PERMISSIVE
FOR SELECT
TO public
USING (
  user_can_access_room(room_id)
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'employee')
);