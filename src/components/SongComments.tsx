import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
}

interface SongCommentsProps {
  artist: string;
  title: string;
}

export const SongComments = ({ artist, title }: SongCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const songKey = `${artist}|||${title}`;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('song-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_comments',
          filter: `song_key=eq.${songKey}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['song-comments', songKey] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [songKey, queryClient]);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['song-comments', songKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('song_comments')
        .select('*')
        .eq('song_key', songKey)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!user) throw new Error('Must be logged in to comment');
      
      const { error } = await supabase
        .from('song_comments')
        .insert({
          song_key: songKey,
          user_id: user.id,
          comment
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['song-comments', songKey] });
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post comment',
        variant: 'destructive',
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('song_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['song-comments', songKey] });
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete comment',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>
      
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts about this song..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            type="submit" 
            disabled={!newComment.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to leave a comment.</p>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="whitespace-pre-wrap">{comment.comment}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                {user && user.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                    disabled={deleteCommentMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
