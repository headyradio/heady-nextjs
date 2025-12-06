import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChatRooms } from '@/hooks/useChatRooms';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useLiveChat } from '@/hooks/useLiveChat';
import { ChatRoomSidebar } from '@/components/ChatRoomSidebar';
import { UnifiedChatWindow } from '@/components/UnifiedChatWindow';
import Navigation from '@/components/Navigation';
import { useRadioBoss } from '@/hooks/useRadioBoss';
import { useGuestIdentity } from '@/hooks/useGuestIdentity';

const Community = () => {
  const { user, loading } = useAuth();
  const { rooms, categories, categoriesLoading, roomsLoading, sendMessage } = useChatRooms();
  const [activeRoomId, setActiveRoomId] = useState<string>('live');
  const [activeRoomType, setActiveRoomType] = useState<'live' | 'community'>('live');

  const { messages: liveMessages, sendAuthMessage } = useLiveChat();
  const { messages: roomMessages } = useChatMessages(activeRoomType === 'community' ? activeRoomId : null);
  const { isLive, nowPlaying } = useRadioBoss();

  useEffect(() => {
    if (rooms && rooms.length > 0 && activeRoomId === 'live') {
      // Keep live chat as default
    }
  }, [rooms, activeRoomId]);

  if (loading || categoriesLoading || roomsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const activeRoom = rooms?.find(r => r.id === activeRoomId);
  const currentMessages = activeRoomType === 'live' ? liveMessages : roomMessages;

  const handleSendMessage = async (content: string, attachmentUrl?: string | null, attachmentType?: string | null) => {
    if (activeRoomType === 'live') {
      await sendAuthMessage.mutateAsync(content);
    } else if (activeRoomType === 'community') {
      await sendMessage.mutateAsync({
        roomId: activeRoomId,
        content
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden mt-20">
        {rooms && categories && (
          <>
            <ChatRoomSidebar
              rooms={rooms}
              categories={categories}
              activeRoomId={activeRoomId}
              onRoomSelect={(roomId, roomType) => {
                setActiveRoomId(roomId);
                setActiveRoomType(roomType);
              }}
              isLive={isLive}
              liveChatId="live"
            />
            
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
          </>
        )}
      </div>
    </div>
  );
};

export default Community;
