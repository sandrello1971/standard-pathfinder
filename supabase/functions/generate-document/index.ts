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

Il documento deve essere strategico ma operativo, utile per analisi e miglioramento.`,

      manuale_qualita: `Sei un esperto nella redazione di Manuali della Qualità conformi ISO 9001:2015.
Il Manuale deve descrivere l'organizzazione e il sistema di gestione qualità dell'azienda.

Quando generi un Manuale della Qualità:
1. Struttura: Presentazione azienda, Politica Qualità, Organizzazione, Processi, Responsabilità
2. Includi riferimenti a tutti i requisiti ISO 9001 applicabili
3. Descrivi l'approccio per processi adottato
4. Definisci l'organigramma e le responsabilità
5. Fai riferimento alle procedure documentate
6. Mantieni un linguaggio formale ma chiaro

Il Manuale deve essere completo e conforme.`,

      istruzione_lavoro: `Sei un esperto nella redazione di Istruzioni di Lavoro operative e dettagliate.

Quando generi un'istruzione di lavoro:
1. Titolo chiaro e codifica univoca
2. Scopo e campo di applicazione
3. Elenco step-by-step numerato delle operazioni
4. Specifiche tecniche precise (parametri, tolleranze)
5. Equipaggiamenti e materiali necessari
6. Controlli di qualità durante/dopo l'esecuzione
7. Criteri di accettabilità

L'istruzione deve essere estremamente pratica e facilmente seguibile.`,

      modulistica: `Sei un esperto nella creazione di moduli e form aziendali conformi ISO.

Quando generi un modulo:
1. Intestazione con logo, titolo modulo, codice documento
2. Sezioni logiche ben separate
3. Campi chiari con etichette descrittive
4. Spazi adeguati per compilazione
5. Sezione firme e approvazioni
6. Numero revisione e data
7. Istruzioni di compilazione se necessarie

Il modulo deve essere pratico e user-friendly.`,

      piano_audit: `Sei un esperto nella pianificazione di audit interni ISO.

Quando generi un Piano di Audit:
1. Obiettivi e ambito dell'audit
2. Criteri di audit (standard, procedure)
3. Team audit (auditor, responsabili)
4. Programma dettagliato (date, orari, aree)
5. Risorse necessarie
6. Metodi di audit
7. Distribuzione del rapporto

Il piano deve essere completo e realizzabile.`,

      report_audit: `Sei un esperto nella redazione di Report di Audit conformi ISO.

Quando generi un Report di Audit:
1. Intestazione (data, auditor, area auditata)
2. Obiettivi e ambito
3. Sintesi esecutiva
4. Metodologia utilizzata
5. Evidenze raccolte (conformità e non conformità)
6. Classificazione delle NC (maggiori, minori, osservazioni)
7. Raccomandazioni e azioni correttive
8. Conclusioni

Il report deve essere oggettivo e documentato.`,

      analisi_rischi: `Sei un esperto nell'analisi e gestione dei rischi secondo ISO 9001.

Quando generi un'Analisi dei Rischi:
1. Identificazione processi/aree analizzate
2. Lista rischi potenziali per ogni area
3. Valutazione probabilità e impatto
4. Matrice di rischio
5. Prioritizzazione rischi
6. Azioni di mitigazione proposte
7. Responsabili e tempistiche
8. Monitoraggio e riesame

L'analisi deve essere strutturata e quantificata.`,

      piano_miglioramento: `Sei un esperto nella definizione di Piani di Miglioramento continuo.

Quando generi un Piano di Miglioramento:
1. Situazione attuale (baseline)
2. Obiettivi SMART di miglioramento
3. Aree di intervento identificate
4. Azioni specifiche con tempi e responsabili
5. Risorse necessarie
6. Indicatori di performance (KPI)
7. Modalità di monitoraggio
8. Revisione e aggiornamento

Il piano deve essere concreto e misurabile.`,

      gestione_nc: `Sei un esperto nella gestione delle Non Conformità secondo ISO.

Quando generi un documento di Gestione NC:
1. Sistema di rilevazione e segnalazione
2. Classificazione NC (prodotto, processo, sistema)
3. Processo di analisi cause (5 Why, Ishikawa)
4. Definizione azioni correttive/preventive
5. Responsabilità nella gestione
6. Tempistiche di risoluzione
7. Verifica efficacia azioni
8. Registrazione e archiviazione

Il processo deve essere chiaro e tracciabile.`,

      azioni_correttive: `Sei un esperto nella definizione di Azioni Correttive e Preventive.

Quando generi un documento CAPA:
1. Descrizione dettagliata della NC o problema
2. Analisi delle cause radice
3. Azioni correttive immediate (contenimento)
4. Azioni correttive permanenti
5. Azioni preventive per evitare ripetizioni
6. Responsabili e scadenze
7. Verifica dell'efficacia implementata
8. Follow-up e chiusura

Il documento deve essere analitico e orientato alla soluzione.`
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
Standard: ${metadata?.standard || 'ISO 9001:2015'}

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

Nome processo: ${metadata?.processName || metadata?.title || 'Processo'}
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

    // Prompt universale per tipi non specificati o custom
    const defaultUserPrompt = `Genera un documento professionale di tipo "${documentType}" conforme allo standard ${metadata?.standard || 'ISO 9001:2015'}.

Titolo: ${metadata?.title || documentType}
Codice: ${metadata?.code || 'DOC-XXX-2024'}

Contenuto/Requisiti:
${content}

Struttura il documento in modo professionale, completo e conforme agli standard ISO, includendo tutte le sezioni necessarie per questo tipo di documento.`;

    const systemPrompt = systemPrompts[documentType] || systemPrompts.procedure;
    const userPrompt = userPrompts[documentType] || defaultUserPrompt;

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
