-- Add DJ and show name fields to transmissions table
ALTER TABLE public.transmissions 
ADD COLUMN IF NOT EXISTS dj_name TEXT,
ADD COLUMN IF NOT EXISTS show_name TEXT;

-- Create index for filtering by DJ and show
CREATE INDEX IF NOT EXISTS idx_transmissions_dj_name ON public.transmissions(dj_name);
CREATE INDEX IF NOT EXISTS idx_transmissions_show_name ON public.transmissions(show_name);