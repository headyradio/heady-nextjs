import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMeetups } from '@/hooks/useMeetups';

interface MeetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetupId: string | null;
}

export const MeetupDialog: React.FC<MeetupDialogProps> = ({
  open,
  onOpenChange,
  meetupId
}) => {
  const { createMeetup, updateMeetup } = useMeetups();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    external_link: '',
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventDate = new Date(formData.event_date).toISOString();

    if (meetupId) {
      await updateMeetup.mutateAsync({
        id: meetupId,
        ...formData,
        event_date: eventDate
      });
    } else {
      await createMeetup.mutateAsync({
        ...formData,
        event_date: eventDate
      });
    }

    onOpenChange(false);
    setFormData({
      title: '',
      description: '',
      location: '',
      event_date: '',
      external_link: '',
      image_url: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-primary">
            {meetupId ? 'Edit Meetup' : 'Create New Meetup'} 🎪
          </DialogTitle>
          <DialogDescription>
            Organize an IRL gathering for music lovers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Pre-Show Meetup at Gizzfest"
              required
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Join us before the show for drinks and good vibes!"
              required
              rows={4}
              className="border-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="The Bird's Nest, Melbourne"
                required
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Date & Time *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                className="border-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_link">Event Link (optional)</Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://tickets.example.com"
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/event-poster.jpg"
              className="border-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {meetupId ? 'Update' : 'Create'} Meetup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};