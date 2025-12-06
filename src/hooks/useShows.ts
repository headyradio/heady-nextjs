import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Show {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  venue: string;
  location: string;
  event_date: string;
  doors_time: string | null;
  show_time: string | null;
  ticket_price: string | null;
  ticket_link: string | null;
  featured_image_url: string | null;
  artists: any;
  status: 'upcoming' | 'past' | 'cancelled';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useShows = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: shows, isLoading } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as Show[];
    }
  });

  const deleteShow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      toast({
        title: "Success",
        description: "Show deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete show",
        variant: "destructive",
      });
    }
  });

  return {
    shows,
    isLoading,
    deleteShow
  };
};
