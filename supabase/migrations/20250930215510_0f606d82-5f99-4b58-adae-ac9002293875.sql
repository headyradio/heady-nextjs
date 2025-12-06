-- Create song_comments table
CREATE TABLE public.song_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_key TEXT NOT NULL, -- Composite key: artist|||title
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_song_comments_song_key ON public.song_comments(song_key);
CREATE INDEX idx_song_comments_created_at ON public.song_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.song_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Anyone can read comments"
ON public.song_comments
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Authenticated users can insert comments"
ON public.song_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON public.song_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.song_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_song_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_song_comments_updated_at
BEFORE UPDATE ON public.song_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_song_comments_updated_at();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_comments;