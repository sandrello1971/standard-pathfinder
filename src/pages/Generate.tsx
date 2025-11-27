import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, FileText, Copy, Search, Save, Edit, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateDocumentSchema } from "@/lib/validations";

const ISO_STANDARDS = [
  { value: "ISO 9001:2015", label: "ISO 9001:2015 - Sistema di Gestione Qualità" },
  { value: "ISO 14001:2015", label: "ISO 14001:2015 - Sistema di Gestione Ambientale" },
  { value: "ISO 45001:2018", label: "ISO 45001:2018 - Sistema di Gestione Salute e Sicurezza" },
  { value: "ISO 27001:2022", label: "ISO 27001:2022 - Sistema di Gestione Sicurezza Informazioni" },
  { value: "ISO 13485:2016", label: "ISO 13485:2016 - Dispositivi Medici" },
  { value: "ISO 22000:2018", label: "ISO 22000:2018 - Sicurezza Alimentare" },
  { value: "ISO 50001:2018", label: "ISO 50001:2018 - Sistema di Gestione Energia" },
  { value: "custom", label: "Altro standard..." },
];

const Generate = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [customType, setCustomType] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedResult, setEditedResult] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Metadata
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [standard, setStandard] = useState("ISO 9001:2015");
  const [customStandard, setCustomStandard] = useState("");
  const [isSearchingStandard, setIsSearchingStandard] = useState(false);
  const [standardInfo, setStandardInfo] = useState("");

  const generateDocumentCode = (std: string) => {
    const standardPrefixes: Record<string, string> = {
      "ISO 9001:2015": "QMS",
      "ISO 14001:2015": "EMS",
      "ISO 45001:2018": "HSE",
      "ISO 27001:2022": "ISM",
      "ISO 13485:2016": "MED",
      "ISO 22000:2018": "FSM",
      "ISO 50001:2018": "ENM",
    };

    const prefix = standardPrefixes[std] || "DOC";
    const timestamp = Date.now().toString().slice(-6);
    const year = new Date().getFullYear();
    
    return `${prefix}-${timestamp}-${year}`;
  };

  useEffect(() => {
    const finalStandard = standard === "custom" ? customStandard : standard;
    if (finalStandard && finalStandard !== "custom") {
      setCode(generateDocumentCode(finalStandard));
    }
  }, [standard, customStandard]);

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

  const searchStandard = async () => {
    const finalStandard = standard === "custom" ? customStandard : standard;
    if (!finalStandard) {
      toast({
        title: "Errore",
        description: "Seleziona o inserisci uno standard",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingStandard(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-standard', {
        body: { standard: finalStandard }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setStandardInfo(data.standardInfo);
      toast({
        title: "Informazioni recuperate",
        description: "Informazioni sullo standard recuperate con successo",
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore durante la ricerca dello standard",
        variant: "destructive",
      });
    } finally {
      setIsSearchingStandard(false);
    }
  };

  const generateDocument = async () => {
    const finalStandard = standard === "custom" ? customStandard : standard;
    const enrichedContent = standardInfo ? `${content}\n\nInformazioni standard di riferimento:\n${standardInfo}` : content;
    
    // Validate input
    const validation = generateDocumentSchema.safeParse({
      documentType,
      customType: documentType === "custom" ? customType : "",
      title,
      code: code || "",
      standard: finalStandard || "",
      content: enrichedContent,
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
      setEditedResult(data.document);
      setIsEditMode(false);
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
    const textToCopy = isEditMode ? editedResult : result;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copiato!",
      description: "Documento copiato negli appunti",
    });
  };

  const saveToLibrary = async () => {
    if (!title || !code) {
      toast({
        title: "Errore",
        description: "Titolo e codice sono obbligatori per salvare il documento",
        variant: "destructive",
      });
      return;
    }

    const finalStandard = standard === "custom" ? customStandard : standard;
    const documentToSave = isEditMode ? editedResult : result;

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per salvare documenti",
          variant: "destructive",
        });
        return;
      }

      // Map document type to category
      const categoryMap: Record<string, string> = {
        procedure: "procedure_operative",
        process: "procedure_operative",
        manuale_qualita: "iso_9001",
        istruzione_lavoro: "procedure_operative",
        modulistica: "moduli_template",
        piano_audit: "audit_verifiche",
        report_audit: "audit_verifiche",
        analisi_rischi: "iso_9001",
        piano_miglioramento: "iso_9001",
        gestione_nc: "iso_9001",
        azioni_correttive: "iso_9001",
        minutes: "procedure_operative",
      };

      const category = categoryMap[documentType] || "iso_9001";

      const { error } = await supabase.from("documents").insert({
        title,
        code: code || undefined,
        category: category as any,
        description: documentToSave.substring(0, 500),
        user_id: userData.user.id,
        status: "draft" as any,
        tags: finalStandard ? [finalStandard] : undefined,
      });

      if (error) throw error;

      toast({
        title: "Documento Salvato",
        description: "Il documento è stato salvato nella libreria",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante il salvataggio",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
              <Select value={standard} onValueChange={setStandard}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona uno standard" />
                </SelectTrigger>
                <SelectContent>
                  {ISO_STANDARDS.map((std) => (
                    <SelectItem key={std.value} value={std.value}>
                      {std.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {standard === "custom" && (
                <Input
                  placeholder="Inserisci standard personalizzato"
                  value={customStandard}
                  onChange={(e) => setCustomStandard(e.target.value)}
                  className="mt-2"
                />
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={searchStandard}
                disabled={isSearchingStandard || (!standard || (standard === "custom" && !customStandard))}
                className="w-full mt-2"
              >
                {isSearchingStandard ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ricerca in corso...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Cerca info standard con Perplexity
                  </>
                )}
              </Button>
              
              {standardInfo && (
                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                  <p className="font-semibold mb-1">Informazioni standard:</p>
                  <p className="text-muted-foreground line-clamp-3">{standardInfo.substring(0, 150)}...</p>
                </div>
              )}
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
              <div className="flex gap-2">
                {result && !isEditMode && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copia
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={saveToLibrary}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salva in Libreria
                    </Button>
                  </>
                )}
                {isEditMode && (
                  <>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copia
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => {
                        setResult(editedResult);
                        setIsEditMode(false);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Conferma
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={saveToLibrary}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salva in Libreria
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Documento pronto per l'uso e la personalizzazione
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              isEditMode ? (
                <Textarea
                  value={editedResult}
                  onChange={(e) => setEditedResult(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-[600px] overflow-y-auto">
                    {result}
                  </div>
                </div>
              )
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
