/**
 * Generate structured data (JSON-LD) for SEO
 */

export interface SongStructuredData {
  title: string;
  artist: string;
  album?: string;
  image?: string;
  url: string;
  description?: string;
  duration?: string;
  genre?: string;
  datePublished?: string;
  playCount?: number;
}

export interface ArtistStructuredData {
  name: string;
  image?: string;
  url: string;
  description?: string;
  genre?: string[];
  totalPlays?: number;
  uniqueSongs?: number;
}

/**
 * Generate MusicRecording structured data for a song
 */
export const generateSongStructuredData = (data: SongStructuredData) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: data.title,
    byArtist: {
      '@type': 'MusicGroup',
      name: data.artist,
      url: `https://heady.fm/artist/${encodeURIComponent(data.artist)}`,
    },
    ...(data.album && {
      inAlbum: {
        '@type': 'MusicAlbum',
        name: data.album,
      },
    }),
    ...(data.image && {
      image: data.image,
    }),
    url: data.url,
    ...(data.description && {
      description: data.description,
    }),
    ...(data.duration && {
      duration: data.duration,
    }),
    ...(data.genre && {
      genre: data.genre,
    }),
    ...(data.datePublished && {
      datePublished: data.datePublished,
    }),
    ...(data.playCount && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ListenAction',
        userInteractionCount: data.playCount,
      },
    }),
  };
};

/**
 * Generate MusicGroup structured data for an artist
 */
export const generateArtistStructuredData = (data: ArtistStructuredData) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: data.name,
    ...(data.image && {
      image: data.image,
    }),
    url: data.url,
    ...(data.description && {
      description: data.description,
    }),
    ...(data.genre && data.genre.length > 0 && {
      genre: data.genre,
    }),
    ...(data.totalPlays && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ListenAction',
        userInteractionCount: data.totalPlays,
      },
    }),
  };
};

/**
 * Generate BreadcrumbList structured data
 */
export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
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
};

