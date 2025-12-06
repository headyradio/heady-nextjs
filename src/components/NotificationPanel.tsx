import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Check, MessageCircle, AtSign, Heart, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationPanel = () => {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="h-4 w-4" />;
      case 'dm':
        return <MessageCircle className="h-4 w-4" />;
      case 'reaction':
        return <Heart className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading notifications...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {notifications.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Notifications</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={!notifications.some(n => !n.is_read)}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Button
                key={notification.id}
                variant="ghost"
                className={`w-full justify-start h-auto p-3 ${
                  !notification.is_read ? 'bg-accent' : ''
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead.mutate(notification.id);
                  }
                  // Navigate to link if exists
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {notification.related_user ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.related_user.avatar_url || ''} />
                        <AvatarFallback>
                          {notification.related_user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.is_read && (
                        <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
