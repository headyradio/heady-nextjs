import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Meetup {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  external_link: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    display_name: string | null;
  };
}

export interface MeetupAttendee {
  id: string;
  meetup_id: string;
  user_id: string;
  status: 'going' | 'interested' | 'not_going';
  created_at: string;
}

export const useMeetups = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: meetups, isLoading } = useQuery({
    queryKey: ['meetups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetups')
        .select(`
          *,
          profiles (
            username,
            display_name
          )
        `)
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data as Meetup[];
    }
  });

  const getAttendees = (meetupId: string) => {
    return useQuery({
      queryKey: ['meetup-attendees', meetupId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('meetup_attendees')
          .select(`
            *,
            profiles (
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('meetup_id', meetupId);
        if (error) throw error;
        return data;
      }
    });
  };

  const rsvpMeetup = useMutation({
    mutationFn: async ({ 
      meetupId, 
      status 
    }: { 
      meetupId: string; 
      status: 'going' | 'interested' | 'not_going' 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meetup_attendees')
        .upsert({
          meetup_id: meetupId,
          user_id: user.id,
          status
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetup-attendees', data.meetup_id] });
      toast({
        title: 'RSVP Updated! 🎉',
        description: 'See you at the meetup!'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Please sign in to RSVP',
        variant: 'destructive'
      });
    }
  });

  const createMeetup = useMutation({
    mutationFn: async (meetup: {
      title: string;
      description: string;
      location: string;
      event_date: string;
      external_link?: string;
      image_url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meetups')
        .insert({
          ...meetup,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetups'] });
      toast({
        title: 'Meetup Created! 🎪',
        description: 'Your event is now live'
      });
    }
  });

  const updateMeetup = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      description?: string;
      location?: string;
      event_date?: string;
      external_link?: string;
      image_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('meetups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetups'] });
      toast({
        title: 'Updated! ✨',
        description: 'Meetup details updated'
      });
    }
  });

  const deleteMeetup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meetups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetups'] });
      toast({
        title: 'Deleted',
        description: 'Meetup has been removed'
      });
    }
  });

  return {
    meetups,
    isLoading,
    getAttendees,
    rsvpMeetup,
    createMeetup,
    updateMeetup,
    deleteMeetup
  };
};