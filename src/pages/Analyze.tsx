import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileCheck, Copy } from "lucide-react";

const Analyze = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentText, setDocumentText] = useState("");
  const [standard, setStandard] = useState("ISO 9001:2015");
  const [analysisResult, setAnalysisResult] = useState("");

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysisResult);
    toast({
      title: "Copiato!",
      description: "Analisi copiata negli appunti",
    });
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analisi Conformità</h1>
        <p className="text-muted-foreground">
          Verifica la conformità dei tuoi documenti agli standard ISO e ricevi suggerimenti per migliorarli
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                placeholder="Incolla qui il testo della procedura da analizzare...

Esempio:
PROCEDURA GESTIONE NON CONFORMITÀ

1. SCOPO
Definire le modalità per identificare, registrare e gestire le non conformità.

2. CAMPO DI APPLICAZIONE
Si applica a tutte le non conformità rilevate.

3. RESPONSABILITÀ
- Responsabile Qualità: gestione NC
- Addetti produzione: segnalazione NC
..."
                className="min-h-[400px] font-mono text-sm"
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
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Analizza Conformità
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Risultato Analisi</span>
              {analysisResult && (
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copia
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Verifica di conformità e suggerimenti per migliorare
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisResult ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-[600px] overflow-y-auto">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>L'analisi apparirà qui</p>
                <p className="text-xs mt-2">
                  Incolla il documento e clicca "Analizza Conformità"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analyze;
