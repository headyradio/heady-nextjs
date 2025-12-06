-- Clean up existing duplicates, keeping only the earliest entry for each song play
DELETE FROM transmissions a
USING transmissions b
WHERE a.id > b.id
  AND a.title = b.title
  AND a.artist = b.artist
  AND ABS(EXTRACT(EPOCH FROM (a.play_started_at - b.play_started_at))) < 300;

-- Drop the old unique constraint if it exists
ALTER TABLE transmissions DROP CONSTRAINT IF EXISTS transmissions_title_artist_play_started_at_key;