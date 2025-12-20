import { useMusicBrainzArtistData } from "./useMusicBrainzArtistData";
import { useLastfmArtistData } from "./useLastfmArtistData";
import { useGeniusArtistData } from "./useGeniusArtistData";
import { useListenBrainzData } from "./useListenBrainzData";

/**
 * Combined hook that fetches artist data from multiple sources
 * Priority order: MusicBrainz (primary) → Last.fm → Genius → ListenBrainz
 */
export const useCombinedArtistData = (artistName: string) => {
  // Fetch from all sources
  const musicBrainz = useMusicBrainzArtistData(artistName);
  const lastfm = useLastfmArtistData(artistName);
  const genius = useGeniusArtistData(artistName);
  
  // Use MBID from MusicBrainz (preferred) or Last.fm for ListenBrainz
  const mbid = musicBrainz.data?.mbid || lastfm.data?.mbid;
  const listenBrainz = useListenBrainzData(artistName, mbid);

  // PRIORITY: MusicBrainz first, then Last.fm, then Genius
  const bestImage = 
    musicBrainz.data?.image_url || 
    lastfm.data?.image_url || 
    genius.data?.image_url;

  // For bio: Genius has best descriptions, then Last.fm, then MusicBrainz disambiguation
  const bestBio = 
    genius.data?.description?.plain || 
    lastfm.data?.bio || 
    musicBrainz.data?.disambiguation;

  // Combine genres from MusicBrainz (primary) and Last.fm
  const allGenres = new Set([
    ...(musicBrainz.data?.genres?.map(g => g.name) || []),
    ...(musicBrainz.data?.tags?.map(t => t.name) || []),
    ...(lastfm.data?.tags || []),
  ]);

  // Combine similar artists from all sources
  const similarArtists = [
    ...(lastfm.data?.similar || []).map(a => ({ 
      name: a.name, 
      url: a.url,
      image_url: a.image_url,
      source: 'lastfm' as const
    })),
    ...(listenBrainz.data?.similar_artists || []).map(a => ({ 
      name: a.artist_name,
      mbid: a.artist_mbid,
      score: a.score,
      source: 'listenbrainz' as const
    })),
  ];

  // Extract official URLs from MusicBrainz
  const officialWebsite = musicBrainz.data?.urls?.find(u => 
    u.url?.includes('official') || u.url?.includes('homepage')
  )?.url;

  return {
    // Loading states
    isLoading: musicBrainz.isLoading || lastfm.isLoading || genius.isLoading,
    isLoadingMusicBrainz: musicBrainz.isLoading,
    
    // Core artist info (MusicBrainz prioritized)
    mbid,
    name: musicBrainz.data?.name || artistName,
    sortName: musicBrainz.data?.sort_name,
    
    // Visual
    image: bestImage,
    
    // Descriptive
    bio: bestBio,
    disambiguation: musicBrainz.data?.disambiguation,
    
    // Classification
    genres: Array.from(allGenres),
    type: musicBrainz.data?.type, // e.g., "Person", "Group"
    country: musicBrainz.data?.country,
    
    // Dates (from MusicBrainz)
    beginDate: musicBrainz.data?.begin_date,
    endDate: musicBrainz.data?.end_date,
    ended: musicBrainz.data?.ended,
    
    // Aliases (from MusicBrainz)
    aliases: musicBrainz.data?.aliases || [],
    
    // URLs and links
    officialWebsite,
    socialLinks: {
      instagram: genius.data?.instagram_name,
      twitter: genius.data?.twitter_name,
      facebook: genius.data?.facebook_name,
    },
    
    // Statistics from all sources
    stats: {
      // MusicBrainz community rating
      musicbrainzRating: musicBrainz.data?.rating?.value,
      musicbrainzVotes: musicBrainz.data?.rating?.votes_count || 0,
      
      // Last.fm stats
      lastfmListeners: parseInt(lastfm.data?.stats?.listeners || '0'),
      lastfmPlaycount: parseInt(lastfm.data?.stats?.playcount || '0'),
      
      // ListenBrainz real listening data
      listenbrainzListeners: listenBrainz.data?.listener_count || 0,
    },
    
    // Related artists
    similarArtists,
    
    // Raw data from all sources (for advanced usage)
    rawData: {
      musicBrainz: musicBrainz.data,
      lastfm: lastfm.data,
      genius: genius.data,
      listenBrainz: listenBrainz.data,
    },
  };
};


