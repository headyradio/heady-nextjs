-- Create content_categories table
CREATE TABLE public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create headyzine_posts table (blog)
CREATE TABLE public.headyzine_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.content_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shows table
CREATE TABLE public.shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  venue TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  doors_time TEXT,
  show_time TEXT,
  ticket_price TEXT,
  ticket_link TEXT,
  featured_image_url TEXT,
  artists JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mixtapes table
CREATE TABLE public.mixtapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_art_url TEXT,
  release_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  tracklist JSONB DEFAULT '[]'::jsonb,
  streaming_links JSONB DEFAULT '{}'::jsonb,
  download_link TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_tags table
CREATE TABLE public.content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create junction tables for tags
CREATE TABLE public.post_tags (
  post_id UUID REFERENCES public.headyzine_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE public.show_tags (
  show_id UUID REFERENCES public.shows(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (show_id, tag_id)
);

CREATE TABLE public.mixtape_tags (
  mixtape_id UUID REFERENCES public.mixtapes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (mixtape_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headyzine_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixtapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixtape_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_categories
CREATE POLICY "Anyone can view categories" ON public.content_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.content_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for headyzine_posts
CREATE POLICY "Anyone can view published posts" ON public.headyzine_posts
  FOR SELECT USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage posts" ON public.headyzine_posts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for shows
CREATE POLICY "Anyone can view shows" ON public.shows
  FOR SELECT USING (status != 'cancelled' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage shows" ON public.shows
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mixtapes
CREATE POLICY "Anyone can view published mixtapes" ON public.mixtapes
  FOR SELECT USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage mixtapes" ON public.mixtapes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tags
CREATE POLICY "Anyone can view tags" ON public.content_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.content_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view post tags" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage post tags" ON public.post_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view show tags" ON public.show_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage show tags" ON public.show_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view mixtape tags" ON public.mixtape_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage mixtape tags" ON public.mixtape_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.content_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.headyzine_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_shows_updated_at
  BEFORE UPDATE ON public.shows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_mixtapes_updated_at
  BEFORE UPDATE ON public.mixtapes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample categories
INSERT INTO public.content_categories (name, slug, description) VALUES
  ('Interviews', 'interviews', 'Artist interviews and conversations'),
  ('Reviews', 'reviews', 'Album and show reviews'),
  ('Features', 'features', 'Featured artists and deep dives'),
  ('News', 'news', 'Latest music news and updates');

-- Insert sample tags
INSERT INTO public.content_tags (name, slug) VALUES
  ('Psychedelic Rock', 'psychedelic-rock'),
  ('Jam Bands', 'jam-bands'),
  ('Live Music', 'live-music'),
  ('Album Release', 'album-release'),
  ('Tour Dates', 'tour-dates'),
  ('Festival', 'festival');