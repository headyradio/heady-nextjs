-- Add created_by column to chat_rooms for user-created rooms
ALTER TABLE chat_rooms 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN chat_rooms.created_by IS 'User who created this room (NULL for system-created rooms)';

-- Update RLS policies to allow users to create rooms
CREATE POLICY "Authenticated users can create chat rooms"
ON chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own chat rooms"
ON chat_rooms
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own chat rooms"
ON chat_rooms
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Insert new categories
INSERT INTO chat_categories (name, emoji, description, sort_order) VALUES
('Interests', '🎯', 'Discuss your passions and hobbies', 3),
('Music Fans', '🎸', 'Connect with fellow music lovers', 4)
ON CONFLICT DO NOTHING;

-- Insert new rooms (using subqueries to get category IDs)
INSERT INTO chat_rooms (category_id, name, emoji, description, sort_order) VALUES
-- Interests category
((SELECT id FROM chat_categories WHERE name = 'Interests'), 'Fashion & Style', '👗', 'Discuss fashion trends, style tips, and outfit inspiration', 1),
((SELECT id FROM chat_categories WHERE name = 'Interests'), 'Gaming', '🎮', 'Talk about your favorite games and gaming experiences', 2),
((SELECT id FROM chat_categories WHERE name = 'Interests'), 'Coding', '💻', 'Share code, discuss programming, and collaborate on projects', 3),
-- Music Fans category
((SELECT id FROM chat_categories WHERE name = 'Music Fans'), 'Turnstile Fans', '🔥', 'For fans of Turnstile - discuss their music, shows, and more', 1),
((SELECT id FROM chat_categories WHERE name = 'Music Fans'), 'IDLES Fans', '⚡', 'Connect with IDLES fans - share your love for the band', 2),
((SELECT id FROM chat_categories WHERE name = 'Music Fans'), 'The Smiths Fans', '🌹', 'Celebrate The Smiths - classic tracks and deep cuts', 3),
((SELECT id FROM chat_categories WHERE name = 'Music Fans'), 'Mac DeMarco Fans', '🎹', 'Chill vibes for Mac DeMarco enthusiasts', 4),
((SELECT id FROM chat_categories WHERE name = 'Music Fans'), 'Geese Fans', '🦢', 'For fans of Geese - discuss their evolving sound', 5)
ON CONFLICT DO NOTHING;