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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, guestName, content } = await req.json();

    if (!sessionId || !guestName || !content) {
      throw new Error('Missing required fields');
    }

    // Validate content length
    if (content.length > 500) {
      throw new Error('Message too long');
    }

    // Get or create guest profile
    let { data: guest, error: guestError } = await supabase
      .from('guest_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!guest) {
      // Create new guest
      const { data: newGuest, error: createError } = await supabase
        .from('guest_profiles')
        .insert({
          guest_name: guestName,
          session_id: sessionId,
          avatar_seed: Math.random().toString(36)
        })
        .select()
        .single();

      if (createError) throw createError;
      guest = newGuest;
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('live_chat_messages')
      .insert({
        content,
        guest_id: guest.id,
        sender_name: guest.guest_name,
        sender_avatar_url: null,
        is_guest: true
      })
      .select()
      .single();

    if (messageError) throw messageError;

    return new Response(
      JSON.stringify(message),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error posting guest message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
