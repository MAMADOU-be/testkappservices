-- Fix 1: Add message content length constraint (max 5000 characters)
ALTER TABLE public.chat_messages ADD CONSTRAINT content_max_length 
  CHECK (length(content) <= 5000);

-- Fix 2: Add role constraint - employees must be authenticated users
ALTER TABLE public.chat_participants ADD CONSTRAINT role_requires_auth
  CHECK (role = 'client' OR (role = 'employee' AND user_id IS NOT NULL));