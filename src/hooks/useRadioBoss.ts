import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { getInitialNowPlayingFromWindow, getInitialNowPlaying, type InitialNowPlayingData } from '@/lib/getInitialNowPlaying';

const RADIOBOSS_API_URL = 'https://c22.radioboss.fm/api/info/364?key=FZPFZ5DNHQOP';
const POLL_INTERVAL = 120000; // 2 minutes
const SMART_POLL_INTERVAL = 30000; // 30 seconds for smart polling
const CACHE_KEY = 'heady_radio_cache';

// Load cached data from localStorage
const loadCachedData = (): RadioBossData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is less than 5 minutes old
      if (parsed.lastUpdate && Date.now() - new Date(parsed.lastUpdate).getTime() < 5 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load cached data:', err);
  }
  return null;
};

// Save data to localStorage cache
const saveCachedData = (data: RadioBossData) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save cached data:', err);
  }
};

// Convert InitialNowPlayingData to RadioBossData format
const convertInitialData = (initial: InitialNowPlayingData): RadioBossData => {
  return {
    nowPlaying: initial.nowPlaying,
    recentTracks: initial.nowPlaying ? [initial.nowPlaying] : [],
    stationName: initial.stationName,
    listenersCount: initial.listenersCount,
    isLive: initial.isLive,
    lastUpdate: new Date(initial.lastUpdate),
  };
};

export interface Transmission {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  play_started_at: string;
  duration?: string | null;
  album_art_url?: string | null;
  genre?: string | null;
  year?: string | null;
  artwork_id?: string | null;
  listeners_count?: number;
  created_at?: string;
}

export interface RadioBossData {
  nowPlaying: Transmission | null;
  recentTracks: Transmission[];
  stationName: string;
  listenersCount: number;
  isLive: boolean;
  lastUpdate: Date | null;
}

