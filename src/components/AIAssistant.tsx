import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileCheck, FileText, Sparkles } from "lucide-react";

const AIAssistant = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compliance Analysis State
  const [documentText, setDocumentText] = useState("");
  const [standard, setStandard] = useState("ISO 9001:2015");
  const [analysisResult, setAnalysisResult] = useState("");

  // Minutes Generation State
  const [meetingNotes, setMeetingNotes] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [participants, setParticipants] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [minutesResult, setMinutesResult] = useState("");

  const analyzeCompliance = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il testo del documento da analizzare",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-compliance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            documentText,
            standard,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante l'analisi");
      }

      setAnalysisResult(data.analysis);
      toast({
        title: "Analisi Completata",
        description: "L'analisi di conformità è stata completata con successo",
      });
    } catch (error) {
      console.error("Error analyzing compliance:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante l'analisi",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMinutes = async () => {
    if (!meetingNotes.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci gli appunti della riunione",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setMinutesResult("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-minutes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            notes: meetingNotes,
            meetingType,
            participants,
            date: meetingDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la generazione");
      }

      setMinutesResult(data.minutes);
      toast({
        title: "Minuta Generata",
        description: "La minuta di riunione è stata generata con successo",
      });
    } catch (error) {
      console.error("Error generating minutes:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la generazione",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Assistente AI Powered
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Assistente Documentale Intelligente
          </h2>
          <p className="text-muted-foreground">
            Sfrutta l'AI per verificare conformità e generare documentazione professionale
          </p>
        </div>

        <Tabs defaultValue="compliance" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="compliance" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Analisi Conformità
            </TabsTrigger>
            <TabsTrigger value="minutes" className="gap-2">
              <FileText className="h-4 w-4" />
              Genera Minute
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compliance">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Documento da Analizzare</CardTitle>
                  <CardDescription>
                    Incolla il testo della procedura o del processo da verificare
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="document">Testo del Documento</Label>
                    <Textarea
                      id="document"
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Incolla qui il testo della procedura da analizzare..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={analyzeCompliance}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisi in corso...
                      </>
                    ) : (
                      "Analizza Conformità"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risultato Analisi</CardTitle>
                  <CardDescription>
                    Verifica di conformità e suggerimenti per migliorare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                        {analysisResult}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>L'analisi apparirà qui</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="minutes">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Riunione</CardTitle>
                  <CardDescription>
                    Inserisci i dettagli e gli appunti della riunione
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <Label htmlFor="meetingDate">Data</Label>
                      <Input
                        id="meetingDate"
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participants">Partecipanti</Label>
                    <Input
                      id="participants"
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      placeholder="es. Mario Rossi, Laura Bianchi, Giuseppe Verdi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Appunti della Riunione</Label>
                    <Textarea
                      id="notes"
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      placeholder="Inserisci gli appunti della riunione in forma libera..."
                      className="min-h-[250px]"
                    />
                  </div>
                  <Button
                    onClick={generateMinutes}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generazione in corso...
                      </>
                    ) : (
                      "Genera Minuta"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Minuta Generata</CardTitle>
                  <CardDescription>
                    Verbale professionale pronto per l'uso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {minutesResult ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                        {minutesResult}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>La minuta apparirà qui</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default AIAssistant;
