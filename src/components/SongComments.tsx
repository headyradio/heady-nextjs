import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, MessageCircle, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

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
  const { profile } = useProfile(user?.id);
  
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
        title: 'Thought added! 🎵',
        description: 'Your thought has been added to the Track Diary.',
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
        title: 'Thought deleted',
        description: 'Your thought has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete thought',
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
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Track Diary</h2>
        <p className="text-lg text-white/60 font-medium">What do you think about this track?</p>
      </div>

      {/* Comment Input or Sign In Prompt */}
      {user ? (
        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl hover:from-white/[0.12] hover:to-white/[0.06] transition-all">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 flex items-center justify-center ring-2 ring-white/10">
                <User className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts, memories, or feelings about this track..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-0 text-base"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-white/40">
                    {newComment.length}/500 characters
                  </span>
                  <Button 
                    type="submit" 
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                    size="sm"
                  >
                    {addCommentMutation.isPending ? 'Posting...' : 'Add to Diary'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-white/30 transition-all group cursor-pointer">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          <Link to="/auth" className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-base mb-0.5">
                  {comments.length === 0 ? 'Be the first to share your thoughts' : 'Join the conversation'}
                </p>
                <p className="text-white/60 text-sm">
                  Sign in to leave a thought
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-5 group-hover:scale-105 transition-transform"
            >
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-full"></div>
              <div className="w-48 h-4 bg-white/10 rounded"></div>
            </div>
          </div>
        ) : comments.length === 0 && user ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No thoughts yet. Be the first!</p>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-white/50 font-medium px-1">
              {comments.length} {comments.length === 1 ? 'thought' : 'thoughts'} in this Track Diary
            </p>
            {comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="group bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:from-white/[0.12] hover:to-white/[0.06] transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center ring-2 ring-white/5 group-hover:ring-white/10 transition-all">
                    <User className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-white/50">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                      {user && user.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                          aria-label="Delete thought"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-base">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

