import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type DocumentCategory = Database['public']['Enums']['document_category'];

interface Document {
  id: string;
  title: string;
  code: string | null;
  status: string;
  description: string | null;
  file_path: string | null;
  file_name: string | null;
  version: string;
  author: string | null;
  created_at: string;
}

interface DocumentListProps {
  category: DocumentCategory;
  categoryLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshTrigger?: number;
}

const DocumentList = ({ category, categoryLabel, open, onOpenChange, refreshTrigger }: DocumentListProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const statusLabels: Record<string, string> = {
    draft: "Bozza",
    review: "In Revisione",
    approved: "Approvato",
    archived: "Archiviato",
  };

  const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    draft: "outline",
    review: "secondary",
    approved: "default",
    archived: "destructive",
  };

  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open, category, refreshTrigger]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i documenti",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = async (doc: Document) => {
    if (!doc.file_path) {
      toast({
        title: "Nessun File",
        description: "Questo documento non ha un file allegato",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Avviato",
        description: "Il file è stato scaricato con successo",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Errore",
        description: "Impossibile scaricare il file",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Sei sicuro di voler eliminare "${doc.title}"?`)) {
      return;
    }

    try {
      // Delete file from storage if exists
      if (doc.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.file_path]);

        if (storageError) {
          console.error('Error deleting file:', storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Documento Eliminato",
        description: "Il documento è stato eliminato con successo",
      });

      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il documento",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{categoryLabel}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun documento in questa categoria</p>
              <p className="text-sm mt-2">Carica il tuo primo documento per iniziare</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {doc.title}
                      </h4>
                      <Badge variant={statusVariants[doc.status]}>
                        {statusLabels[doc.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                      {doc.code && (
                        <>
                          <span className="font-mono">{doc.code}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>v{doc.version}</span>
                      {doc.author && (
                        <>
                          <span>•</span>
                          <span>{doc.author}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(doc.created_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.file_path && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadDocument(doc)}
                      title="Scarica file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteDocument(doc)}
                    title="Elimina documento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentList;
