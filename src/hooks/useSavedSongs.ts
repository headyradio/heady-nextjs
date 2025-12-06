import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SavedSong {
  id: string;
  user_id: string;
  song_key: string;
  artist: string;
  title: string;
  album: string | null;
  album_art_url: string | null;
  artwork_id: string | null;
  saved_at: string;
}

export const useSavedSongs = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: savedSongs = [], isLoading } = useQuery({
    queryKey: ['saved-songs', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('saved_songs')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      return data as SavedSong[];
    },
    enabled: !!userId
  });

  const isSongSaved = (artist: string, title: string) => {
    const songKey = `${artist}|||${title}`;
    return savedSongs.some(song => song.song_key === songKey);
  };

  const saveSong = useMutation({
    mutationFn: async ({
      artist,
      title,
      album,
      albumArtUrl,
      artworkId
    }: {
      artist: string;
      title: string;
      album?: string | null;
      albumArtUrl?: string | null;
      artworkId?: string | null;
    }) => {
      if (!userId) throw new Error('Not authenticated');

      const songKey = `${artist}|||${title}`;

      const { data, error } = await supabase
        .from('saved_songs')
        .insert({
          user_id: userId,
          song_key: songKey,
          artist,
          title,
          album,
          album_art_url: albumArtUrl,
          artwork_id: artworkId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-songs', userId] });
    }
  });

  const unsaveSong = useMutation({
    mutationFn: async ({ artist, title }: { artist: string; title: string }) => {
      if (!userId) throw new Error('Not authenticated');

      const songKey = `${artist}|||${title}`;

      const { error } = await supabase
        .from('saved_songs')
        .delete()
        .eq('user_id', userId)
        .eq('song_key', songKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-songs', userId] });
    }
  });

  return {
    savedSongs,
    isLoading,
    isSongSaved,
    saveSong,
    unsaveSong
  };
};
