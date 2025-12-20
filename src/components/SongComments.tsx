import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts about this song..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 resize-none"
          />
          <Button 
            type="submit" 
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="font-bold"
          >
            {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
          <MessageCircle className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <p className="text-white/70 mb-4">Sign in to join the conversation and share your thoughts.</p>
          <Link to="/auth">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Sign In to Comment
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white/50">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3 flex-1">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white whitespace-pre-wrap leading-relaxed">{comment.comment}</p>
                    <p className="text-sm text-white/40 mt-2">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {user && user.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                    disabled={deleteCommentMutation.isPending}
                    className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
