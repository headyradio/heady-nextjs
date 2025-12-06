import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, User, Radio, Image, Smile, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';


interface LiveChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_avatar_url: string | null;
  is_guest?: boolean;
  user_id?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

type Message = LiveChatMessage | ChatMessage;

interface UnifiedChatWindowProps {
  roomId: string;
  roomName: string;
  roomEmoji: string;
  roomDescription?: string;
  roomType: 'live' | 'community';
  messages: Message[];
  onSendMessage: (content: string, attachmentUrl?: string | null, attachmentType?: string | null) => Promise<void>;
  currentUserId?: string | null;
  isLive?: boolean;
  nowPlaying?: { artist: string; title: string } | null;
  isSending?: boolean;
}

export const UnifiedChatWindow: React.FC<UnifiedChatWindowProps> = ({
  roomName,
  roomEmoji,
  roomDescription,
  roomType,
  messages,
  onSendMessage,
  currentUserId,
  isLive,
  nowPlaying,
  isSending
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images and GIFs only)
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || !currentUserId) return;
    
    setIsUploading(true);
    try {
      let attachmentUrl = null;
      let attachmentType = null;

      // Upload file if present
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `chat-attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        attachmentUrl = publicUrl;
        attachmentType = selectedFile.type;
      }

      // Send message with attachment info
      await onSendMessage(newMessage || '📎', attachmentUrl, attachmentType);
      setNewMessage('');
      clearFile();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentUserId) {
        handleSend();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background chat-room-transition">
      {/* Compact Header */}
      <div className={cn(
        "p-4 border-b-2 border-border",
        roomType === 'live' 
          ? "bg-gradient-to-r from-primary/10 to-primary/5" 
          : "bg-card"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{roomEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-primary">{roomName}</h2>
                {roomType === 'live' && isLive && (
                  <Badge variant="destructive" className="animate-pulse gap-1 text-xs">
                    <Radio className="h-3 w-3" />
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {roomType === 'live' && nowPlaying 
                  ? `${nowPlaying.artist} - ${nowPlaying.title}` 
                  : roomDescription || `${messages.length} messages`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Compact spacing */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">{roomEmoji}</span>
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation! 💬
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = currentUserId 
                ? message.user_id === currentUserId 
                : false;
              
              const displayName = 'profiles' in message
                ? (message.profiles.display_name || message.profiles.username)
                : message.sender_name;
              
              const avatarUrl = 'profiles' in message 
                ? message.profiles.avatar_url 
                : message.sender_avatar_url;
              const isGuest = 'is_guest' in message ? (message.is_guest || false) : false;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    isOwnMessage && "flex-row-reverse"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 ring-2 flex-shrink-0",
                    isGuest ? "ring-muted" : "ring-primary"
                  )}>
                    <AvatarImage src={avatarUrl || ''} />
                    <AvatarFallback className={cn(
                      isGuest 
                        ? "bg-muted text-muted-foreground" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn("flex-1 max-w-[75%]", isOwnMessage && "items-end")}>
                    <div className={cn(
                      "flex items-baseline gap-2 mb-1",
                      isOwnMessage && "flex-row-reverse"
                    )}>
                      <span className="font-bold text-xs flex items-center gap-1">
                        {displayName}
                        {isGuest && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">Guest</Badge>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(message.created_at), 'HH:mm')}
                      </span>
                    </div>
                    
                    <div
                      className={cn(
                        "px-3 py-2 rounded-2xl border-2 space-y-2",
                        isOwnMessage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border"
                      )}
                    >
                      {message.attachment_url && (
                        <div className="rounded-lg overflow-hidden max-w-xs">
                          <img 
                            src={message.attachment_url} 
                            alt="Attachment" 
                            className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.attachment_url, '_blank')}
                          />
                        </div>
                      )}
                      {message.content && message.content !== '📎' && (
                        <p className="text-sm break-words">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Compact Input */}
      <div className="p-3 border-t-2 border-border bg-card space-y-2">
        {/* File Preview */}
        {filePreview && (
          <div className="relative inline-block">
            <img 
              src={filePreview} 
              alt="Preview" 
              className="h-20 rounded-lg border-2 border-border"
            />
            <button
              onClick={clearFile}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 w-9 flex-shrink-0"
            disabled={isUploading || isSending}
            title="Attach image or GIF"
          >
            <Image className="h-4 w-4" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 text-sm border-2 border-border focus:border-primary h-9"
            disabled={isUploading}
          />
          
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading || !currentUserId}
            className="bg-primary hover:bg-primary/90 gap-2 h-9 px-3 flex-shrink-0"
            size="sm"
          >
            {isUploading ? (
              <div className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
