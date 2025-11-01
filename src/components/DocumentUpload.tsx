import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { documentUploadSchema } from "@/lib/validations";

type DocumentCategory = Database['public']['Enums']['document_category'];
type DocumentStatus = Database['public']['Enums']['document_status'];

interface DocumentUploadProps {
  onUploadSuccess?: () => void;
}

const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<DocumentCategory | "">("");
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [version, setVersion] = useState("1.0");
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    setTitle("");
    setCode("");
    setCategory("");
    setStatus("draft");
    setDescription("");
    setAuthor("");
    setVersion("1.0");
    setFile(null);
  };

  const handleUpload = async () => {
    // Validate input
    const validation = documentUploadSchema.safeParse({
      title,
      code: code || "",
      description: description || "",
      author: author || "",
      version: version || "",
      category,
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

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Devi essere autenticato per caricare documenti");
      }

      let filePath = null;
      let fileName = null;
      let fileSize = null;

      // Upload file se presente
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileNameWithoutExt = file.name.replace(`.${fileExt}`, '');
        fileName = `${fileNameWithoutExt}-${Date.now()}.${fileExt}`;
        filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        fileSize = file.size;
      }

      // Salva metadata nel database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title: validation.data.title,
          code: validation.data.code || null,
          category: validation.data.category as DocumentCategory,
          status,
          description: validation.data.description || null,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          version: validation.data.version || "1.0",
          author: validation.data.author || null,
          user_id: user.id,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Documento Caricato",
        description: "Il documento è stato caricato con successo",
      });

      resetForm();
      setOpen(false);
      onUploadSuccess?.();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante il caricamento",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Carica Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carica Nuovo Documento</DialogTitle>
          <DialogDescription>
            Aggiungi un documento alla tua libreria documentale ISO
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. Procedura Gestione Qualità"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Codice Documento</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="es. PROC-001-2024"
                maxLength={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as DocumentCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iso_9001">ISO 9001:2015</SelectItem>
                  <SelectItem value="procedure_operative">Procedure Operative</SelectItem>
                  <SelectItem value="moduli_template">Moduli e Template</SelectItem>
                  <SelectItem value="audit_verifiche">Audit e Verifiche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as DocumentStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bozza</SelectItem>
                  <SelectItem value="review">In Revisione</SelectItem>
                  <SelectItem value="approved">Approvato</SelectItem>
                  <SelectItem value="archived">Archiviato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Autore</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="es. Mario Rossi"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versione</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="es. 1.0"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione opzionale del documento..."
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File (opzionale)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Formati supportati: PDF, Word, Excel, TXT
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              "Carica Documento"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUpload;
