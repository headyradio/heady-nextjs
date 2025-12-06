-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Anyone can view user roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create chat categories table
CREATE TABLE public.chat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat categories"
  ON public.chat_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage chat categories"
  ON public.chat_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.chat_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage chat rooms"
  ON public.chat_rooms FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages FOR SELECT
  USING (NOT is_deleted);

CREATE POLICY "Authenticated users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages, admins can delete any"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON public.message_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create meetups table
CREATE TABLE public.meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  external_link TEXT,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meetups"
  ON public.meetups FOR SELECT
  USING (true);

CREATE POLICY "Admins can create meetups"
  ON public.meetups FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update meetups"
  ON public.meetups FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete meetups"
  ON public.meetups FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create meetup attendees table
CREATE TABLE public.meetup_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID REFERENCES public.meetups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meetup_id, user_id)
);

ALTER TABLE public.meetup_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attendees"
  ON public.meetup_attendees FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can RSVP"
  ON public.meetup_attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVP"
  ON public.meetup_attendees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVP"
  ON public.meetup_attendees FOR DELETE
  USING (auth.uid() = user_id);

-- Create meetup comments table
CREATE TABLE public.meetup_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID REFERENCES public.meetups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meetup_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meetup comments"
  ON public.meetup_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.meetup_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.meetup_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.meetup_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_song_comments_updated_at();

CREATE TRIGGER update_meetups_updated_at
  BEFORE UPDATE ON public.meetups
  FOR EACH ROW EXECUTE FUNCTION public.update_song_comments_updated_at();

CREATE TRIGGER update_meetup_comments_updated_at
  BEFORE UPDATE ON public.meetup_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_song_comments_updated_at();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Insert default chat categories
INSERT INTO public.chat_categories (name, emoji, description, sort_order) VALUES
  ('Community', '🌟', 'General community discussions', 1),
  ('Music Artists', '🎵', 'Artist-specific chat rooms', 2);

-- Insert chat rooms
INSERT INTO public.chat_rooms (category_id, name, emoji, description, sort_order)
SELECT c.id, 'Food & Drinks', '🍕', 'Share recipes, restaurant recs, cooking fails', 1
FROM public.chat_categories c WHERE c.name = 'Community'
UNION ALL
SELECT c.id, 'Astrology', '⭐', 'Star signs, horoscopes, cosmic vibes', 2
FROM public.chat_categories c WHERE c.name = 'Community'
UNION ALL
SELECT c.id, 'For Sale', '💸', 'Vinyl, merch, gear trading', 3
FROM public.chat_categories c WHERE c.name = 'Community'
UNION ALL
SELECT c.id, 'Random', '🎪', 'Off-topic conversations', 4
FROM public.chat_categories c WHERE c.name = 'Community'
UNION ALL
SELECT c.id, 'Arctic Monkeys', '🐒', 'Sheffield lads discussion', 1
FROM public.chat_categories c WHERE c.name = 'Music Artists'
UNION ALL
SELECT c.id, 'The Strokes', '🎸', 'New York rock legends', 2
FROM public.chat_categories c WHERE c.name = 'Music Artists'
UNION ALL
SELECT c.id, 'My Chemical Romance', '🖤', 'Emo revival central', 3
FROM public.chat_categories c WHERE c.name = 'Music Artists'
UNION ALL
SELECT c.id, 'Oasis', '🎭', 'Britpop classics (and drama)', 4
FROM public.chat_categories c WHERE c.name = 'Music Artists'
UNION ALL
SELECT c.id, 'Tame Impala', '🌈', 'Psychedelic soundscapes', 5
FROM public.chat_categories c WHERE c.name = 'Music Artists'
UNION ALL
SELECT c.id, 'King Gizzard & The Lizard Wizard', '🦎', 'Gizz verse headquarters', 6
FROM public.chat_categories c WHERE c.name = 'Music Artists';