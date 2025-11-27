import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Edit, Save, X, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Document {
  id: string;
  title: string;
  code: string;
  category: string;
  status: string;
  version: string;
  content: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setDocument(data);
      // Se content è vuoto ma c'è description, usa quella
      const initialContent = data.content || data.description || "";
      setEditedContent(initialContent);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore nel caricamento del documento",
        variant: "destructive",
      });
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ content: editedContent })
        .eq('id', document.id);

      if (error) throw error;

      setDocument({ ...document, content: editedContent });
      setIsEditing(false);
      
      toast({
        title: "Documento salvato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore nel salvataggio del documento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      iso_9001: "ISO 9001",
      procedure_operative: "Procedure Operative",
      moduli_template: "Moduli e Template",
      audit_verifiche: "Audit e Verifiche",
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Bozza",
      review: "In Revisione",
      approved: "Approvato",
      archived: "Archiviato",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-yellow-500",
      review: "bg-blue-500",
      approved: "bg-green-500",
      archived: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Documento non trovato</h1>
          <Button onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla libreria
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/documents')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Torna alla libreria
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{document.title}</CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline">{document.code}</Badge>
                  <Badge variant="outline">v{document.version}</Badge>
                  <Badge className={getStatusColor(document.status)}>
                    {getStatusLabel(document.status)}
                  </Badge>
                  <Badge variant="secondary">{getCategoryLabel(document.category)}</Badge>
                </div>
                {document.tags && document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(document.content || "");
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annulla
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salva
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Visualizza</TabsTrigger>
              <TabsTrigger value="info">Informazioni</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="mt-4">
              {isEditing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Inserisci il contenuto del documento..."
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  {!document.content && !document.description ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">Questo documento non ha ancora contenuto</p>
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Aggiungi Contenuto
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-muted p-6 rounded-lg whitespace-pre-wrap text-sm overflow-y-auto">
                      {document.content || document.description}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="info" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Descrizione</h3>
                  <p className="text-sm text-muted-foreground">
                    {document.description || "Nessuna descrizione"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Data Creazione</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(document.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Ultimo Aggiornamento</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(document.updated_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentDetail;
