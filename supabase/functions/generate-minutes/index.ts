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
    const { notes, meetingType, participants, date } = await req.json();
    
    if (!notes) {
      return new Response(
        JSON.stringify({ error: 'Meeting notes are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Sei un assistente specializzato nella redazione di verbali e minute di riunioni secondo gli standard aziendali e ISO.
Devi trasformare appunti informali in documenti formali e strutturati.

Quando generi una minuta:
1. Usa una struttura professionale standard (intestazione, partecipanti, ordine del giorno, decisioni, azioni)
2. Mantieni un tono formale e obiettivo
3. Organizza i contenuti in modo logico e sequenziale
4. Evidenzia chiaramente le decisioni prese e le azioni da intraprendere
5. Includi una sezione "Azioni e Responsabili" con scadenze

Usa sempre il formato italiano e segui le best practice per la documentazione aziendale.`;

    const userPrompt = `Genera una minuta professionale di riunione basandoti sui seguenti appunti:

Tipo di riunione: ${meetingType || 'Riunione generale'}
Data: ${date || 'Data da definire'}
Partecipanti: ${participants || 'Da specificare'}

Appunti:
${notes}

Crea un verbale completo e formale che includa:
1. Intestazione con data, luogo, partecipanti
2. Ordine del giorno
3. Punti discussi (dettagliati)
4. Decisioni prese
5. Azioni da intraprendere con responsabili e scadenze
6. Prossimi passi`;

    console.log('Sending request to Lovable AI for minutes generation');

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
    const minutes = data.choices[0].message.content;

    console.log('Minutes generation completed successfully');

    return new Response(
      JSON.stringify({ minutes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-minutes function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
