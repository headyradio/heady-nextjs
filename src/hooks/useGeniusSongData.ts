import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GeniusSongData {
  id: number;
  title: string;
  full_title: string;
  song_art_image_url: string;
  release_date?: string;
  album?: {
    name: string;
    cover_art_url: string;
  };
  primary_artist: {
    id: number;
    name: string;
    url: string;
    image_url: string;
  };
  featured_artists?: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  producer_artists?: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  writer_artists?: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  description?: {
    plain: string;
  };
  url: string;
}

export const useGeniusSongData = (artist: string, title: string) => {
  return useQuery({
    queryKey: ['genius-song', artist, title],
    queryFn: async () => {
      if (!artist || !title) return null;

      const { data, error } = await supabase.functions.invoke('fetch-genius-data', {
        body: { artist, title, type: 'song' }
      });

      if (error) {
        console.error('Error fetching Genius song data:', error);
        return null;
      }

      return data?.data as GeniusSongData | null;
    },
    enabled: Boolean(artist && title),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 1
  });
};
