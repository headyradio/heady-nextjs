-- Create transmissions table for song logging
CREATE TABLE IF NOT EXISTS public.transmissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  play_started_at TIMESTAMPTZ NOT NULL,
  duration TEXT,
  album_art_url TEXT,
  genre TEXT,
  year TEXT,
  artwork_id TEXT,
  listeners_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Create unique constraint to prevent exact duplicates
  CONSTRAINT unique_transmission UNIQUE (title, artist, play_started_at)
);

-- Create indexes for better query performance
CREATE INDEX idx_transmissions_play_started_at ON public.transmissions(play_started_at DESC);
CREATE INDEX idx_transmissions_artist ON public.transmissions(artist);
CREATE INDEX idx_transmissions_title ON public.transmissions(title);
CREATE INDEX idx_transmissions_created_at ON public.transmissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.transmissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (radio play history is public)
CREATE POLICY "Allow public read access to transmissions"
  ON public.transmissions
  FOR SELECT
  USING (true);

-- Create policy for insert (we'll use service role for logging)
CREATE POLICY "Allow service role to insert transmissions"
  ON public.transmissions
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.transmissions IS 'Stores all radio transmission history with deduplication';
