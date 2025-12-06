import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Meetup } from '@/hooks/useMeetups';

interface MeetupCardProps {
  meetup: Meetup;
  attendeeCount: number;
  userStatus: 'going' | 'interested' | 'not_going' | null;
  onRSVP: (status: 'going' | 'interested' | 'not_going') => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export const MeetupCard: React.FC<MeetupCardProps> = ({
  meetup,
  attendeeCount,
  userStatus,
  onRSVP,
  onEdit,
  canEdit
}) => {
  return (
    <Card className="border-4 border-border hover:border-primary transition-colors overflow-hidden group">
      {meetup.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={meetup.image_url}
            alt={meetup.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl font-black text-primary mb-2">
              {meetup.title}
            </CardTitle>
            <CardDescription className="text-sm">
              Organized by {meetup.profiles.display_name || meetup.profiles.username}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Users className="h-3 w-3 mr-1" />
            {attendeeCount}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground">{meetup.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {format(new Date(meetup.event_date), 'PPP p')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{meetup.location}</span>
          </div>

          {meetup.external_link && (
            <a
              href={meetup.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Event Details
            </a>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        <Button
          onClick={() => onRSVP('going')}
          variant={userStatus === 'going' ? 'default' : 'outline'}
          className="flex-1"
        >
          ✅ Going
        </Button>
        <Button
          onClick={() => onRSVP('interested')}
          variant={userStatus === 'interested' ? 'default' : 'outline'}
          className="flex-1"
        >
          ⭐ Interested
        </Button>
        {canEdit && (
          <Button
            onClick={onEdit}
            variant="secondary"
            className="w-full mt-2"
          >
            Edit Meetup
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};