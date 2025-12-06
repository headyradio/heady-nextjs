-- Create table for caching Last.fm artist data
CREATE TABLE IF NOT EXISTS public.lastfm_artist_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL UNIQUE,
  lastfm_mbid TEXT,
  full_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lastfm_artist_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read Last.fm artist data
CREATE POLICY "Anyone can read lastfm artist data"
  ON public.lastfm_artist_data
  FOR SELECT
  USING (true);

-- Service role can insert Last.fm artist data
CREATE POLICY "Service role can insert lastfm artist data"
  ON public.lastfm_artist_data
  FOR INSERT
  WITH CHECK (true);

-- Service role can update Last.fm artist data
CREATE POLICY "Service role can update lastfm artist data"
  ON public.lastfm_artist_data
  FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lastfm_artist_name ON public.lastfm_artist_data(artist_name);
CREATE INDEX IF NOT EXISTS idx_lastfm_cached_at ON public.lastfm_artist_data(cached_at);