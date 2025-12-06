-- Create storage bucket for audio archives
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-archives',
  'audio-archives',
  true,
  524288000, -- 500MB per file limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']
);

-- Storage policies for audio archives
CREATE POLICY "Public can read audio archives"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-archives');

CREATE POLICY "Service role can insert audio archives"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio-archives');

CREATE POLICY "Service role can delete audio archives"
ON storage.objects
FOR DELETE
USING (bucket_id = 'audio-archives');

-- Table for hourly audio archives
CREATE TABLE public.hourly_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date_hour TIMESTAMP WITH TIME ZONE NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  recording_status TEXT NOT NULL DEFAULT 'recording',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.hourly_archives ENABLE ROW LEVEL SECURITY;

-- RLS policies for hourly_archives
CREATE POLICY "Public can read hourly archives"
ON public.hourly_archives
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert hourly archives"
ON public.hourly_archives
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update hourly archives"
ON public.hourly_archives
FOR UPDATE
USING (true);

CREATE POLICY "Service role can delete hourly archives"
ON public.hourly_archives
FOR DELETE
USING (true);

-- Table for hourly playlists (songs grouped by hour)
CREATE TABLE public.hourly_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hour_archive_id UUID NOT NULL REFERENCES public.hourly_archives(id) ON DELETE CASCADE,
  songs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hourly_playlists ENABLE ROW LEVEL SECURITY;

-- RLS policies for hourly_playlists
CREATE POLICY "Public can read hourly playlists"
ON public.hourly_playlists
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert hourly playlists"
ON public.hourly_playlists
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update hourly playlists"
ON public.hourly_playlists
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_hourly_archives_date_hour ON public.hourly_archives(date_hour DESC);
CREATE INDEX idx_hourly_playlists_hour_archive_id ON public.hourly_playlists(hour_archive_id);

-- Function to update hourly_playlists updated_at
CREATE OR REPLACE FUNCTION public.update_hourly_playlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for updating updated_at
CREATE TRIGGER update_hourly_playlists_updated_at
BEFORE UPDATE ON public.hourly_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_hourly_playlists_updated_at();