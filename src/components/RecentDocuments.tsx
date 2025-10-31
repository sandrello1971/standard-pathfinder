import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const RecentDocuments = () => {
  const navigate = useNavigate();

  const { data: documents = [] } = useQuery({
    queryKey: ["recent-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
  });

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
          <Button onClick={() => navigate("/documents")}>Tutti i Documenti</Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Attività Recente</CardTitle>
            <CardDescription>Documenti modificati negli ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nessun documento ancora. Inizia caricando il primo documento.
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const statusInfo = getStatusInfo(doc.status);
                  return (
                    <div
                      key={doc.id}
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
                            {doc.author && (
                              <>
                                <span>•</span>
                                <span>{doc.author}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(doc.updated_at), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </span>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RecentDocuments;
