-- Fix 1: Chat message length constraint
ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_content_length_check
CHECK (length(content) > 0 AND length(content) <= 5000);

-- Fix 2: Restrict chat_rooms INSERT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.chat_rooms;
CREATE POLICY "Authenticated users can create rooms"
ON public.chat_rooms
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 3: Add length constraints to service_requests fields
ALTER TABLE public.service_requests
ADD CONSTRAINT service_requests_field_lengths_check
CHECK (
  length(first_name) <= 100 AND
  length(last_name) <= 100 AND
  length(email) <= 255 AND
  length(phone) <= 20 AND
  length(street) <= 300 AND
  length(city) <= 100 AND
  length(postal_code) <= 10 AND
  length(service_type) <= 200 AND
  length(frequency) <= 50 AND
  (comments IS NULL OR length(comments) <= 1000) AND
  (notes IS NULL OR length(notes) <= 1000) AND
  (preferred_day IS NULL OR length(preferred_day) <= 200)
);