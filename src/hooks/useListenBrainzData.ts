import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ListenBrainzData {
  mbid: string | null;
  artist_name: string;
  listener_count: number;
  similar_artists: Array<{
    artist_mbid: string;
    artist_name: string;
    score: number;
  }>;
  fetched_at: string;
}

export const useListenBrainzData = (artistName: string, mbid?: string | null) => {
  return useQuery({
    queryKey: ['listenbrainz', artistName, mbid],
    queryFn: async () => {
      if (!artistName && !mbid) return null;

      const { data, error } = await supabase.functions.invoke('fetch-listenbrainz-data', {
        body: { artist: artistName, mbid: mbid || undefined }
      });

      if (error) {
        console.error('Error fetching ListenBrainz data:', error);
        return null;
      }

      return data?.data as ListenBrainzData | null;
    },
    enabled: Boolean(artistName || mbid),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 1,
  });
};


