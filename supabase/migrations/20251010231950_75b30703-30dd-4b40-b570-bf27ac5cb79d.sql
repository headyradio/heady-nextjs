-- Create transmission_metadata table for AI-enriched data
CREATE TABLE public.transmission_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transmission_id UUID NOT NULL,
  artist_gender TEXT,
  estimated_bpm INTEGER,
  mood_tags TEXT[],
  genre_tags TEXT[],
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  decade TEXT,
  musicbrainz_id TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_transmission_metadata UNIQUE(transmission_id)
);

-- Create indexes for fast searches
CREATE INDEX idx_transmission_metadata_transmission ON public.transmission_metadata(transmission_id);
CREATE INDEX idx_transmission_metadata_mood ON public.transmission_metadata USING GIN (mood_tags);
CREATE INDEX idx_transmission_metadata_genre ON public.transmission_metadata USING GIN (genre_tags);
CREATE INDEX idx_transmission_metadata_bpm ON public.transmission_metadata (estimated_bpm);
CREATE INDEX idx_transmission_metadata_energy ON public.transmission_metadata (energy_level);
CREATE INDEX idx_transmission_metadata_decade ON public.transmission_metadata (decade);

-- Enable RLS
ALTER TABLE public.transmission_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read transmission metadata"
  ON public.transmission_metadata FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert transmission metadata"
  ON public.transmission_metadata FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update transmission metadata"
  ON public.transmission_metadata FOR UPDATE
  USING (true);