import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileCheck, Copy, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeComplianceSchema } from "@/lib/validations";

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

const Analyze = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentText, setDocumentText] = useState("");
  const [standard, setStandard] = useState("ISO 9001:2015");
  const [customStandard, setCustomStandard] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [isSearchingStandard, setIsSearchingStandard] = useState(false);
  const [standardInfo, setStandardInfo] = useState("");

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

  const analyzeCompliance = async () => {
    const finalStandard = standard === "custom" ? customStandard : standard;
    const enrichedText = standardInfo ? `${documentText}\n\nInformazioni standard di riferimento:\n${standardInfo}` : documentText;
    
    // Validate input
    const validation = analyzeComplianceSchema.safeParse({
      documentText: enrichedText,
      standard: finalStandard || "",
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

    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-compliance', {
        body: {
          documentText: validation.data.documentText,
          standard: validation.data.standard || "ISO 9001:2015",
        },
      });

      if (error) {
        throw error;
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
              <Label htmlFor="document">Testo del Documento</Label>
              <Textarea
                id="document"
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                maxLength={50000}
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
