
ALTER TABLE public.chat_participants
ADD COLUMN last_read_at timestamp with time zone DEFAULT NULL;
