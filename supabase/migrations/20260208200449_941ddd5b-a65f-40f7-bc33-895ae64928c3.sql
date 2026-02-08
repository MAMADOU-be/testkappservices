
-- Drop orphaned chat tables (chat feature was removed)
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;

-- Drop orphaned chat-related functions
DROP FUNCTION IF EXISTS public.is_room_participant(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.user_can_access_room(uuid);
DROP FUNCTION IF EXISTS public.create_chat_room_and_join(text, text, text);
DROP FUNCTION IF EXISTS public.join_chat_room(uuid, text, text);
