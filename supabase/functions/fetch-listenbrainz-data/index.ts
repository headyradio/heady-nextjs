import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LB_BASE_URL = 'https://api.listenbrainz.org/1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, mbid } = await req.json();

    if (!artist && !mbid) {
      return new Response(
        JSON.stringify({ error: 'Artist name or MBID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const listenbrainzToken = Deno.env.get('LISTENBRAINZ_TOKEN');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache (7 days)
    const cacheKey = mbid || artist;
    const { data: cached } = await supabase
      .from('listenbrainz_data')
      .select('*')
      .eq(mbid ? 'mbid' : 'artist_name', cacheKey)
      .gte('cached_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (cached) {
      console.log('Cache hit for ListenBrainz:', artist || mbid);
      return new Response(
        JSON.stringify({ data: cached.full_data, source: 'cache' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    if (listenbrainzToken) {
      headers['Authorization'] = `Token ${listenbrainzToken}`;
    }

    // Get artist stats
    let statsData = null;
    if (mbid) {
      const statsUrl = `${LB_BASE_URL}/stats/artist/${mbid}/listeners`;
      try {
        const statsResponse = await fetch(statsUrl, { headers });
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
        }
      } catch (err) {
        console.log('ListenBrainz stats not available:', err);
      }
    }

    // Get similar artists based on listening data
    let similarArtists = [];
    if (mbid) {
      const similarUrl = `${LB_BASE_URL}/explore/similar-to/${mbid}`;
      try {
        const similarResponse = await fetch(similarUrl, { headers });
        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          similarArtists = similarData.similar_artists || [];
        }
      } catch (err) {
        console.log('Similar artists not available:', err);
      }
    }

    const extractedData = {
      mbid: mbid || null,
      artist_name: artist,
      listener_count: statsData?.payload?.count || 0,
      similar_artists: similarArtists.slice(0, 10).map((a: any) => ({
        artist_mbid: a.artist_mbid,
        artist_name: a.artist_name,
        score: a.score
      })),
      fetched_at: new Date().toISOString()
    };

    // Cache the data
    await supabase
      .from('listenbrainz_data')
      .upsert({
        artist_name: artist,
        mbid: mbid || null,
        full_data: extractedData,
        cached_at: new Date().toISOString()
      }, {
        onConflict: mbid ? 'mbid' : 'artist_name'
      });

    console.log('Cached ListenBrainz data for:', artist || mbid);

    return new Response(
      JSON.stringify({ data: extractedData, source: 'api' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-listenbrainz-data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

