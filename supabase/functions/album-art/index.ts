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
    const { artworkId, artist, title } = await req.json();

    // Try RadioBoss CDN first
    if (artworkId) {
      const radiobossUrl = `https://c22.radioboss.fm/w/artwork/${artworkId}/364.jpg`;
      try {
        const radiobossResponse = await fetch(radiobossUrl);
        if (radiobossResponse.ok) {
          console.log(`Found album art on RadioBoss CDN: ${artworkId}`);
          return new Response(
            JSON.stringify({ 
              url: radiobossUrl,
              source: 'radioboss'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (err) {
        console.log('RadioBoss CDN failed:', err);
      }
    }

    // Try Last.fm API as primary fallback
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

    // Fallback to MusicBrainz Cover Art Archive
    if (artist && title) {
      try {
        const searchQuery = encodeURIComponent(`${artist} ${title}`);
        const mbSearchUrl = `https://musicbrainz.org/ws/2/release/?query=${searchQuery}&fmt=json&limit=1`;
        
        const mbResponse = await fetch(mbSearchUrl, {
          headers: { 'User-Agent': 'ETRadio/1.0.0 (contact@etradio.com)' }
        });

        if (mbResponse.ok) {
          const mbData = await mbResponse.json();
          const releaseId = mbData.releases?.[0]?.id;
          
          if (releaseId) {
            const coverArtUrl = `https://coverartarchive.org/release/${releaseId}/front-500`;
            const coverArtResponse = await fetch(coverArtUrl);
            
            if (coverArtResponse.ok) {
              console.log(`Found album art on Cover Art Archive for: ${artist} - ${title}`);
              return new Response(
                JSON.stringify({ 
                  url: coverArtUrl,
                  source: 'coverartarchive'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }
      } catch (err) {
        console.log('MusicBrainz/Cover Art Archive failed:', err);
      }
    }

    // Return placeholder
    console.log('No album art found, using placeholder');
    return new Response(
      JSON.stringify({ 
        url: null,
        source: 'placeholder'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in album-art function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch album art' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
