import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export const useDirectMessages = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['direct-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          profiles!sender_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(msg => ({
        ...msg,
        sender_profile: msg.profiles as any
      })) as DirectMessage[];
    },
    enabled: !!conversationId
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all unique user IDs
      const userIds = new Set<string>();
      data?.forEach(msg => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const conversationMap = new Map<string, Conversation>();
      
      data?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const otherUserProfile = profileMap.get(otherUserId);
        
        if (!otherUserProfile) return;

        if (!conversationMap.has(msg.conversation_id)) {
          conversationMap.set(msg.conversation_id, {
            conversation_id: msg.conversation_id,
            other_user_id: otherUserId,
            other_user_profile: {
              username: otherUserProfile.username,
              display_name: otherUserProfile.display_name,
              avatar_url: otherUserProfile.avatar_url
            },
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: msg.recipient_id === user.id && !msg.is_read ? 1 : 0
          });
        } else {
          const conv = conversationMap.get(msg.conversation_id)!;
          if (msg.recipient_id === user.id && !msg.is_read) {
            conv.unread_count++;
          }
        }
      });

      return Array.from(conversationMap.values());
    }
  });

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['direct-messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  const sendDirectMessage = useMutation({
    mutationFn: async ({ recipientId, content, conversationId: convId }: { 
      recipientId: string; 
      content: string;
      conversationId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const finalConversationId = convId || `${[user.id, recipientId].sort().join('-')}`;

      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: finalConversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'dm',
          title: 'New Direct Message',
          message: content.substring(0, 100),
          related_user_id: user.id
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    }
  });

  return {
    messages: messages || [],
    conversations: conversations || [],
    isLoading,
    sendDirectMessage,
    markAsRead
  };
};
