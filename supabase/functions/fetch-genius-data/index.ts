import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, title, type = 'song' } = await req.json();

    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const GENIUS_API_KEY = Deno.env.get('GENIUS_API_KEY');
    if (!GENIUS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GENIUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we're fetching song or artist data
    if (type === 'song' && title) {
      // Check cache first (7 days)
      const { data: cachedSong } = await supabase
        .from('genius_song_data')
        .select('*')
        .eq('artist', artist)
        .eq('title', title)
        .gte('cached_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (cachedSong) {
        console.log(`Cache hit for song: ${artist} - ${title}`);
        return new Response(
          JSON.stringify({ data: cachedSong.full_data, source: 'cache' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Search Genius API
      console.log(`Fetching from Genius API: ${artist} - ${title}`);
      const searchQuery = encodeURIComponent(`${artist} ${title}`);
      const searchUrl = `https://api.genius.com/search?q=${searchQuery}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${GENIUS_API_KEY}` }
      });

      if (!searchResponse.ok) {
        throw new Error(`Genius API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const hits = searchData.response?.hits || [];

      if (hits.length === 0) {
        console.log(`No results found for: ${artist} - ${title}`);
        return new Response(
          JSON.stringify({ data: null, source: 'api' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the first match
      const song = hits[0].result;
      const songId = song.id;

      // Fetch detailed song data
      const songUrl = `https://api.genius.com/songs/${songId}`;
      const songResponse = await fetch(songUrl, {
        headers: { 'Authorization': `Bearer ${GENIUS_API_KEY}` }
      });

      const songData = await songResponse.json();
      const fullSongData = songData.response?.song || {};

      // Store in cache
      await supabase
        .from('genius_song_data')
        .upsert({
          artist,
          title,
          genius_id: songId,
          full_data: fullSongData,
          cached_at: new Date().toISOString()
        }, {
          onConflict: 'artist,title'
        });

      console.log(`Cached song data for: ${artist} - ${title}`);

      return new Response(
        JSON.stringify({ data: fullSongData, source: 'api' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'artist') {
      // Check cache first (7 days)
      const { data: cachedArtist } = await supabase
        .from('genius_artist_data')
        .select('*')
        .eq('artist_name', artist)
        .gte('cached_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (cachedArtist) {
        console.log(`Cache hit for artist: ${artist}`);
        return new Response(
          JSON.stringify({ data: cachedArtist.full_data, source: 'cache' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Search for artist on Genius
      console.log(`Fetching artist from Genius API: ${artist}`);
      const searchQuery = encodeURIComponent(artist);
      const searchUrl = `https://api.genius.com/search?q=${searchQuery}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${GENIUS_API_KEY}` }
      });

      if (!searchResponse.ok) {
        throw new Error(`Genius API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const hits = searchData.response?.hits || [];

      if (hits.length === 0) {
        console.log(`No results found for artist: ${artist}`);
        return new Response(
          JSON.stringify({ data: null, source: 'api' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find the best matching artist by name (case-insensitive exact match)
      const artistLower = artist.toLowerCase().trim();
      let bestMatch = null;
      let bestMatchScore = 0;

      for (const hit of hits) {
        const primaryArtist = hit.result?.primary_artist;
        if (!primaryArtist) continue;

        const candidateName = primaryArtist.name.toLowerCase().trim();
        
        // Exact match (highest priority)
        if (candidateName === artistLower) {
          bestMatch = primaryArtist;
          bestMatchScore = 100;
          break;
        }
        
        // Contains match (lower priority)
        if (candidateName.includes(artistLower) && bestMatchScore < 50) {
          bestMatch = primaryArtist;
          bestMatchScore = 50;
        }
      }

      const artistId = bestMatch?.id;

      if (!artistId) {
        console.log(`No matching artist found for: ${artist}`);
        return new Response(
          JSON.stringify({ data: null, source: 'api' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Found artist match: ${bestMatch.name} (ID: ${artistId}) with score ${bestMatchScore}`);

      // Fetch detailed artist data
      const artistUrl = `https://api.genius.com/artists/${artistId}`;
      const artistResponse = await fetch(artistUrl, {
        headers: { 'Authorization': `Bearer ${GENIUS_API_KEY}` }
      });

      const artistData = await artistResponse.json();
      const fullArtistData = artistData.response?.artist || {};

      // Store in cache
      await supabase
        .from('genius_artist_data')
        .upsert({
          artist_name: artist,
          genius_id: artistId,
          full_data: fullArtistData,
          cached_at: new Date().toISOString()
        }, {
          onConflict: 'artist_name'
        });

      console.log(`Cached artist data for: ${artist}`);

      return new Response(
        JSON.stringify({ data: fullArtistData, source: 'api' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-genius-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
