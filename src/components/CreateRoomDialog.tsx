import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatCategory } from '@/hooks/useChatRooms';

const COMMON_EMOJIS = ['💬', '🎮', '🎵', '🎨', '🔥', '⚡', '🌟', '💡', '🎯', '🚀', '💻', '📚', '🎬', '⚽', '🍕'];

interface CreateRoomDialogProps {
  categories: ChatCategory[];
}

export function CreateRoomDialog({ categories }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('💬');
  const [categoryId, setCategoryId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRoom = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          emoji,
          category_id: categoryId,
          created_by: user.id,
          sort_order: 999 // User rooms at the end
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      toast({
        title: 'Success',
        description: 'Chat room created successfully!'
      });
      setOpen(false);
      setName('');
      setDescription('');
      setEmoji('💬');
      setCategoryId('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive'
      });
      console.error('Create room error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    createRoom.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full h-[56px] flex items-center justify-center transition-all duration-200 hover:bg-primary/10 hover:scale-110 opacity-60 hover:opacity-100">
          <Plus className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Chat Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name *</Label>
            <Input
              id="room-name"
              placeholder="e.g., My Awesome Chat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-description">Description</Label>
            <Textarea
              id="room-description"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-emoji">Emoji</Label>
            <div className="flex gap-2 flex-wrap">
              {COMMON_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded hover:bg-accent transition-colors ${
                    emoji === e ? 'bg-accent ring-2 ring-primary' : ''
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <Input
              id="room-emoji"
              placeholder="Or type your own emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={2}
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="room-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRoom.isPending}>
              {createRoom.isPending ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
