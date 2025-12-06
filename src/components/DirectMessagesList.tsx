import { useDirectMessages } from '@/hooks/useDirectMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface DirectMessagesListProps {
  onSelectConversation: (conversationId: string) => void;
}

export const DirectMessagesList = ({ onSelectConversation }: DirectMessagesListProps) => {
  const { conversations, isLoading } = useDirectMessages(null);

  if (isLoading) {
    return <div className="text-center py-8">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start chatting with community members!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {conversations.map((conv) => (
          <Button
            key={conv.conversation_id}
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-accent"
            onClick={() => onSelectConversation(conv.conversation_id)}
          >
            <div className="flex items-start gap-3 w-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conv.other_user_profile.avatar_url || ''} />
                <AvatarFallback>
                  {conv.other_user_profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">
                    {conv.other_user_profile.display_name || conv.other_user_profile.username}
                  </p>
                  {conv.unread_count > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conv.last_message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
