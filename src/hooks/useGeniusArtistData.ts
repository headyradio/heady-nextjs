import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GeniusArtistData {
  id: number;
  name: string;
  url: string;
  image_url: string;
  description?: {
    plain: string;
  };
  alternate_names?: string[];
  instagram_name?: string;
  twitter_name?: string;
  facebook_name?: string;
}

export const useGeniusArtistData = (artistName: string) => {
  return useQuery({
    queryKey: ['genius-artist', artistName],
    queryFn: async () => {
      if (!artistName) return null;

      const { data, error } = await supabase.functions.invoke('fetch-genius-data', {
        body: { artist: artistName, type: 'artist' }
      });

      if (error) {
        console.error('Error fetching Genius artist data:', error);
        return null;
      }

      return data?.data as GeniusArtistData | null;
    },
    enabled: Boolean(artistName),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 1
  });
};
