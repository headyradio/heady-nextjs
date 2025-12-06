import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ArtistSong {
  id: string;
  title: string;
  album: string | null;
  album_art_url: string | null;
  artwork_id: string | null;
  play_count: number;
  first_played: string;
  last_played: string;
  genre: string | null;
  year: string | null;
}

interface ArtistDetailsResult {
  artist: string;
  totalPlays: number;
  totalUniqueSongs: number;
  songs: ArtistSong[];
  uniqueDJs: string[];
  uniqueShows: string[];
  firstPlayed: string | null;
  lastPlayed: string | null;
  mostPlayedSong: ArtistSong | null;
}

export const useArtistDetails = (artistName: string) => {
  return useQuery({
    queryKey: ['artist-details', artistName],
    queryFn: async (): Promise<ArtistDetailsResult> => {
      const { data, error } = await supabase
        .from('transmissions')
        .select('*')
        .ilike('artist', artistName)
        .order('play_started_at', { ascending: false });

      if (error) {
        console.error('Error fetching artist details:', error);
        throw error;
      }

      // Group by song title to get unique songs with play counts
      const songMap = new Map<string, ArtistSong>();
      const djSet = new Set<string>();
      const showSet = new Set<string>();

      data.forEach(transmission => {
        const songKey = transmission.title.toLowerCase();
        
        if (transmission.dj_name) djSet.add(transmission.dj_name);
        if (transmission.show_name) showSet.add(transmission.show_name);

        if (!songMap.has(songKey)) {
          songMap.set(songKey, {
            id: transmission.id,
            title: transmission.title,
            album: transmission.album,
            album_art_url: transmission.album_art_url,
            artwork_id: transmission.artwork_id,
            play_count: 1,
            first_played: transmission.play_started_at,
            last_played: transmission.play_started_at,
            genre: transmission.genre,
            year: transmission.year,
          });
        } else {
          const song = songMap.get(songKey)!;
          song.play_count++;
          if (transmission.play_started_at > song.last_played) {
            song.last_played = transmission.play_started_at;
          }
          if (transmission.play_started_at < song.first_played) {
            song.first_played = transmission.play_started_at;
          }
        }
      });

      const songs = Array.from(songMap.values()).sort((a, b) => b.play_count - a.play_count);
      const mostPlayedSong = songs.length > 0 ? songs[0] : null;

      return {
        artist: artistName,
        totalPlays: data.length,
        totalUniqueSongs: songs.length,
        songs,
        uniqueDJs: Array.from(djSet),
        uniqueShows: Array.from(showSet),
        firstPlayed: data[data.length - 1]?.play_started_at || null,
        lastPlayed: data[0]?.play_started_at || null,
        mostPlayedSong,
      };
    },
    enabled: Boolean(artistName),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours (aligned with ISR strategy)
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days cache
  });
};

export const useArtistContent = (artistName: string) => {
  return useQuery({
    queryKey: ['artist-content', artistName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-song-content', {
        body: { artist: artistName, isArtistOnly: true }
      });

      if (error) throw error;
      return data.content as string;
    },
    enabled: Boolean(artistName),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (aligned with ISR strategy)
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days cache
  });
};
