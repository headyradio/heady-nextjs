import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransmissionHistory } from './useTransmissionHistory';

interface SongDetailsResult {
  transmissions: TransmissionHistory[];
  playCount: number;
  firstPlayed: string | null;
  lastPlayed: string | null;
  uniqueDJs: string[];
  uniqueShows: string[];
}

export const useSongDetails = (artist: string, title: string) => {
  return useQuery({
    queryKey: ['song-details', artist, title],
    queryFn: async (): Promise<SongDetailsResult> => {
      const { data, error } = await supabase
        .from('transmissions')
        .select('*')
        .ilike('artist', artist)
        .ilike('title', title)
        .order('play_started_at', { ascending: false });

      if (error) {
        console.error('Error fetching song details:', error);
        throw error;
      }

      const transmissions = data as TransmissionHistory[];
      
      // Calculate statistics
      const uniqueDJs = [...new Set(transmissions.map(t => t.dj_name).filter(Boolean))] as string[];
      const uniqueShows = [...new Set(transmissions.map(t => t.show_name).filter(Boolean))] as string[];
      
      return {
        transmissions,
        playCount: transmissions.length,
        firstPlayed: transmissions[transmissions.length - 1]?.play_started_at || null,
        lastPlayed: transmissions[0]?.play_started_at || null,
        uniqueDJs,
        uniqueShows,
      };
    },
    enabled: Boolean(artist && title),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (aligned with ISR strategy)
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days cache
  });
};

export const useSongContent = (artist: string, title: string) => {
  return useQuery({
    queryKey: ['song-content', artist, title],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-song-content', {
        body: { artist, title }
      });

      if (error) throw error;
      return data.content as string;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
};
