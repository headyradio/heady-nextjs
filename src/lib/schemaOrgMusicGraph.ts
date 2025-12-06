/**
 * Comprehensive Schema.org Music Knowledge Graph Implementation
 * 
 * Creates a properly linked knowledge graph for HEADY.FM song pages:
 * WebPage → MusicRecording → MusicGroup/Person → MusicAlbum → Organization
 * 
 * Follows schema.org best practices for music discovery and SEO.
 */

export interface SongPageData {
  // Song/Track data
  trackTitle: string;
  trackUrl: string; // Full URL to song page
  trackDescription?: string;
  trackImage?: string;
  trackDuration?: string; // ISO 8601 duration (e.g., "PT3M30S")
  trackGenre?: string | string[];
  trackYear?: string;
  trackReleaseDate?: string; // ISO 8601 date
  trackIsrcCode?: string;
  
  // Artist data
  artistName: string;
  artistUrl: string; // Full URL to artist page
  artistImage?: string;
  artistDescription?: string;
  artistType?: 'MusicGroup' | 'Person'; // Default: MusicGroup
  
  // Album data (optional)
  albumName?: string;
  albumUrl?: string; // Full URL to album page (if exists)
  albumImage?: string;
  albumReleaseDate?: string;
  
  // External links
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  geniusUrl?: string;
  lastfmUrl?: string;
  
  // Station/Publisher data
  stationName?: string; // Default: "HEADY.FM"
  stationUrl?: string; // Default: "https://heady.fm"
  stationLogo?: string;
  
  // Play statistics
  playCount?: number;
  lastPlayed?: string; // ISO 8601 date
  firstPlayed?: string; // ISO 8601 date
}

/**
 * Generate comprehensive music knowledge graph for a song page
 * Returns a @graph array with all linked entities
 */
export function generateMusicKnowledgeGraph(data: SongPageData) {
  const baseUrl = 'https://heady.fm';
  const stationName = data.stationName || 'HEADY.FM';
  const stationUrl = data.stationUrl || baseUrl;
  
  // Generate unique IDs for each entity (using URLs as stable identifiers)
  const webpageId = `${data.trackUrl}#webpage`;
  const recordingId = `${data.trackUrl}#recording`;
  const artistId = `${data.artistUrl}#artist`;
  const albumId = data.albumName ? `${data.albumUrl || `${baseUrl}/album/${encodeURIComponent(data.albumName)}`}#album` : null;
  const stationId = `${stationUrl}#station`;
  
  // Build sameAs array for external links
  const sameAs: string[] = [];
  if (data.spotifyUrl) sameAs.push(data.spotifyUrl);
  if (data.appleMusicUrl) sameAs.push(data.appleMusicUrl);
  if (data.youtubeUrl) sameAs.push(data.youtubeUrl);
  if (data.geniusUrl) sameAs.push(data.geniusUrl);
  if (data.lastfmUrl) sameAs.push(data.lastfmUrl);
  
  // 1. WebPage - The page itself
  const webpage = {
    '@id': webpageId,
    '@type': 'WebPage',
    url: data.trackUrl,
    name: `${data.trackTitle} by ${data.artistName} | ${stationName}`,
    description: data.trackDescription || `${data.trackTitle} by ${data.artistName} on ${stationName}`,
    mainEntity: {
      '@id': recordingId,
    },
    publisher: {
      '@id': stationId,
    },
    ...(data.trackImage && {
      image: data.trackImage,
    }),
    ...(data.trackReleaseDate && {
      datePublished: data.trackReleaseDate,
    }),
    ...(data.lastPlayed && {
      dateModified: data.lastPlayed,
    }),
  };
  
  // 2. MusicRecording - The song/track
  const recording: any = {
    '@id': recordingId,
    '@type': 'MusicRecording',
    name: data.trackTitle,
    url: data.trackUrl,
    byArtist: {
      '@id': artistId,
    },
    ...(data.trackDescription && {
      description: data.trackDescription,
    }),
    ...(data.trackImage && {
      image: data.trackImage,
    }),
    ...(data.trackDuration && {
      duration: data.trackDuration,
    }),
    ...(data.trackGenre && {
      genre: Array.isArray(data.trackGenre) ? data.trackGenre : [data.trackGenre],
    }),
    ...(data.trackYear && {
      copyrightYear: data.trackYear,
    }),
    ...(data.trackReleaseDate && {
      datePublished: data.trackReleaseDate,
    }),
    ...(data.trackIsrcCode && {
      isrcCode: data.trackIsrcCode,
    }),
    // Link to station/publisher
    publisher: {
      '@id': stationId,
    },
    // Link to album if available
    ...(data.albumName && albumId && {
      inAlbum: {
        '@id': albumId,
      },
    }),
    // External links
    ...(sameAs.length > 0 && {
      sameAs: sameAs,
    }),
    // Play statistics
    ...(data.playCount && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ListenAction',
        userInteractionCount: data.playCount,
      },
    }),
  };
  
  // 3. MusicGroup or Person - The artist
  const artistType = data.artistType || 'MusicGroup';
  const artist: any = {
    '@id': artistId,
    '@type': artistType,
    name: data.artistName,
    url: data.artistUrl,
    ...(data.artistDescription && {
      description: data.artistDescription,
    }),
    ...(data.artistImage && {
      image: data.artistImage,
    }),
    // Link back to station (artists are part of the station's catalog)
    ...(data.playCount && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ListenAction',
        userInteractionCount: data.playCount,
      },
    }),
  };
  
  // 4. MusicAlbum - The album (if available)
  let album = null;
  if (data.albumName && albumId) {
    album = {
      '@id': albumId,
      '@type': 'MusicAlbum',
      name: data.albumName,
      ...(data.albumUrl && {
        url: data.albumUrl,
      }),
      ...(data.albumImage && {
        image: data.albumImage,
      }),
      byArtist: {
        '@id': artistId,
      },
      ...(data.albumReleaseDate && {
        datePublished: data.albumReleaseDate,
      }),
      publisher: {
        '@id': stationId,
      },
    };
  }
  
  // 5. Organization - HEADY.FM station
  const station = {
    '@id': stationId,
    '@type': 'Organization',
    name: stationName,
    url: stationUrl,
    logo: data.stationLogo || `${baseUrl}/og-image.png`,
    description: 'Commercial-free indie rock radio station streaming underground alternative music, emerging artists, and deep cuts 24/7.',
    sameAs: [
      // Add social media links if available
      // 'https://twitter.com/headyfm',
      // 'https://instagram.com/headyfm',
    ],
  };
  
  // Build the graph array
  const graph: any[] = [webpage, recording, artist, station];
  if (album) {
    graph.push(album);
  }
  
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/**
 * Generate BreadcrumbList for navigation
 */
