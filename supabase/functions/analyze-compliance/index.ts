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
    const { documentText, standard } = await req.json();
    
    if (!documentText) {
      return new Response(
        JSON.stringify({ error: 'Document text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Sei un esperto di conformità ISO e standard di qualità per le PMI italiane. 
Il tuo compito è analizzare documenti, procedure e processi per verificarne la conformità agli standard richiesti (principalmente ISO 9001:2015).

Quando analizzi un documento:
1. Identifica chiaramente quali requisiti dello standard sono rispettati
2. Evidenzia le non conformità o le aree di miglioramento
3. Fornisci suggerimenti specifici e pratici per raggiungere la conformità
4. Usa un linguaggio professionale ma accessibile

Rispondi sempre in italiano e struttura la tua risposta in modo chiaro con sezioni separate.`;

    const userPrompt = `Analizza il seguente documento per verificarne la conformità allo standard ${standard || 'ISO 9001:2015'}:

${documentText}

Fornisci un'analisi dettagliata che includa:
1. Punti di conformità (cosa è già corretto)
2. Non conformità o aree critiche
3. Suggerimenti specifici per migliorare
4. Versione corretta del documento (se necessario)`;

    console.log('Sending request to Lovable AI for compliance analysis');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite di richieste superato. Riprova tra qualche istante.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crediti esauriti. Aggiungi crediti al workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Errore nel servizio AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Compliance analysis completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-compliance function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
