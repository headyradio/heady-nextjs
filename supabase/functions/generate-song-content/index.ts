import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, title, isArtistOnly } = await req.json();
    
    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let prompt: string;
    
    if (isArtistOnly) {
      console.log(`Generating content for artist: ${artist}`);
      prompt = `Generate comprehensive information about the musical artist/band "${artist}". 
      
Please provide:
1. A brief overview of the artist/band and their musical career (2-3 sentences)
2. Their primary genre(s) and musical style
3. Notable achievements, albums, or hit songs
4. Their influence on music and cultural impact
5. Similar artists that fans might enjoy

Keep the response engaging and informative, around 200-300 words total.`;
    } else {
      console.log(`Generating content for: ${artist} - ${title}`);
      prompt = `Generate comprehensive information about the song "${title}" by ${artist}. 
      
Please provide:
1. A brief overview of the song (2-3 sentences)
2. The song's genre and musical style
3. Any interesting facts or trivia about the song
4. The song's cultural impact or significance (if applicable)
5. Similar songs or artists that fans might enjoy

Keep the response engaging and informative, around 200-300 words total.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable music historian and critic. Provide accurate, engaging information about songs and artists.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('Successfully generated content');

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-song-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
