-- Fix timezone offset for existing transmissions
-- Drop the unique constraint first to allow updates
ALTER TABLE transmissions DROP CONSTRAINT IF EXISTS unique_transmission;

-- Update all transmissions to add 4 hours (EST to UTC conversion)
UPDATE transmissions
SET play_started_at = play_started_at + INTERVAL '4 hours'
WHERE play_started_at < NOW() - INTERVAL '1 hour';

-- Clean up any duplicates that might have been created
DELETE FROM transmissions a
USING transmissions b
WHERE a.id > b.id
  AND a.title = b.title
  AND a.artist = b.artist
  AND ABS(EXTRACT(EPOCH FROM (a.play_started_at - b.play_started_at))) < 300;

-- Add a comment to document the timezone used
COMMENT ON COLUMN transmissions.play_started_at IS 'Timestamp in UTC (converted from America/New_York timezone)';