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
    const { documentType, content, metadata } = await req.json();
    
    if (!content || !documentType) {
      return new Response(
        JSON.stringify({ error: 'Document type and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Sistema di prompt specializzati per tipo di documento
    const systemPrompts: Record<string, string> = {
      minutes: `Sei un assistente specializzato nella redazione di verbali e minute di riunioni secondo gli standard aziendali e ISO.
Devi trasformare appunti informali in documenti formali e strutturati.

Quando generi una minuta:
1. Usa una struttura professionale standard (intestazione, partecipanti, ordine del giorno, decisioni, azioni)
2. Mantieni un tono formale e obiettivo
3. Organizza i contenuti in modo logico e sequenziale
4. Evidenzia chiaramente le decisioni prese e le azioni da intraprendere
5. Includi una sezione "Azioni e Responsabili" con scadenze

Usa sempre il formato italiano e segui le best practice per la documentazione aziendale.`,

      procedure: `Sei un esperto nella redazione di procedure operative conformi agli standard ISO 9001:2015.
Le tue procedure devono essere chiare, applicabili e conformi ai requisiti normativi.

Quando generi una procedura:
1. Usa la struttura ISO standard: Scopo, Campo di Applicazione, Responsabilità, Descrizione Attività, Riferimenti, Allegati
2. Numera i punti e le sotto-attività in modo gerarchico
3. Usa un linguaggio imperativo e diretto (es. "Il responsabile deve...")
4. Includi punti di controllo e verifiche dove necessario
5. Specifica ruoli e responsabilità per ogni fase
6. Aggiungi riferimenti normativi pertinenti (clausole ISO)
7. Mantieni coerenza terminologica

La procedura deve essere operativa e facilmente implementabile.`,

      process: `Sei un esperto nella mappatura e documentazione di processi aziendali secondo la logica ISO 9001 e BPMN.
I tuoi documenti di processo devono rappresentare chiaramente il flusso di attività.

Quando documenti un processo:
1. Inizia con: Nome Processo, Obiettivo, Owner, Input, Output
2. Descrivi il flusso con: fasi principali, attività, decisioni, risorse necessarie
3. Identifica KPI e indicatori di performance
4. Specifica interfacce con altri processi
5. Indica rischi e opportunità del processo
6. Definisci criteri di monitoraggio e miglioramento
7. Usa diagrammi a blocchi testuali quando utile (es. "FASE 1 → Controllo → FASE 2")

Il documento deve essere strategico ma operativo, utile per analisi e miglioramento.`
    };

    const userPrompts: Record<string, string> = {
      minutes: `Genera una minuta professionale di riunione basandoti sui seguenti dati:

Tipo di riunione: ${metadata?.meetingType || 'Riunione generale'}
Data: ${metadata?.date || 'Data da definire'}
Partecipanti: ${metadata?.participants || 'Da specificare'}

Appunti/Contenuto:
${content}

Crea un verbale completo e formale che includa:
1. Intestazione con data, luogo, partecipanti
2. Ordine del giorno
3. Punti discussi (dettagliati)
4. Decisioni prese
5. Azioni da intraprendere con responsabili e scadenze
6. Prossimi passi`,

      procedure: `Genera una procedura operativa completa e conforme ISO 9001:2015 sulla base delle seguenti informazioni:

Titolo procedura: ${metadata?.title || 'Procedura'}
Codice documento: ${metadata?.code || 'PROC-XXX-2024'}
Area di applicazione: ${metadata?.area || 'Da definire'}

Descrizione/Requisiti:
${content}

Struttura la procedura con:
1. INTESTAZIONE (Titolo, Codice, Versione, Data, Approvazione)
2. SCOPO - Obiettivo della procedura
3. CAMPO DI APPLICAZIONE - Dove si applica
4. RESPONSABILITÀ - Chi fa cosa
5. DESCRIZIONE DELLE ATTIVITÀ - Dettaglio operativo step-by-step
6. DOCUMENTI DI RIFERIMENTO - Standard ISO, altre procedure
7. REGISTRAZIONI - Documenti da compilare
8. ALLEGATI - Form, checklist

Rendi la procedura operativa, chiara e conforme.`,

      process: `Genera un documento di processo aziendale completo sulla base delle seguenti informazioni:

Nome processo: ${metadata?.processName || 'Processo'}
Codice: ${metadata?.code || 'PROC-XXX'}
Owner: ${metadata?.owner || 'Da assegnare'}

Descrizione/Requisiti:
${content}

Struttura il documento con:
1. IDENTIFICAZIONE PROCESSO
   - Nome, Codice, Owner, Data
   
2. OBIETTIVO E FINALITÀ
   - Perché esiste questo processo
   
3. INPUT E OUTPUT
   - Cosa entra e cosa esce dal processo
   
4. FLUSSO DEL PROCESSO
   - Fasi principali con attività dettagliate
   - Decisioni e punti di controllo
   - Responsabilità per fase
   
5. RISORSE NECESSARIE
   - Personale, strumenti, documenti
   
6. INDICATORI DI PERFORMANCE (KPI)
   - Metriche per misurare efficacia
   
7. RISCHI E OPPORTUNITÀ
   - Cosa può andare storto, come migliorare
   
8. INTERFACCE
   - Collegamenti con altri processi
   
9. MODALITÀ DI MONITORAGGIO
   - Come verificare che funzioni

Rendi il documento strategico e operativo.`
    };

    const systemPrompt = systemPrompts[documentType] || systemPrompts.procedure;
    const userPrompt = userPrompts[documentType] || userPrompts.procedure;

    console.log(`Generating ${documentType} document via Lovable AI`);

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
    const generatedDocument = data.choices[0].message.content;

    console.log(`${documentType} document generated successfully`);

    return new Response(
      JSON.stringify({ document: generatedDocument }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-document function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
