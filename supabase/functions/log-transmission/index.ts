import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { transmission } = await req.json();

    console.log('Logging transmission:', transmission);

    // Validate timestamp is reasonable (within last 24 hours and not in future)
    const playTime = new Date(transmission.play_started_at).getTime();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    if (playTime > now + 60000 || playTime < oneDayAgo) {
      console.warn('Transmission timestamp out of reasonable range:', {
        play_started_at: transmission.play_started_at,
        current_time: new Date().toISOString()
      });
    }

    // Round timestamp to nearest minute for consistency
    const playStartedAt = new Date(transmission.play_started_at);
    playStartedAt.setSeconds(0, 0);
    const roundedTimestamp = playStartedAt.toISOString();

    console.log('Attempting to insert transmission:', {
      title: transmission.title,
      artist: transmission.artist,
      play_started_at: roundedTimestamp
    });

    // Insert new transmission (unique constraint will prevent duplicates at DB level)
    const { data, error } = await supabaseClient
      .from('transmissions')
      .insert({
        title: transmission.title,
        artist: transmission.artist,
        album: transmission.album,
        play_started_at: roundedTimestamp,
        duration: transmission.duration,
        album_art_url: transmission.album_art_url,
        genre: transmission.genre,
        year: transmission.year,
        artwork_id: transmission.artwork_id,
        listeners_count: transmission.listeners_count || 0,
        dj_name: transmission.dj_name || null,
        show_name: transmission.show_name || null,
      })
      .select();

    if (error) {
      // Handle unique constraint violation (duplicate entry)
      if (error.code === '23505') {
        console.log('Duplicate transmission detected by unique constraint, skipping:', {
          title: transmission.title,
          artist: transmission.artist,
          play_started_at: roundedTimestamp
        });
        
        return new Response(
          JSON.stringify({ success: true, data: null, skipped: true, reason: 'duplicate' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      console.error('Error logging transmission:', error);
      throw error;
    }

    console.log('Transmission logged successfully:', data[0]);

    return new Response(
      JSON.stringify({ success: true, data: data?.[0] || null }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in log-transmission function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
