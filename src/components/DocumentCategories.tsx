import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, ArrowRight } from "lucide-react";
import DocumentList from "./DocumentList";
import DocumentUpload from "./DocumentUpload";
import type { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type DocumentCategory = Database['public']['Enums']['document_category'];

const DocumentCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Query per contare i documenti per categoria
  const { data: documentCounts = {} } = useQuery({
    queryKey: ["document-counts", refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("category");
      
      if (error) throw error;
      
      // Conta i documenti per categoria
      const counts: Record<DocumentCategory, number> = {
        iso_9001: 0,
        procedure_operative: 0,
        moduli_template: 0,
        audit_verifiche: 0,
      };
      
      data?.forEach((doc) => {
        if (doc.category in counts) {
          counts[doc.category as DocumentCategory]++;
        }
      });
      
      return counts;
    },
  });

  const categories: Array<{
    title: string;
    description: string;
    color: "primary" | "success" | "warning" | "destructive";
    category: DocumentCategory;
  }> = [
    {
      title: "ISO 9001:2015",
      description: "Sistema di Gestione per la Qualità",
      color: "primary" as const,
      category: "iso_9001",
    },
    {
      title: "Procedure Operative",
      description: "Istruzioni operative e linee guida",
      color: "success" as const,
      category: "procedure_operative",
    },
    {
      title: "Moduli e Template",
      description: "Form e modelli standardizzati",
      color: "warning" as const,
      category: "moduli_template",
    },
    {
      title: "Audit e Verifiche",
      description: "Report di audit e verifiche interne",
      color: "destructive" as const,
      category: "audit_verifiche",
    },
  ];

  const openCategory = (category: DocumentCategory, label: string) => {
    setSelectedCategory(category);
    setSelectedLabel(label);
  };

  return (
    <section className="py-12 px-4 bg-muted">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Categorie Documenti</h2>
            <p className="text-muted-foreground">
              Esplora i documenti organizzati per standard e tipologia
            </p>
          </div>
          <DocumentUpload onUploadSuccess={() => setRefreshTrigger(prev => prev + 1)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => {
            const count = documentCounts[category.category] || 0;
            return (
              <Card key={index} className="border-border hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-3 bg-${category.color}/10`}>
                        <FolderOpen className={`h-6 w-6 text-${category.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="mt-1">{category.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {count}
                        </span>
                        <span className="text-sm text-muted-foreground">documenti</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => openCategory(category.category, category.title)}
                    >
                      Apri
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedCategory && (
          <DocumentList
            category={selectedCategory}
            categoryLabel={selectedLabel}
            open={!!selectedCategory}
            onOpenChange={(open) => !open && setSelectedCategory(null)}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </section>
  );
};

export default DocumentCategories;
