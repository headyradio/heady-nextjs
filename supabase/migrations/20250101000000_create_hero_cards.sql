-- Create hero_cards table for managing homepage hero carousel cards
CREATE TABLE IF NOT EXISTS hero_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  genre_tags TEXT[] DEFAULT '{}',
  dj_name TEXT,
  day TEXT,
  time TEXT,
  destination_url TEXT,
  destination_type TEXT DEFAULT 'internal', -- 'internal' or 'external'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_hero_cards_display_order ON hero_cards(display_order, is_active);

-- Enable RLS
ALTER TABLE hero_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active hero cards
CREATE POLICY "Anyone can view active hero cards"
  ON hero_cards
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can manage hero cards
CREATE POLICY "Admins can manage hero cards"
  ON hero_cards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hero_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_hero_cards_updated_at
  BEFORE UPDATE ON hero_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_cards_updated_at();

