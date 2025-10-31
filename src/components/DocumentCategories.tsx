import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, ArrowRight } from "lucide-react";

const DocumentCategories = () => {
  const categories = [
    {
      title: "ISO 9001:2015",
      description: "Sistema di Gestione per la Qualità",
      documentCount: 45,
      compliance: 96,
      color: "primary" as const,
    },
    {
      title: "Procedure Operative",
      description: "Istruzioni operative e linee guida",
      documentCount: 38,
      compliance: 92,
      color: "success" as const,
    },
    {
      title: "Moduli e Template",
      description: "Form e modelli standardizzati",
      documentCount: 28,
      compliance: 98,
      color: "warning" as const,
    },
    {
      title: "Audit e Verifiche",
      description: "Report di audit e verifiche interne",
      documentCount: 16,
      compliance: 88,
      color: "destructive" as const,
    },
  ];

  const getBadgeVariant = (compliance: number) => {
    if (compliance >= 95) return "default";
    if (compliance >= 85) return "secondary";
    return "destructive";
  };

  return (
    <section className="py-12 px-4 bg-muted">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Categorie Documenti</h2>
          <p className="text-muted-foreground">
            Esplora i documenti organizzati per standard e tipologia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
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
                        {category.documentCount}
                      </span>
                      <span className="text-sm text-muted-foreground">documenti</span>
                    </div>
                    <Badge variant={getBadgeVariant(category.compliance)}>
                      {category.compliance}% conforme
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    Apri
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentCategories;
