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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { hour_archive_id, date_hour } = await req.json();

    if (!hour_archive_id && !date_hour) {
      return new Response(JSON.stringify({ error: 'hour_archive_id or date_hour required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the archive record
    let archiveQuery = supabaseClient.from('hourly_archives').select('*');
    
    if (hour_archive_id) {
      archiveQuery = archiveQuery.eq('id', hour_archive_id);
    } else {
      archiveQuery = archiveQuery.eq('date_hour', date_hour);
    }

    const { data: archive, error: archiveError } = await archiveQuery.single();

    if (archiveError || !archive) {
      return new Response(JSON.stringify({ error: 'Archive not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get transmissions for this hour
    const hourStart = new Date(archive.date_hour);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const { data: transmissions, error: transmissionsError } = await supabaseClient
      .from('transmissions')
      .select('*')
      .gte('play_started_at', hourStart.toISOString())
      .lt('play_started_at', hourEnd.toISOString())
      .order('play_started_at', { ascending: true });

    if (transmissionsError) {
      console.error('Error fetching transmissions:', transmissionsError);
      return new Response(JSON.stringify({ error: transmissionsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create or update playlist
    const { data: playlist, error: playlistError } = await supabaseClient
      .from('hourly_playlists')
      .upsert({
        hour_archive_id: archive.id,
        songs: transmissions || []
      }, { 
        onConflict: 'hour_archive_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (playlistError) {
      console.error('Error updating playlist:', playlistError);
      return new Response(JSON.stringify({ error: playlistError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Updated playlist for ${archive.date_hour} with ${transmissions?.length || 0} songs`);

    return new Response(JSON.stringify({ 
      message: 'Playlist updated',
      playlist,
      song_count: transmissions?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in update-playlist function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
