import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Wand2 } from "lucide-react";

type DocumentType = "minutes" | "procedure" | "process";

const DocumentGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>("procedure");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");

  // Metadata comuni
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  
  // Metadata per minute
  const [meetingType, setMeetingType] = useState("");
  const [participants, setParticipants] = useState("");
  const [date, setDate] = useState("");
  
  // Metadata per procedure
  const [area, setArea] = useState("");
  
  // Metadata per processi
  const [processName, setProcessName] = useState("");
  const [owner, setOwner] = useState("");

  const documentTypeLabels: Record<DocumentType, string> = {
    minutes: "Minuta di Riunione",
    procedure: "Procedura Operativa",
    process: "Documentazione Processo"
  };

  const documentTypeDescriptions: Record<DocumentType, string> = {
    minutes: "Trasforma appunti informali in verbali professionali",
    procedure: "Genera procedure operative conformi ISO 9001:2015",
    process: "Crea documentazione completa di processi aziendali"
  };

  const placeholders: Record<DocumentType, string> = {
    minutes: "Inserisci gli appunti della riunione in forma libera...\n\nEsempio:\n- Discusso budget Q2\n- Approvato nuovo fornitore\n- Assegnato progetto X a Mario",
    procedure: "Descrivi la procedura da documentare...\n\nEsempio:\nProcedura per la gestione delle non conformità:\n- Rilevazione NC\n- Analisi cause\n- Azioni correttive\n- Verifica efficacia",
    process: "Descrivi il processo da mappare...\n\nEsempio:\nProcesso di gestione ordini clienti:\nDa ricezione ordine fino a consegna e fatturazione.\nInclude verifica disponibilità, approvazione credito, spedizione."
  };

  const generateDocument = async () => {
    if (!content.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il contenuto del documento da generare",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResult("");

    try {
      const metadata: Record<string, string> = {};
      
      if (documentType === "minutes") {
        metadata.meetingType = meetingType;
        metadata.participants = participants;
        metadata.date = date;
      } else if (documentType === "procedure") {
        metadata.title = title;
        metadata.code = code;
        metadata.area = area;
      } else if (documentType === "process") {
        metadata.processName = processName;
        metadata.code = code;
        metadata.owner = owner;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            documentType,
            content,
            metadata,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la generazione");
      }

      setResult(data.document);
      toast({
        title: "Documento Generato",
        description: `${documentTypeLabels[documentType]} generato con successo`,
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

  const resetForm = () => {
    setContent("");
    setResult("");
    setTitle("");
    setCode("");
    setMeetingType("");
    setParticipants("");
    setDate("");
    setArea("");
    setProcessName("");
    setOwner("");
  };

  return (
    <section className="py-12 px-4 bg-muted">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Wand2 className="h-4 w-4" />
            Generazione Documenti AI
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Generatore Universale di Documenti
          </h2>
          <p className="text-muted-foreground">
            Crea minute, procedure e processi conformi agli standard ISO
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Documento</CardTitle>
              <CardDescription>
                Seleziona il tipo e inserisci le informazioni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Tipo di Documento</Label>
                <Select value={documentType} onValueChange={(value) => {
                  setDocumentType(value as DocumentType);
                  resetForm();
                }}>
                  <SelectTrigger id="docType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Minuta di Riunione
                      </div>
                    </SelectItem>
                    <SelectItem value="procedure">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Procedura Operativa ISO
                      </div>
                    </SelectItem>
                    <SelectItem value="process">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Processo Aziendale
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {documentTypeDescriptions[documentType]}
                </p>
              </div>

              {/* Metadata specifici per tipo */}
              {documentType === "minutes" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetingType">Tipo Riunione</Label>
                      <Input
                        id="meetingType"
                        value={meetingType}
                        onChange={(e) => setMeetingType(e.target.value)}
                        placeholder="es. Riesame Direzione"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participants">Partecipanti</Label>
                    <Input
                      id="participants"
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      placeholder="es. Mario Rossi, Laura Bianchi"
                    />
                  </div>
                </>
              )}

              {documentType === "procedure" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titolo Procedura</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="es. Gestione Non Conformità"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Codice Documento</Label>
                      <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="es. PROC-001-2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area Applicazione</Label>
                      <Input
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="es. Qualità"
                      />
                    </div>
                  </div>
                </>
              )}

              {documentType === "process" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="processName">Nome Processo</Label>
                    <Input
                      id="processName"
                      value={processName}
                      onChange={(e) => setProcessName(e.target.value)}
                      placeholder="es. Gestione Ordini Clienti"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="procCode">Codice</Label>
                      <Input
                        id="procCode"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="es. PROC-ORD-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Process Owner</Label>
                      <Input
                        id="owner"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        placeholder="es. Responsabile Vendite"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">
                  {documentType === "minutes" ? "Appunti" : "Descrizione/Requisiti"}
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={placeholders[documentType]}
                  className="min-h-[250px]"
                />
              </div>

              <Button
                onClick={generateDocument}
                disabled={isGenerating}
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
                    Genera {documentTypeLabels[documentType]}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documento Generato</CardTitle>
              <CardDescription>
                {documentTypeLabels[documentType]} pronto per l'uso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-[600px] overflow-y-auto">
                    {result}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      toast({
                        title: "Copiato!",
                        description: "Documento copiato negli appunti",
                      });
                    }}
                  >
                    Copia negli Appunti
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Il documento apparirà qui</p>
                  <p className="text-xs mt-2">Seleziona il tipo e compila i campi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DocumentGenerator;
