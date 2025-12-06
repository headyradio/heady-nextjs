import React, { useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, ArrowLeft } from 'lucide-react';
import { DirectMessage } from '@/hooks/useDirectMessages';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DirectMessageWindowProps {
  conversationId: string;
  otherUserName: string;
  otherUserAvatar?: string | null;
  messages: DirectMessage[];
  onSendMessage: (content: string) => void;
  onBack: () => void;
  currentUserId: string | null;
}

export const DirectMessageWindow: React.FC<DirectMessageWindowProps> = ({
  conversationId,
  otherUserName,
  otherUserAvatar,
  messages,
  onSendMessage,
  onBack,
  currentUserId
}) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b-2 border-border bg-card flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8 ring-2 ring-border">
          <AvatarImage src={otherUserAvatar || ''} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-sm">{otherUserName}</h3>
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation! 💬
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    isOwnMessage && "flex-row-reverse"
                  )}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-border flex-shrink-0">
                    <AvatarImage src={message.sender_profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn("flex-1 max-w-[70%]", isOwnMessage && "items-end")}>
                    <div className={cn("flex items-baseline gap-2 mb-1", isOwnMessage && "flex-row-reverse")}>
                      <span className="font-bold text-xs">
                        {message.sender_profile?.display_name || message.sender_profile?.username || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'HH:mm')}
                      </span>
                    </div>
                    
                    <div
                      className={cn(
                        "px-3 py-2 rounded-lg border border-border",
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-card"
                      )}
                    >
                      <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t-2 border-border bg-card">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[60px] max-h-[120px] resize-none border-2"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 h-[60px] w-[60px] flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
