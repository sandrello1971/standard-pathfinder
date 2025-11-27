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
    const { standard } = await req.json();
    
    if (!standard || typeof standard !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Standard è obbligatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY non configurata');
    }

    console.log('Searching for standard information:', standard);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di normative ISO. Fornisci informazioni precise, dettagliate e aggiornate sugli standard richiesti, includendo requisiti principali, struttura documentale e punti chiave per la conformità.'
          },
          {
            role: 'user',
            content: `Fornisci informazioni dettagliate sullo standard ${standard}:
- Scopo e ambito di applicazione
- Struttura del documento e sezioni principali
- Requisiti chiave per la conformità
- Elementi documentali richiesti
- Best practices per l'implementazione

Rispondi in italiano e in modo strutturato.`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'year',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite di richieste superato. Riprova tra qualche istante.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Chiave API Perplexity non valida. Verifica la configurazione.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Errore nel servizio di ricerca: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const standardInfo = data.choices[0].message.content;

    console.log('Standard information retrieved successfully');

    return new Response(
      JSON.stringify({ standardInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-standard function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
