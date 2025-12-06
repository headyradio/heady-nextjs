-- Drop existing permissive policies for public chat access
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Anyone can view chat categories" ON public.chat_categories;
DROP POLICY IF EXISTS "Anyone can view live chat" ON public.live_chat_messages;
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.message_reactions;

-- Create new authenticated-only policies for chat_messages
CREATE POLICY "Authenticated users can view chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (NOT is_deleted);

-- Create new authenticated-only policies for chat_rooms
CREATE POLICY "Authenticated users can view chat rooms"
ON public.chat_rooms
FOR SELECT
TO authenticated
USING (true);

-- Create new authenticated-only policies for chat_categories
CREATE POLICY "Authenticated users can view chat categories"
ON public.chat_categories
FOR SELECT
TO authenticated
USING (true);

-- Create new authenticated-only policies for live_chat_messages
CREATE POLICY "Authenticated users can view live chat"
ON public.live_chat_messages
FOR SELECT
TO authenticated
USING (NOT is_deleted);

-- Create new authenticated-only policies for message_reactions
CREATE POLICY "Authenticated users can view reactions"
ON public.message_reactions
FOR SELECT
TO authenticated
USING (true);

-- Remove service role policy for guest management (no longer needed)
DROP POLICY IF EXISTS "Service role can manage for guests" ON public.live_chat_messages;

-- Update live_chat_messages insert policy to only allow authenticated users
DROP POLICY IF EXISTS "Authenticated users can post to live chat" ON public.live_chat_messages;

CREATE POLICY "Authenticated users can post to live chat"
ON public.live_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND guest_id IS NULL);