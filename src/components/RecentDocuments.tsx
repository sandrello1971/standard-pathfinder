import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical } from "lucide-react";

const RecentDocuments = () => {
  const documents = [
    {
      title: "Procedura di Controllo Qualità",
      code: "PQ-001-2024",
      category: "ISO 9001",
      status: "approved" as const,
      lastModified: "2 giorni fa",
      author: "Mario Rossi",
    },
    {
      title: "Manuale Gestione Non Conformità",
      code: "MN-045-2024",
      category: "Procedure Operative",
      status: "review" as const,
      lastModified: "5 giorni fa",
      author: "Laura Bianchi",
    },
    {
      title: "Modulo Azione Correttiva",
      code: "MOD-023-2024",
      category: "Moduli e Template",
      status: "draft" as const,
      lastModified: "1 settimana fa",
      author: "Giuseppe Verdi",
    },
    {
      title: "Report Audit Interno Q2 2024",
      code: "AUD-012-2024",
      category: "Audit e Verifiche",
      status: "approved" as const,
      lastModified: "2 settimane fa",
      author: "Anna Russo",
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "Approvato", variant: "default" as const };
      case "review":
        return { label: "In Revisione", variant: "secondary" as const };
      case "draft":
        return { label: "Bozza", variant: "outline" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Documenti Recenti</h2>
            <p className="text-muted-foreground">Ultimi documenti modificati o creati</p>
          </div>
          <Button>Tutti i Documenti</Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Attività Recente</CardTitle>
            <CardDescription>Documenti modificati negli ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc, index) => {
                const statusInfo = getStatusInfo(doc.status);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">
                            {doc.title}
                          </h4>
                          <Badge variant={statusInfo.variant} className="shrink-0">
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-mono">{doc.code}</span>
                          <span>•</span>
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{doc.author}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {doc.lastModified}
                      </span>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RecentDocuments;
