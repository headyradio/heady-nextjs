import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MusicBrainzArtistData {
  mbid: string;
  name: string;
  sort_name: string;
  type: string | null;
  country: string | null;
  disambiguation: string | null;
  begin_date: string | null;
  end_date: string | null;
  ended: boolean;
  genres: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  rating: {
    value: number | null;
    votes_count: number;
  };
  aliases: string[];
  urls: Array<{
    type: string;
    url: string | null;
  }>;
  image_url?: string | null;
}

export const useMusicBrainzArtistData = (artistName: string) => {
  return useQuery({
    queryKey: ['musicbrainz-artist', artistName],
    queryFn: async () => {
      if (!artistName) return null;

      const { data, error } = await supabase.functions.invoke('fetch-musicbrainz-data', {
        body: { artist: artistName, type: 'artist' }
      });

      if (error) {
        console.error('Error fetching MusicBrainz artist data:', error);
        return null;
      }

      return data?.data as MusicBrainzArtistData | null;
    },
    enabled: Boolean(artistName),
    staleTime: 30 * 24 * 60 * 60 * 1000, // 30 days (MusicBrainz data is stable)
    gcTime: 90 * 24 * 60 * 60 * 1000, // 90 days in cache
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};


