-- Create table for caching Genius song data
CREATE TABLE public.genius_song_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist TEXT NOT NULL,
  title TEXT NOT NULL,
  genius_id BIGINT,
  full_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist, title)
);

-- Create table for caching Genius artist data
CREATE TABLE public.genius_artist_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL UNIQUE,
  genius_id BIGINT,
  full_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.genius_song_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genius_artist_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can read genius song data"
ON public.genius_song_data
FOR SELECT
USING (true);

CREATE POLICY "Anyone can read genius artist data"
ON public.genius_artist_data
FOR SELECT
USING (true);

-- Service role can insert/update
CREATE POLICY "Service role can insert genius song data"
ON public.genius_song_data
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update genius song data"
ON public.genius_song_data
FOR UPDATE
USING (true);

CREATE POLICY "Service role can insert genius artist data"
ON public.genius_artist_data
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update genius artist data"
ON public.genius_artist_data
FOR UPDATE
USING (true);

-- Create indexes for performance
CREATE INDEX idx_genius_song_lookup ON public.genius_song_data(artist, title);
CREATE INDEX idx_genius_song_cached_at ON public.genius_song_data(cached_at);
CREATE INDEX idx_genius_artist_lookup ON public.genius_artist_data(artist_name);
CREATE INDEX idx_genius_artist_cached_at ON public.genius_artist_data(cached_at);