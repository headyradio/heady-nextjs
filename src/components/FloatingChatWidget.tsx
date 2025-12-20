import { useState, useEffect } from 'react';
import { MessageCircle, X, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ChatRoomSidebar } from '@/components/ChatRoomSidebar';
import { UnifiedChatWindow } from '@/components/UnifiedChatWindow';
import { DirectMessagesList } from '@/components/DirectMessagesList';
import { DirectMessageWindow } from '@/components/DirectMessageWindow';
import { NotificationPanel } from '@/components/NotificationPanel';
import { UserSearch } from '@/components/UserSearch';
import { useLiveChat } from '@/hooks/useLiveChat';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { useChatRooms } from '@/hooks/useChatRooms';
import { toast } from '@/hooks/use-toast';
import { useRadioBoss } from '@/hooks/useRadioBoss';

type WidgetState = 'minimized' | 'active' | 'dm' | 'new-dm' | 'expanded';

export const FloatingChatWidget = () => {
  const [state, setState] = useState<WidgetState>('minimized');
  const [activeRoomId, setActiveRoomId] = useState<string>('live');
  const [activeRoomType, setActiveRoomType] = useState<'live' | 'community'>('live');
  const [activeDmId, setActiveDmId] = useState<string | null>(null);
  const [newDmRecipientId, setNewDmRecipientId] = useState<string | null>(null);
  const [newDmRecipientName, setNewDmRecipientName] = useState<string>('');
  const [newDmRecipientAvatar, setNewDmRecipientAvatar] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { messages: liveMessages, sendAuthMessage } = useLiveChat();
  const { messages: roomMessages } = useChatMessages(activeRoomType === 'community' ? activeRoomId : null);
  const { messages: dmMessages, conversations, sendDirectMessage } = useDirectMessages(activeDmId);
  const { rooms, categories, sendMessage } = useChatRooms();
  const { isLive, nowPlaying } = useRadioBoss();

  // Load interaction state from localStorage
  useEffect(() => {
    const interacted = localStorage.getItem('chat_interacted');
    if (interacted === 'true') {
      setHasInteracted(true);
    }
  }, []);

  // Listen for open-live-chat event from Navigation
  useEffect(() => {
    const handleOpenLiveChat = () => {
      setActiveRoomId('live');
      setActiveRoomType('live');
      setState('active');
      markAsInteracted();
    };
    
    window.addEventListener('open-live-chat', handleOpenLiveChat);
    return () => window.removeEventListener('open-live-chat', handleOpenLiveChat);
  }, []);

  const totalDmUnread = conversations?.reduce((sum, conv) => sum + conv.unread_count, 0) || 0;
  const totalUnread = unreadCount + totalDmUnread;

  const markAsInteracted = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      localStorage.setItem('chat_interacted', 'true');
    }
  };

  const handleRoomSelect = (roomId: string, roomType: 'live' | 'community') => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to access chat',
      });
      window.location.href = '/auth';
      return;
    }
    setActiveRoomId(roomId);
    setActiveRoomType(roomType);
    setState('active');
    markAsInteracted();
  };

  const handleDmSelect = (conversationId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setActiveDmId(conversationId);
    setState('dm');
    markAsInteracted();
  };

  const handleNewDm = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setState('new-dm');
    markAsInteracted();
  };

  const handleUserSelect = (userId: string, username: string, avatar?: string | null) => {
    setNewDmRecipientId(userId);
    setNewDmRecipientName(username);
    setNewDmRecipientAvatar(avatar || null);
    setState('dm');
  };

  const handleWidgetClick = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setActiveRoomId('live');
    setActiveRoomType('live');
    setState('active');
    markAsInteracted();
  };

  const handleSendMessage = async (content: string, attachmentUrl?: string | null, attachmentType?: string | null) => {
    if (!user) return;

    if (activeRoomType === 'live') {
      await sendAuthMessage.mutateAsync(content);
    } else if (activeRoomType === 'community') {
      try {
        await sendMessage.mutateAsync({
          roomId: activeRoomId,
          content
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSendDirectMessage = async (content: string) => {
    if (!user) return;

    try {
      if (newDmRecipientId && !activeDmId) {
        await sendDirectMessage.mutateAsync({
          recipientId: newDmRecipientId,
          content
        });
        setNewDmRecipientId(null);
        setNewDmRecipientName('');
        setNewDmRecipientAvatar(null);
      } else if (activeDmId) {
        const conversation = conversations?.find(c => c.conversation_id === activeDmId);
        if (conversation) {
          await sendDirectMessage.mutateAsync({
            recipientId: conversation.other_user_id,
            content
          });
        }
      }
    } catch (error) {
      console.error('Error sending DM:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  if (state === 'minimized') {
    return (
      <Button
        onClick={handleWidgetClick}
        size="lg"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 md:h-16 rounded-full shadow-xl hover:scale-105 transition-all z-50 px-4 md:px-6 gap-2 md:gap-3"
        aria-label={hasInteracted ? 'Open live chat' : 'Join live chat'}
      >
        <Radio className="h-5 w-5 md:h-6 md:w-6" />
        <span className="font-bold text-xs md:text-sm">
          {hasInteracted ? 'Live Chat' : 'Join Live Chat'}
        </span>
        {isLive && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 md:h-6 min-w-[20px] md:min-w-[24px] rounded-full flex items-center justify-center px-1 animate-pulse text-xs"
          >
            LIVE
          </Badge>
        )}
        {user && totalUnread > 0 && !isLive && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 md:h-6 min-w-[20px] md:min-w-[24px] rounded-full flex items-center justify-center px-2 text-xs"
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </Badge>
        )}
      </Button>
    );
  }

  // New DM user search view
  if (state === 'new-dm') {
    return (
      <Card className="fixed inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[720px] bottom-20 shadow-2xl z-50 flex flex-col overflow-hidden border-2">
        <div className="p-4 border-b-2 border-border bg-card flex items-center justify-between">
          <h3 className="font-bold">New Message</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setState('expanded')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <UserSearch onSelectUser={handleUserSelect} currentUserId={user?.id || ''} />
      </Card>
    );
  }

  // Direct message view
  if (state === 'dm' && user) {
    const activeDmConversation = conversations?.find(c => c.conversation_id === activeDmId);
    const otherUserProfile = activeDmConversation?.other_user_profile;
    const displayName = otherUserProfile?.display_name || otherUserProfile?.username || newDmRecipientName;
    const avatar = otherUserProfile?.avatar_url || newDmRecipientAvatar;
    const conversationId = activeDmConversation?.conversation_id || 'new';

    return (
      <Card className="fixed inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[720px] bottom-20 shadow-2xl z-50 flex flex-col overflow-hidden border-2">
        <DirectMessageWindow
          conversationId={conversationId}
          otherUserName={displayName}
          otherUserAvatar={avatar}
          messages={dmMessages}
          onSendMessage={handleSendDirectMessage}
          onBack={() => {
            setActiveDmId(null);
            setNewDmRecipientId(null);
            setNewDmRecipientName('');
            setNewDmRecipientAvatar(null);
            setState('expanded');
          }}
          currentUserId={user.id}
        />
      </Card>
    );
  }

  // Expanded tabs view (DMs & Notifications)
  if (state === 'expanded' && user) {
    return (
      <Card className="fixed inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[720px] bottom-20 shadow-2xl z-50 flex flex-col overflow-hidden border-2">
        <div className="p-4 border-b-2 border-border bg-card flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Community
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActiveRoomId('live');
                setActiveRoomType('live');
                setState('active');
              }}
              title="Back to Chat"
            >
              <Radio className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setState('minimized')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dms" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b-2">
            <TabsTrigger value="dms" className="relative">
              DMs
              {totalDmUnread > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] text-xs px-1.5">
                  {totalDmUnread > 9 ? '9+' : totalDmUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] text-xs px-1.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dms" className="flex-1 m-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b-2 border-border">
              <Button onClick={handleNewDm} className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
            <DirectMessagesList onSelectConversation={handleDmSelect} />
          </TabsContent>

          <TabsContent value="notifications" className="flex-1 m-0 p-4 overflow-hidden">
            <NotificationPanel />
          </TabsContent>
        </Tabs>
      </Card>
    );
  }

  // Active chat view with sidebar
  const activeRoom = rooms?.find(r => r.id === activeRoomId);
  const currentMessages = activeRoomType === 'live' ? liveMessages : roomMessages;

  return (
    <Card className="fixed inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[720px] bottom-20 shadow-2xl z-50 flex overflow-hidden border-2">
      <ChatRoomSidebar
        rooms={rooms || []}
        categories={categories || []}
        activeRoomId={activeRoomId}
        onRoomSelect={handleRoomSelect}
        isLive={isLive}
        liveChatId="live"
      />
      
      <div className="flex-1 flex flex-col relative">
        <UnifiedChatWindow
          roomId={activeRoomId}
          roomName={activeRoomType === 'live' ? 'Live Main Chat' : (activeRoom?.name || '')}
          roomEmoji={activeRoomType === 'live' ? '📻' : (activeRoom?.emoji || '💬')}
          roomDescription={activeRoom?.description}
          roomType={activeRoomType}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          currentUserId={user?.id}
          isLive={isLive}
          nowPlaying={nowPlaying}
          isSending={sendAuthMessage.isPending || sendMessage.isPending}
        />
        
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setState('expanded')}
              className="bg-background/80 backdrop-blur-sm hover:bg-background h-8 w-8"
              title="DMs & Notifications"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setState('minimized')}
            className="bg-background/80 backdrop-blur-sm hover:bg-background h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
