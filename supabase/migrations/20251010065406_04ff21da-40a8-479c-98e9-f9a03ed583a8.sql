-- Create guest profiles table for temporary guest identities
CREATE TABLE guest_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  session_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  avatar_seed text,
  is_active boolean DEFAULT true
);

CREATE INDEX idx_guest_profiles_session ON guest_profiles(session_id);
CREATE INDEX idx_guest_profiles_expires ON guest_profiles(expires_at);

ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active guests"
  ON guest_profiles FOR SELECT
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Service role can manage guests"
  ON guest_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Create live chat messages table with guest support
CREATE TABLE live_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guest_profiles(id) ON DELETE CASCADE,
  is_deleted boolean DEFAULT false,
  sender_name text NOT NULL,
  sender_avatar_url text,
  is_guest boolean DEFAULT false,
  
  CONSTRAINT one_sender CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR
    (user_id IS NULL AND guest_id IS NOT NULL)
  )
);

CREATE INDEX idx_live_chat_created ON live_chat_messages(created_at DESC);
CREATE INDEX idx_live_chat_user ON live_chat_messages(user_id);
CREATE INDEX idx_live_chat_guest ON live_chat_messages(guest_id);

ALTER PUBLICATION supabase_realtime ADD TABLE live_chat_messages;

ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live chat"
  ON live_chat_messages FOR SELECT
  USING (NOT is_deleted);

CREATE POLICY "Authenticated users can post to live chat"
  ON live_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND guest_id IS NULL);

CREATE POLICY "Service role can manage for guests"
  ON live_chat_messages FOR ALL
  USING (auth.role() = 'service_role');

-- Insert the Live Main Chat room
INSERT INTO chat_rooms (
  category_id,
  name,
  emoji,
  description,
  sort_order
) VALUES (
  (SELECT id FROM chat_categories WHERE name = 'Community' LIMIT 1),
  'Live Main Chat',
  '📻',
  'Real-time DJ & listener chat during broadcasts',
  0
);