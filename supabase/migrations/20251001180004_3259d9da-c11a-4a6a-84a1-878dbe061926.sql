
-- First, delete duplicate transmissions, keeping only the earliest created_at for each unique play
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY title, artist, play_started_at 
      ORDER BY created_at ASC
    ) as rn
  FROM transmissions
)
DELETE FROM transmissions
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add a unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_transmission 
ON transmissions (title, artist, play_started_at);

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Cleaned up duplicate transmissions and added unique constraint';
END $$;
