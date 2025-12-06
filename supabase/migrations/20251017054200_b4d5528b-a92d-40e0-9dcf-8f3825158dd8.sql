-- Drop hourly_playlists table (cascades will handle foreign key constraints)
DROP TABLE IF EXISTS public.hourly_playlists CASCADE;

-- Drop hourly_archives table
DROP TABLE IF EXISTS public.hourly_archives CASCADE;

-- Delete audio-archives storage bucket
DELETE FROM storage.buckets WHERE id = 'audio-archives';