export function generateBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Convert duration string (e.g., "3:30" or "03:30") to ISO 8601 format (PT3M30S)
 */
export function convertDurationToISO8601(duration: string): string | undefined {
  if (!duration) return undefined;
  
  // Handle various formats: "3:30", "03:30", "3:30:45", "PT3M30S"
  if (duration.startsWith('PT')) {
    // Already in ISO 8601 format
    return duration;
  }
  
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS format
    const minutes = parts[0];
    const seconds = parts[1];
    return `PT${minutes}M${seconds}S`;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const hours = parts[0];
    const minutes = parts[1];
    const seconds = parts[2];
    return `PT${hours}H${minutes}M${seconds}S`;
  }
  
  return undefined;
}

/**
 * Template with placeholder variables for CMS integration
 * 
 * Usage in CMS:
 * {{trackTitle}} - Song title
 * {{artistName}} - Artist name
 * {{trackUrl}} - Full URL to song page
 * {{albumName}} - Album name (optional)
 * {{duration}} - Duration in MM:SS or HH:MM:SS format
 * {{playCount}} - Number of times played
 * etc.
 */
export const SONG_PAGE_SCHEMA_TEMPLATE = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@id': '{{trackUrl}}#webpage',
      '@type': 'WebPage',
      url: '{{trackUrl}}',
      name: '{{trackTitle}} by {{artistName}} | HEADY.FM',
      description: '{{trackDescription}}',
      mainEntity: { '@id': '{{trackUrl}}#recording' },
      publisher: { '@id': 'https://heady.fm#station' },
      image: '{{trackImage}}',
      datePublished: '{{trackReleaseDate}}',
    },
    {
      '@id': '{{trackUrl}}#recording',
      '@type': 'MusicRecording',
      name: '{{trackTitle}}',
      url: '{{trackUrl}}',
      byArtist: { '@id': '{{artistUrl}}#artist' },
      inAlbum: { '@id': '{{albumUrl}}#album' }, // Only if album exists
      description: '{{trackDescription}}',
      image: '{{trackImage}}',
      duration: '{{trackDurationISO8601}}', // PT3M30S format
      genre: '{{trackGenre}}',
      datePublished: '{{trackReleaseDate}}',
      isrcCode: '{{trackIsrcCode}}', // If available
      publisher: { '@id': 'https://heady.fm#station' },
      sameAs: [
        '{{spotifyUrl}}',
        '{{appleMusicUrl}}',
        '{{youtubeUrl}}',
        '{{geniusUrl}}',
      ],
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ListenAction',
        userInteractionCount: '{{playCount}}',
      },
    },
    {
      '@id': '{{artistUrl}}#artist',
      '@type': 'MusicGroup', // or 'Person'
      name: '{{artistName}}',
      url: '{{artistUrl}}',
      description: '{{artistDescription}}',
      image: '{{artistImage}}',
    },
    {
      '@id': '{{albumUrl}}#album', // Only if album exists
      '@type': 'MusicAlbum',
      name: '{{albumName}}',
      url: '{{albumUrl}}',
      image: '{{albumImage}}',
      byArtist: { '@id': '{{artistUrl}}#artist' },
      publisher: { '@id': 'https://heady.fm#station' },
      datePublished: '{{albumReleaseDate}}',
    },
    {
      '@id': 'https://heady.fm#station',
      '@type': 'Organization',
      name: 'HEADY.FM',
      url: 'https://heady.fm',
      logo: 'https://heady.fm/og-image.png',
      description: 'Commercial-free indie rock radio station streaming underground alternative music, emerging artists, and deep cuts 24/7.',
    },
  ],
};

