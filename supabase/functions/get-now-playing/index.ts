import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RADIOBOSS_API_URL = 'https://c22.radioboss.fm/api/info/364?key=FZPFZ5DNHQOP';

interface Transmission {
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
}

interface RadioBossResponse {
  nowPlaying: Transmission | null;
  stationName: string;
  listenersCount: number;
  isLive: boolean;
  lastUpdate: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch from RadioBoss API
    const response = await fetch(RADIOBOSS_API_URL, {
      headers: {
        'User-Agent': 'HEADY.FM/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`RadioBoss API failed: ${response.status}`);
    }

    const apiData = await response.json();

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

    const result: RadioBossResponse = {
      nowPlaying,
      stationName: apiData.station_name || 'E.T. Radio',
      listenersCount: apiData.listeners || 0,
      isLive: !!nowPlaying,
      lastUpdate: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching now playing:', error);
    
    // Return a fallback response instead of error
    const fallback: RadioBossResponse = {
      nowPlaying: null,
      stationName: 'E.T. Radio',
      listenersCount: 0,
      isLive: false,
      lastUpdate: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(fallback),
      {
        status: 200, // Return 200 so client can still render
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  }
});

