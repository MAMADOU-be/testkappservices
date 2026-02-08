-- Remove the public chat-files bucket (chat system was already removed)
DELETE FROM storage.objects WHERE bucket_id = 'chat-files';
DELETE FROM storage.buckets WHERE id = 'chat-files';

-- Drop storage policies related to chat-files
DROP POLICY IF EXISTS "Chat files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat files" ON storage.objects;