export const useRadioBoss = () => {
  // Priority order: 1) Window data (SSR), 2) localStorage cache, 3) Fetch from API
  const windowData = getInitialNowPlayingFromWindow();
  const cachedData = loadCachedData();
  
  // Use window data if available (most recent), otherwise fall back to cache
  const initialData = windowData 
    ? convertInitialData(windowData)
    : (cachedData || {
        nowPlaying: null,
        recentTracks: [],
        stationName: 'E.T. Radio',
        listenersCount: 0,
        isLive: false,
        lastUpdate: null,
      });
  
  const [data, setData] = useState<RadioBossData>(initialData);
  // Only show loading if we have no initial data at all
  const [isLoading, setIsLoading] = useState(!windowData && !cachedData);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(!!windowData || !!cachedData);
  
  // Track logged transmissions with timestamps to avoid re-logging
  const loggedTransmissionsRef = useRef<Map<string, number>>(new Map());
  const lastDataRef = useRef<string | null>(null);

  const logTransmission = async (transmission: Transmission) => {
    // Create a unique key based on title and artist only
    const songKey = `${transmission.title}-${transmission.artist}`;
    const now = Date.now();
    const lastLoggedTime = loggedTransmissionsRef.current.get(songKey);

    // Skip if this song was logged within the last 3 minutes
    if (lastLoggedTime && (now - lastLoggedTime) < 3 * 60 * 1000) {
      return;
    }

    try {
      // The RadioBoss API returns timestamps like "2025-10-01 13:45:50" in Eastern Time
      // Interpret this as Eastern Time and convert to UTC
      const easternDate = fromZonedTime(transmission.play_started_at, 'America/New_York');
      
      const transmissionWithUTC = {
        ...transmission,
        play_started_at: easternDate.toISOString()
      };
      
      await supabase.functions.invoke('log-transmission', {
        body: { transmission: transmissionWithUTC }
      });
      
      // Mark as logged with current timestamp
      loggedTransmissionsRef.current.set(songKey, now);
      
      // Clean up old entries (remove entries older than 15 minutes)
      const fifteenMinutesAgo = now - 15 * 60 * 1000;
      for (const [key, time] of loggedTransmissionsRef.current.entries()) {
        if (time < fifteenMinutesAgo) {
          loggedTransmissionsRef.current.delete(key);
        }
      }
      
      console.log('Logged transmission to database:', transmission.title);
    } catch (err) {
      console.error('Failed to log transmission:', err);
    }
  };

  const fetchRadioData = useCallback(async () => {
    try {
      const response = await fetch(RADIOBOSS_API_URL);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiData = await response.json();
      
      // Quick check if data actually changed
      const dataHash = JSON.stringify({
        current: apiData.currenttrack_info?.['@attributes']?.TITLE,
        recent: apiData.recent?.[0]?.tracktitle
      });
      
      if (lastDataRef.current === dataHash && !isLoading) {
        // Data hasn't changed, skip update
        return;
      }
      
      lastDataRef.current = dataHash;
      setIsLoading(true);
      setError(null);

      // Parse current track
      const currentTrack = apiData.currenttrack_info?.['@attributes'];
      const nowPlaying: Transmission | null = currentTrack ? {
        id: `current-${currentTrack.TITLE}-${currentTrack.LASTPLAYED}`,
        title: currentTrack.TITLE || 'Unknown',
        artist: currentTrack.ARTIST || 'Unknown Artist',
        album: currentTrack.ALBUM || null,
        play_started_at: currentTrack.LASTPLAYED || new Date().toISOString(),
        duration: currentTrack.DURATION || null,
        album_art_url: apiData.links?.artwork || null,
        genre: currentTrack.GENRE || null,
        year: currentTrack.YEAR || null,
        artwork_id: null,
        listeners_count: apiData.listeners || 0,
      } : null;

      // Parse recent tracks
      const recentTracks: Transmission[] = (apiData.recent || []).map((track: any) => ({
        id: `recent-${track.artworkid}-${track.started}`,
        title: track.tracktitle || 'Unknown',
        artist: track.trackartist || 'Unknown Artist',
        album: null,
        play_started_at: track.started || new Date().toISOString(),
        duration: null,
        album_art_url: track.artworkid 
          ? `https://c22.radioboss.fm/w/artwork/${track.artworkid}/364.jpg`
          : null,
        genre: null,
        year: null,
        artwork_id: track.artworkid || null,
        listeners_count: apiData.listeners || 0,
      }));

      // Batch log all transmissions in parallel
      const allTracks = [nowPlaying, ...recentTracks].filter(Boolean) as Transmission[];
      const now = Date.now();
      const newTracks = allTracks.filter(track => {
        const songKey = `${track.title}-${track.artist}`;
        const lastLoggedTime = loggedTransmissionsRef.current.get(songKey);
        // Only include if not logged in the last 3 minutes
        return !lastLoggedTime || (now - lastLoggedTime) >= 3 * 60 * 1000;
      });
      
      if (newTracks.length > 0) {
        await Promise.all(newTracks.map(track => logTransmission(track)));
      }

      const newData = {
        nowPlaying,
        recentTracks,
        stationName: apiData.station_name || 'E.T. Radio',
        listenersCount: apiData.listeners || 0,
        isLive: !!nowPlaying,
        lastUpdate: new Date(),
      };
      
      setData(newData);
      saveCachedData(newData); // Save to cache
      setIsInitialized(true);
    } catch (err) {
      console.error('Error fetching radio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch radio data');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Initial fetch - only if we don't have initial data
  useEffect(() => {
    if (!isInitialized) {
      // Try to fetch from Edge Function first (faster, cached)
      getInitialNowPlaying()
        .then((initialData) => {
          if (initialData.nowPlaying) {
            const converted = convertInitialData(initialData);
            setData(converted);
            saveCachedData(converted);
            setIsInitialized(true);
            setIsLoading(false);
          } else {
            // Fall back to direct API call
            fetchRadioData();
          }
        })
        .catch(() => {
          // Fall back to direct API call if Edge Function fails
          fetchRadioData();
        });
    }
  }, [isInitialized, fetchRadioData]);

  // Smart polling - check more frequently but only update if changed
  // Start polling after initial data is loaded
  useEffect(() => {
    if (!isInitialized) return;
    
    const interval = setInterval(fetchRadioData, SMART_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRadioData, isInitialized]);

  return {
    ...data,
    isLoading,
    error,
    refresh: fetchRadioData,
  };
};
