import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, FileText, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateDocumentSchema } from "@/lib/validations";

const Generate = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [customType, setCustomType] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");

  // Metadata
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [standard, setStandard] = useState("ISO 9001:2015");

  const documentTypes = [
    { value: "procedure", label: "Procedura Operativa" },
    { value: "process", label: "Processo Aziendale" },
    { value: "minutes", label: "Minuta di Riunione" },
    { value: "manuale_qualita", label: "Manuale della Qualità" },
    { value: "istruzione_lavoro", label: "Istruzione di Lavoro" },
    { value: "modulistica", label: "Modulo/Form" },
    { value: "piano_audit", label: "Piano di Audit" },
    { value: "report_audit", label: "Report di Audit" },
    { value: "analisi_rischi", label: "Analisi dei Rischi" },
    { value: "piano_miglioramento", label: "Piano di Miglioramento" },
    { value: "gestione_nc", label: "Gestione Non Conformità" },
    { value: "azioni_correttive", label: "Azioni Correttive/Preventive" },
    { value: "custom", label: "Documento Personalizzato..." },
  ];

  const placeholders: Record<string, string> = {
    procedure: "Descrivi la procedura da documentare...\n\nEsempio:\nProcedura per la gestione delle non conformità:\n- Rilevazione NC\n- Analisi cause\n- Azioni correttive\n- Verifica efficacia",
    process: "Descrivi il processo da mappare...\n\nEsempio:\nProcesso di gestione ordini clienti:\nDa ricezione ordine fino a consegna e fatturazione.",
    minutes: "Inserisci gli appunti della riunione...\n\nEsempio:\n- Discusso budget Q2\n- Approvato nuovo fornitore",
    manuale_qualita: "Descrivi l'organizzazione e il sistema qualità dell'azienda...",
    istruzione_lavoro: "Descrivi le operazioni specifiche da eseguire step-by-step...",
    modulistica: "Descrivi i campi e le informazioni da raccogliere nel modulo...",
    piano_audit: "Descrivi l'ambito, obiettivi e programma dell'audit...",
    report_audit: "Inserisci i risultati e le evidenze dell'audit condotto...",
    analisi_rischi: "Elenca i processi/aree e i rischi potenziali da analizzare...",
    piano_miglioramento: "Descrivi le aree di miglioramento e gli obiettivi da raggiungere...",
    gestione_nc: "Descrivi il processo di identificazione e gestione delle non conformità...",
    azioni_correttive: "Descrivi la non conformità e le azioni correttive/preventive da implementare...",
    custom: "Descrivi il tipo di documento che vuoi generare e le sue caratteristiche...",
  };

  const generateDocument = async () => {
    // Validate input
    const validation = generateDocumentSchema.safeParse({
      documentType,
      customType: documentType === "custom" ? customType : "",
      title,
      code: code || "",
      standard: standard || "",
      content,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Errore",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: {
          documentType: documentType === "custom" ? validation.data.customType : validation.data.documentType,
          content: validation.data.content,
          metadata: {
            title: validation.data.title,
            code: validation.data.code,
            standard: validation.data.standard,
          },
        },
      });

      if (error) {
        throw error;
      }

      setResult(data.document);
      toast({
        title: "Documento Generato",
        description: "Il documento è stato generato con successo",
      });
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la generazione",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copiato!",
      description: "Documento copiato negli appunti",
    });
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Generatore Documenti ISO</h1>
        <p className="text-muted-foreground">
          Genera qualsiasi tipo di documento conforme agli standard ISO con l'intelligenza artificiale
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurazione Documento</CardTitle>
            <CardDescription>
              Seleziona il tipo e fornisci le informazioni necessarie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="docType">Tipo di Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="docType">
                  <SelectValue placeholder="Seleziona tipo documento" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {documentType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customType">Specifica Tipo Documento</Label>
                <Input
                  id="customType"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="es. Piano di Formazione, Registro Documentale..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Gestione Qualità"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Codice</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="es. PROC-001-2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="standard">Standard di Riferimento</Label>
              <Input
                id="standard"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                placeholder="es. ISO 9001:2015"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenuto/Requisiti</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholders[documentType] || "Descrivi il documento da generare..."}
                className="min-h-[300px]"
                maxLength={50000}
              />
            </div>

            <Button
              onClick={generateDocument}
              disabled={isGenerating || !documentType}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Genera Documento
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Documento Generato</span>
              {result && (
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copia
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Documento pronto per l'uso e la personalizzazione
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-[600px] overflow-y-auto">
                  {result}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Il documento generato apparirà qui</p>
                <p className="text-xs mt-2">
                  Compila i campi e clicca "Genera Documento"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Generate;
