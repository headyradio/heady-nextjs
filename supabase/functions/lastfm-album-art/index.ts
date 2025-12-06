import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LASTFM_API_KEY = 'b6ae830c185fc9d7dbcd97f6a3ebe580';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, title } = await req.json();

    // Try Last.fm API only
    if (artist && title) {
      try {
        const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`;
        
        const lastfmResponse = await fetch(lastfmUrl);
        
        if (lastfmResponse.ok) {
          const lastfmData = await lastfmResponse.json();
          const albumArtUrl = lastfmData?.track?.album?.image?.find((img: any) => img.size === 'extralarge')?.['#text'] 
            || lastfmData?.track?.album?.image?.find((img: any) => img.size === 'large')?.['#text'];
          
          if (albumArtUrl && albumArtUrl.trim() !== '') {
            console.log(`Found album art on Last.fm for: ${artist} - ${title}`);
            return new Response(
              JSON.stringify({ 
                url: albumArtUrl,
                source: 'lastfm'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (err) {
        console.log('Last.fm API failed:', err);
      }
    }

    // Return null to trigger Heady fallback
    console.log('No album art found on Last.fm, will use Heady fallback');
    return new Response(
      JSON.stringify({ 
        url: null,
        source: 'placeholder'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lastfm-album-art function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch album art' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
