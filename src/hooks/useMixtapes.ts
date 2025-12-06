import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Mixtape {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_art_url: string | null;
  release_date: string | null;
  duration_minutes: number | null;
  tracklist: any;
  streaming_links: any;
  download_link: string | null;
  created_by: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export const useMixtapes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: mixtapes, isLoading } = useQuery({
    queryKey: ['mixtapes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mixtapes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Mixtape[];
    }
  });

  const deleteMixtape = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mixtapes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mixtapes'] });
      toast({
        title: "Success",
        description: "Mixtape deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete mixtape",
        variant: "destructive",
      });
    }
  });

  return {
    mixtapes,
    isLoading,
    deleteMixtape
  };
};
