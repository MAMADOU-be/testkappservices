
-- Add file columns to chat_messages
ALTER TABLE public.chat_messages
ADD COLUMN file_url text DEFAULT NULL,
ADD COLUMN file_name text DEFAULT NULL,
ADD COLUMN file_type text DEFAULT NULL;

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for chat files
CREATE POLICY "Chat files are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

-- Authenticated users can upload chat files
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

-- Users can delete their own chat files
CREATE POLICY "Users can delete their own chat files"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
