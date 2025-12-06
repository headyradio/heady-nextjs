/**
 * Get initial "Now Playing" data from server-side fetch
 * This runs before React hydration to provide immediate data
 */

import { Transmission } from '@/hooks/useRadioBoss';

export interface InitialNowPlayingData {
  nowPlaying: Transmission | null;
  stationName: string;
  listenersCount: number;
  isLive: boolean;
  lastUpdate: string;
}

/**
 * Fetches initial now playing data from Supabase Edge Function
 * This should be called before React hydration for SSR-like behavior
 */
export async function getInitialNowPlaying(): Promise<InitialNowPlayingData> {
  try {
    // Use Supabase Edge Function for server-side fetch
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-now-playing`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
        },
        // Don't cache on client - we want fresh data
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch initial now playing data:', error);
    
    // Return fallback data
    return {
      nowPlaying: null,
      stationName: 'E.T. Radio',
      listenersCount: 0,
      isLive: false,
      lastUpdate: new Date().toISOString(),
    };
  }
}

/**
 * Get initial data from window object (injected by server)
 * This is used when data is pre-rendered into HTML
 */
export function getInitialNowPlayingFromWindow(): InitialNowPlayingData | null {
  if (typeof window === 'undefined') return null;
  
  const data = (window as any).__INITIAL_NOW_PLAYING__;
  if (data) {
    // Clean up after reading
    delete (window as any).__INITIAL_NOW_PLAYING__;
    return data;
  }
  
  return null;
}

