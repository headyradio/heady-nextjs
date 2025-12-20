import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RelatedArtist {
  name: string;
  playCount: number;
  source: 'featured' | 'producer' | 'co-played' | 'genre';
}

export const useRelatedArtists = (
  currentArtist: string,
  featuredArtists?: Array<{ name: string }>,
  producers?: Array<{ name: string }>,
  writers?: Array<{ name: string }>
) => {
  return useQuery({
    queryKey: ['related-artists', currentArtist, featuredArtists, producers, writers],
    queryFn: async (): Promise<RelatedArtist[]> => {
      const relatedArtistsMap = new Map<string, RelatedArtist>();

      // 1. Add featured artists from Genius
      featuredArtists?.forEach(artist => {
        if (artist.name.toLowerCase() !== currentArtist.toLowerCase()) {
          relatedArtistsMap.set(artist.name.toLowerCase(), {
            name: artist.name,
            playCount: 0,
            source: 'featured'
          });
        }
      });

      // 2. Add producers/writers as related artists
      [...(producers || []), ...(writers || [])].forEach(artist => {
        if (artist.name.toLowerCase() !== currentArtist.toLowerCase() && 
            !relatedArtistsMap.has(artist.name.toLowerCase())) {
          relatedArtistsMap.set(artist.name.toLowerCase(), {
            name: artist.name,
            playCount: 0,
            source: 'producer'
          });
        }
      });

      // 3. Get artists frequently played on the same shows
      const { data: coPlayedData } = await supabase
        .from('transmissions')
        .select('artist, show_name')
        .ilike('artist', currentArtist)
        .not('artist', 'ilike', currentArtist)
        .order('play_started_at', { ascending: false })
        .limit(100);

      if (coPlayedData) {
        const showNames = [...new Set(coPlayedData.map(t => t.show_name).filter(Boolean))];
        
        if (showNames.length > 0) {
          const { data: sameShowArtists } = await supabase
            .from('transmissions')
            .select('artist')
            .in('show_name', showNames)
            .not('artist', 'ilike', currentArtist)
            .limit(50);

          sameShowArtists?.forEach(t => {
            const artistKey = t.artist.toLowerCase();
            if (!relatedArtistsMap.has(artistKey)) {
              relatedArtistsMap.set(artistKey, {
                name: t.artist,
                playCount: 0,
                source: 'co-played'
              });
            }
          });
        }
      }

      // Get play counts for all related artists
      const artistNames = Array.from(relatedArtistsMap.keys());
      if (artistNames.length > 0) {
        const { data: playCounts } = await supabase
          .from('transmissions')
          .select('artist')
          .or(artistNames.map(name => `artist.ilike.${name}`).join(','));

        if (playCounts) {
          const countMap = new Map<string, number>();
          playCounts.forEach(t => {
            const key = t.artist.toLowerCase();
            countMap.set(key, (countMap.get(key) || 0) + 1);
          });

          relatedArtistsMap.forEach((artist, key) => {
            artist.playCount = countMap.get(key) || 0;
          });
        }
      }

      // 4. Add ListenBrainz data if available
      try {
        const { data: listenBrainzData } = await supabase
          .from('listenbrainz_data')
          .select('full_data')
          .ilike('artist_name', currentArtist)
          .single();

        if (listenBrainzData?.full_data?.similar_artists) {
          listenBrainzData.full_data.similar_artists.forEach((artist: any) => {
            const artistKey = artist.artist_name.toLowerCase();
            // Don't overwrite if existing, unless it's just 'co-played' (ListenBrainz is higher quality)
            // But 'featured' and 'producer' from Genius are very high relevance, so keep those.
            if (!relatedArtistsMap.has(artistKey) || relatedArtistsMap.get(artistKey)?.source === 'co-played') {
              // Only add if not already present or if we want to upgrade the source
              // Actually, keeping co-played is good because it's local station data.
              // Let's add if not present.
              if (!relatedArtistsMap.has(artistKey)) {
                relatedArtistsMap.set(artistKey, {
                  name: artist.artist_name,
                  playCount: 0,
                  source: 'genre' // Using 'genre' or a new type 'listenbrainz'
                });
              }
            }
          });
        }
      } catch (err) {
        console.log('Error fetching ListenBrainz data for related artists:', err);
      }

      // Sort by priority: featured > producer > co-played > genre, then by play count
      const sourceOrder = { featured: 0, producer: 1, 'co-played': 2, genre: 3 };
      return Array.from(relatedArtistsMap.values())
        .sort((a, b) => {
          if (sourceOrder[a.source] !== sourceOrder[b.source]) {
            return sourceOrder[a.source] - sourceOrder[b.source];
          }
          // For genre/ListenBrainz, we might want to use score if available, but here we stick to playCount which might be 0 for new ones
          // If playCount is 0 for both, they are equal.
          return b.playCount - a.playCount;
        })
        .slice(0, 8);
    },
    enabled: Boolean(currentArtist),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
