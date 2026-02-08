-- Grant necessary privileges on chat tables to authenticated and anon roles
GRANT SELECT, INSERT, UPDATE ON public.chat_participants TO authenticated;
GRANT SELECT, INSERT ON public.chat_rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;

-- Also grant SELECT to anon for basic access (RLS will still protect)
GRANT SELECT ON public.chat_participants TO anon;
GRANT SELECT ON public.chat_rooms TO anon;
GRANT SELECT ON public.chat_messages TO anon;
