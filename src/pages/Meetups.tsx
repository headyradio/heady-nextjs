import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMeetups } from '@/hooks/useMeetups';
import { useUserRole } from '@/hooks/useUserRole';
import { MeetupCard } from '@/components/MeetupCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { MeetupDialog } from '@/components/MeetupDialog';

const Meetups = () => {
  const { user, loading: authLoading } = useAuth();
  const { meetups, isLoading, getAttendees, rsvpMeetup } = useMeetups();
  const { isAdmin } = useUserRole();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingMeetup, setEditingMeetup] = useState<string | null>(null);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meetups...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="display-lg text-primary mb-2">🎪 IRL Meetups</h1>
            <p className="text-muted-foreground">
              Connect with fellow music lovers before shows
            </p>
          </div>
          
          {isAdmin && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Meetup
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetups?.map((meetup) => {
            const attendeesQuery = getAttendees(meetup.id);
            const attendees = attendeesQuery.data || [];
            const userAttendee = attendees.find(a => a.user_id === user.id);

            return (
              <MeetupCard
                key={meetup.id}
                meetup={meetup}
                attendeeCount={attendees.filter(a => a.status === 'going').length}
                userStatus={(userAttendee?.status as 'going' | 'interested' | 'not_going') || null}
                onRSVP={(status) => rsvpMeetup.mutate({ meetupId: meetup.id, status })}
                onEdit={isAdmin ? () => setEditingMeetup(meetup.id) : undefined}
                canEdit={isAdmin}
              />
            );
          })}
        </div>

        {meetups?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-muted-foreground mb-4">
              No meetups scheduled yet
            </p>
            {isAdmin && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create the first meetup
              </Button>
            )}
          </div>
        )}
      </div>

      <MeetupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        meetupId={null}
      />
    </div>
  );
};

export default Meetups;