import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useAuth } from './useAuth';

interface LiveChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_avatar_url: string | null;
  is_guest: boolean;
  user_id: string | null;
}

export const useLiveChat = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['live-chat-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data as LiveChatMessage[];
    }
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('live-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-chat-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Send message as authenticated user
  const sendAuthMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('live_chat_messages')
        .insert({
          content,
          user_id: user.id,
          sender_name: profile?.display_name || profile?.username || 'User',
          sender_avatar_url: profile?.avatar_url,
          is_guest: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-chat-messages'] });
    }
  });

  return {
    messages: messages || [],
    isLoading,
    sendAuthMessage
  };
};
