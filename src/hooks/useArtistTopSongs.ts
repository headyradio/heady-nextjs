import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ArtistTopSong {
  title: string;
  artist: string;
  album?: string;
  album_art_url?: string;
  playCount: number;
}

export const useArtistTopSongs = (artistName: string, currentSongTitle: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['artist-top-songs', artistName, currentSongTitle, limit],
    queryFn: async (): Promise<ArtistTopSong[]> => {
      const { data, error } = await supabase
        .from('transmissions')
        .select('title, artist, album, album_art_url')
        .ilike('artist', artistName)
        .not('title', 'ilike', currentSongTitle);

      if (error) throw error;

      // Count plays for each unique song
      const songMap = new Map<string, ArtistTopSong>();
      
      data?.forEach(t => {
        const key = `${t.title.toLowerCase()}-${t.artist.toLowerCase()}`;
        if (songMap.has(key)) {
          songMap.get(key)!.playCount++;
        } else {
          songMap.set(key, {
            title: t.title,
            artist: t.artist,
            album: t.album,
            album_art_url: t.album_art_url,
            playCount: 1
          });
        }
      });

      // Sort by play count and return top songs
      return Array.from(songMap.values())
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, limit);
    },
    enabled: Boolean(artistName),
    staleTime: 5 * 60 * 1000,
  });
};
