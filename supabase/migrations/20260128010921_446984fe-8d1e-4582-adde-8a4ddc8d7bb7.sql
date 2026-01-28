-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat participants table (tracks who is in each room)
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'employee')),
  session_id TEXT, -- For anonymous users
  is_online BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.chat_participants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Anyone can view chat rooms they participate in"
ON public.chat_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.room_id = chat_rooms.id
    AND (
      chat_participants.user_id = auth.uid()
      OR chat_participants.session_id IS NOT NULL
    )
  )
);

CREATE POLICY "Anyone can create chat rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (true);

-- RLS Policies for chat_participants
CREATE POLICY "Participants can view room participants"
ON public.chat_participants FOR SELECT
USING (true);

CREATE POLICY "Anyone can join as participant"
ON public.chat_participants FOR INSERT
WITH CHECK (true);

CREATE POLICY "Participants can update their own status"
ON public.chat_participants FOR UPDATE
USING (
  user_id = auth.uid() 
  OR (user_id IS NULL AND session_id IS NOT NULL)
);

-- RLS Policies for chat_messages
CREATE POLICY "Participants can view messages in their rooms"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.room_id = chat_messages.room_id
    AND (
      chat_participants.user_id = auth.uid()
      OR chat_participants.session_id IS NOT NULL
    )
  )
);

CREATE POLICY "Participants can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.id = chat_messages.participant_id
    AND (
      chat_participants.user_id = auth.uid()
      OR chat_participants.session_id IS NOT NULL
    )
  )
);

CREATE POLICY "Message sender can update their message"
ON public.chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.id = chat_messages.participant_id
    AND chat_participants.user_id = auth.uid()
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();