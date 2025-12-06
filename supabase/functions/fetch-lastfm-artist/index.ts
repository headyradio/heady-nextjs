import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist } = await req.json();

    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const lastfmApiKey = Deno.env.get('LASTFM_API_KEY');
    if (!lastfmApiKey) {
      return new Response(
        JSON.stringify({ error: 'Last.fm API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first (7 days)
    const { data: cached, error: cacheError } = await supabase
      .from('lastfm_artist_data')
      .select('*')
      .ilike('artist_name', artist)
      .gte('cached_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (cached && !cacheError) {
      console.log('Returning cached Last.fm artist data for:', artist);
      return new Response(
        JSON.stringify({ data: cached.full_data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from Last.fm API
    console.log('Fetching Last.fm artist data for:', artist);
    const lastfmUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${lastfmApiKey}&format=json`;
    
    const response = await fetch(lastfmUrl);
    const data = await response.json();

    if (data.error || !data.artist) {
      console.log('Last.fm API error or no artist found:', data.message || 'Unknown error');
      return new Response(
        JSON.stringify({ data: null, error: data.message || 'Artist not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const artistData = data.artist;
    
    // Extract the most useful information
    const extractedData = {
      name: artistData.name,
      mbid: artistData.mbid || null,
      url: artistData.url,
      image_url: artistData.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || 
                 artistData.image?.find((img: any) => img.size === 'large')?.['#text'] || 
                 artistData.image?.[artistData.image.length - 1]?.['#text'] || null,
      images: artistData.image || [],
      bio: artistData.bio?.summary || null,
      bio_full: artistData.bio?.content || null,
      similar: artistData.similar?.artist?.slice(0, 10).map((a: any) => ({
        name: a.name,
        url: a.url,
        image_url: a.image?.find((img: any) => img.size === 'large')?.['#text'] || null
      })) || [],
      tags: artistData.tags?.tag?.map((t: any) => t.name) || [],
      stats: {
        listeners: artistData.stats?.listeners || '0',
        playcount: artistData.stats?.playcount || '0'
      }
    };

    // Cache the data
    const { error: upsertError } = await supabase
      .from('lastfm_artist_data')
      .upsert({
        artist_name: artist,
        lastfm_mbid: extractedData.mbid,
        full_data: extractedData,
        cached_at: new Date().toISOString()
      }, {
        onConflict: 'artist_name'
      });

    if (upsertError) {
      console.error('Error caching Last.fm data:', upsertError);
    }

    return new Response(
      JSON.stringify({ data: extractedData, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-lastfm-artist function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
