import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LastfmArtistData {
  name: string;
  mbid: string | null;
  url: string;
  image_url: string | null;
  images: Array<{ size: string; '#text': string }>;
  bio: string | null;
  bio_full: string | null;
  similar: Array<{
    name: string;
    url: string;
    image_url: string | null;
  }>;
  tags: string[];
  stats: {
    listeners: string;
    playcount: string;
  };
}

export const useLastfmArtistData = (artistName: string) => {
  return useQuery({
    queryKey: ['lastfm-artist', artistName],
    queryFn: async () => {
      if (!artistName) return null;

      const { data, error } = await supabase.functions.invoke('fetch-lastfm-artist', {
        body: { artist: artistName }
      });

      if (error) {
        console.error('Error fetching Last.fm artist data:', error);
        return null;
      }

      return data?.data as LastfmArtistData | null;
    },
    enabled: Boolean(artistName),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 1
  });
};
