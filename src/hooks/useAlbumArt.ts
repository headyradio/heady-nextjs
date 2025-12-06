import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AlbumArtResult {
  url: string | null;
  source: 'radioboss' | 'coverartarchive' | 'placeholder';
}

// Cache for album art URLs
const albumArtCache = new Map<string, string | null>();

export const useAlbumArt = (
  artworkId?: string | null,
  artist?: string,
  title?: string,
  initialUrl?: string | null
) => {
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Reset state when identifiers change
    setImageUrl(initialUrl || null);
    setIsLoading(false);

    // If we have an initial URL, try it first
    if (initialUrl) {
      return;
    }

    // Check cache first
    const cacheKey = artworkId || `${artist}-${title}`;
    if (albumArtCache.has(cacheKey)) {
      const cachedUrl = albumArtCache.get(cacheKey) || null;
      if (isMounted) {
        setImageUrl(cachedUrl);
      }
      return;
    }

    // Only fetch if we don't have a URL and have some identifier
    if (!artworkId && (!artist || !title)) {
      return;
    }

    // Debounce the fetch to avoid rapid successive calls
    timeoutId = setTimeout(() => {
      const fetchAlbumArt = async () => {
        if (!isMounted) return;
        
        setIsLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke<AlbumArtResult>('album-art', {
            body: { artworkId, artist, title }
          });

          if (!isMounted) return;

          if (error) throw error;

          const fetchedUrl = data?.url || null;
          setImageUrl(fetchedUrl);
          albumArtCache.set(cacheKey, fetchedUrl);
        } catch (err) {
          if (isMounted) {
            console.error('Failed to fetch album art:', err);
            setImageUrl(null);
            albumArtCache.set(cacheKey, null);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchAlbumArt();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [artworkId, artist, title, initialUrl]);

  return { imageUrl, isLoading };
};
