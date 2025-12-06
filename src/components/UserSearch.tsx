import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User } from 'lucide-react';

interface UserSearchProps {
  onSelectUser: (userId: string, username: string, avatar?: string | null) => void;
  currentUserId: string | null;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['user-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', currentUserId || '')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length > 0
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b-2 border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {!searchTerm ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Search for users to start a conversation
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Searching...
          </div>
        ) : users && users.length > 0 ? (
          <div className="p-2 space-y-1">
            {users.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-accent"
                onClick={() => onSelectUser(user.id, user.display_name || user.username, user.avatar_url)}
              >
                <Avatar className="h-10 w-10 ring-2 ring-border mr-3">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-semibold text-sm">
                    {user.display_name || user.username}
                  </p>
                  {user.display_name && (
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
