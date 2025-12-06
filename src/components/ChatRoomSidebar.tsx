import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Radio } from 'lucide-react';
import { ChatRoom, ChatCategory } from '@/hooks/useChatRooms';
import { CreateRoomDialog } from './CreateRoomDialog';
import { Plus } from 'lucide-react';

interface ChatRoomSidebarProps {
  rooms: ChatRoom[];
  categories: ChatCategory[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string, roomType: 'live' | 'community') => void;
  isLive: boolean;
  liveChatId: string;
}

export const ChatRoomSidebar: React.FC<ChatRoomSidebarProps> = ({
  rooms,
  categories,
  activeRoomId,
  onRoomSelect,
  isLive,
  liveChatId
}) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-[60px] border-r-2 border-border bg-card/50 flex flex-col">
        {/* Live Chat - Always at top */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onRoomSelect(liveChatId, 'live')}
              className={cn(
                "w-full h-[60px] flex items-center justify-center relative transition-all duration-200",
                "hover:bg-primary/10 hover:scale-110",
                activeRoomId === liveChatId 
                  ? "bg-primary/20 border-l-4 border-primary" 
                  : "opacity-70"
              )}
            >
              <Radio 
                className={cn(
                  "h-7 w-7 text-primary transition-all",
                  isLive && "animate-pulse"
                )} 
              />
              {isLive && (
                <div className="absolute inset-0 live-room-indicator pointer-events-none" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div>
              <p className="font-bold flex items-center gap-2">
                <Radio className="h-4 w-4" />
                Live Main Chat
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Chat with everyone in real-time while the stream is live
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-[2px] bg-border mx-2 my-1" />

        {/* Create Room Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-2 py-2">
              <CreateRoomDialog categories={categories} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Create your own chat room</p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-[2px] bg-border mx-2 my-1" />

        {/* Other Rooms */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {rooms
              .filter(room => room.name !== 'Live Main Chat') // Filter out duplicate
              .map((room) => (
              <Tooltip key={room.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onRoomSelect(room.id, 'community')}
                    className={cn(
                      "w-full h-[56px] flex items-center justify-center transition-all duration-200",
                      "hover:bg-primary/10 hover:scale-110 emoji-room-button",
                      activeRoomId === room.id 
                        ? "bg-primary/20 border-l-4 border-primary scale-105" 
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <span className="text-2xl">{room.emoji}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div>
                    <p className="font-bold">
                      {room.emoji} {room.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {room.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

