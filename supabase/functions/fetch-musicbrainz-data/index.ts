import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MusicBrainz requires a User-Agent header
const MB_USER_AGENT = 'HEADY.FM/1.0 (https://heady.fm)';
const MB_BASE_URL = 'https://musicbrainz.org/ws/2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, title, type = 'artist', mbid } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (type === 'artist') {
      // Check cache first (30 days for MusicBrainz data as it's more stable)
      const { data: cached } = await supabase
        .from('musicbrainz_artist_data')
        .select('*')
        .ilike('artist_name', artist)
        .gte('cached_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (cached) {
        console.log('Cache hit for MusicBrainz artist:', artist);
        return new Response(
          JSON.stringify({ data: cached.full_data, source: 'cache' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Search MusicBrainz for artist
      console.log('Fetching from MusicBrainz API:', artist);
      const searchUrl = `${MB_BASE_URL}/artist/?query=${encodeURIComponent(artist)}&fmt=json&limit=1`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': MB_USER_AGENT,
          'Accept': 'application/json'
        }
      });

      if (!searchResponse.ok) {
        throw new Error(`MusicBrainz API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const artists = searchData.artists || [];

      if (artists.length === 0) {
        console.log('No MusicBrainz results for:', artist);
        return new Response(
          JSON.stringify({ data: null, source: 'api' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find the best matching artist (exact name match preferred)
      const artistLower = artist.toLowerCase().trim();
      let bestMatch = artists[0]; // Default to first result
      
      for (const candidateArtist of artists) {
        const candidateName = candidateArtist.name.toLowerCase().trim();
        if (candidateName === artistLower) {
          bestMatch = candidateArtist;
          break; // Exact match found, use it
        }
      }

      const artistData = bestMatch;
      const artistMbid = artistData.id;
      
      console.log(`Using MusicBrainz artist: ${artistData.name} (MBID: ${artistMbid})`);

      // Fetch detailed artist info with relationships
      const detailUrl = `${MB_BASE_URL}/artist/${artistMbid}?inc=url-rels+tags+genres+ratings+aliases&fmt=json`;
      
      const detailResponse = await fetch(detailUrl, {
        headers: {
          'User-Agent': MB_USER_AGENT,
          'Accept': 'application/json'
        }
      });

      const detailData = await detailResponse.json();

      // Extract useful information
      const extractedData = {
        mbid: artistMbid,
        name: detailData.name,
        sort_name: detailData['sort-name'],
        type: detailData.type || null,
        country: detailData.country || null,
        disambiguation: detailData.disambiguation || null,
        begin_date: detailData['life-span']?.begin || null,
        end_date: detailData['life-span']?.end || null,
        ended: detailData['life-span']?.ended || false,
        genres: detailData.genres?.map((g: any) => ({ name: g.name, count: g.count })) || [],
        tags: detailData.tags?.map((t: any) => ({ name: t.name, count: t.count })) || [],
        rating: {
          value: detailData.rating?.value || null,
          votes_count: detailData.rating?.['votes-count'] || 0
        },
        aliases: detailData.aliases?.map((a: any) => a.name) || [],
        urls: detailData.relations?.filter((r: any) => r.type === 'url').map((r: any) => ({
          type: r.type,
          url: r.url?.resource || null,
        })) || [],
        image_url: null,
      };

      // Try to get artist image from Cover Art Archive
      try {
        // Get first release group to find cover art
        const releaseUrl = `${MB_BASE_URL}/release-group?artist=${artistMbid}&fmt=json&limit=1`;
        const releaseResponse = await fetch(releaseUrl, {
          headers: { 'User-Agent': MB_USER_AGENT, 'Accept': 'application/json' }
        });
        
        if (releaseResponse.ok) {
          const releaseData = await releaseResponse.json();
          if (releaseData['release-groups']?.length > 0) {
            const releaseGroupMbid = releaseData['release-groups'][0].id;
            const coverArtUrl = `https://coverartarchive.org/release-group/${releaseGroupMbid}/front-500`;
            
            // Check if image exists
            const imgResponse = await fetch(coverArtUrl, { method: 'HEAD' });
            if (imgResponse.ok) {
              extractedData.image_url = coverArtUrl;
            }
          }
        }
      } catch (err) {
        console.log('No Cover Art Archive image found:', err);
      }

      // Cache the data
      await supabase
        .from('musicbrainz_artist_data')
        .upsert({
          artist_name: artist,
          mbid: artistMbid,
          full_data: extractedData,
          cached_at: new Date().toISOString()
        }, {
          onConflict: 'artist_name'
        });

      console.log('Cached MusicBrainz data for:', artist);

      return new Response(
        JSON.stringify({ data: extractedData, source: 'api' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'recording' && title) {
      // Search for recording (song)
      const searchUrl = `${MB_BASE_URL}/recording/?query=artist:${encodeURIComponent(artist)}%20AND%20recording:${encodeURIComponent(title)}&fmt=json&limit=1`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': MB_USER_AGENT,
          'Accept': 'application/json'
        }
      });

      const searchData = await searchResponse.json();
      const recordings = searchData.recordings || [];

      if (recordings.length === 0) {
        return new Response(
          JSON.stringify({ data: null, source: 'api' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const recording = recordings[0];
      const recordingMbid = recording.id;

      // Fetch detailed recording info
      const detailUrl = `${MB_BASE_URL}/recording/${recordingMbid}?inc=artist-credits+tags+genres+ratings+isrcs&fmt=json`;
      
      const detailResponse = await fetch(detailUrl, {
        headers: {
          'User-Agent': MB_USER_AGENT,
          'Accept': 'application/json'
        }
      });

      const detailData = await detailResponse.json();

      const extractedData = {
        mbid: recordingMbid,
        title: detailData.title,
        length: detailData.length || null,
        artist_credits: detailData['artist-credit']?.map((ac: any) => ac.name) || [],
        genres: detailData.genres?.map((g: any) => g.name) || [],
        tags: detailData.tags?.map((t: any) => t.name) || [],
        rating: {
          value: detailData.rating?.value || null,
          votes_count: detailData.rating?.['votes-count'] || 0
        },
        isrcs: detailData.isrcs || [],
        first_release_date: detailData['first-release-date'] || null,
      };

      return new Response(
        JSON.stringify({ data: extractedData, source: 'api' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type specified' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-musicbrainz-data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

