import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatsOverview = () => {
  const { data: documentsCount = 0 } = useQuery({
    queryKey: ["documents-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: reviewCount = 0 } = useQuery({
    queryKey: ["documents-review-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "review");
      return count || 0;
    },
  });

  const { data: draftCount = 0 } = useQuery({
    queryKey: ["documents-draft-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");
      return count || 0;
    },
  });

  const stats = [
    {
      title: "Documenti Totali",
      value: documentsCount.toString(),
      icon: FileText,
      description: "Documenti nel sistema",
      variant: "default" as const,
    },
    {
      title: "Documenti Approvati",
      value: (documentsCount - reviewCount - draftCount).toString(),
      icon: CheckCircle,
      description: "In linea con ISO 9001",
      variant: "success" as const,
    },
    {
      title: "In Revisione",
      value: reviewCount.toString(),
      icon: Clock,
      description: "Documenti pendenti",
      variant: "warning" as const,
    },
    {
      title: "Bozze",
      value: draftCount.toString(),
      icon: AlertCircle,
      description: "Da completare",
      variant: "destructive" as const,
    },
  ];

  const getIconColor = (variant: string) => {
    switch (variant) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "destructive":
        return "text-destructive";
      default:
        return "text-primary";
    }
  };

  const getBgColor = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-success/10";
      case "warning":
        return "bg-warning/10";
      case "destructive":
        return "bg-destructive/10";
      default:
        return "bg-primary/10";
    }
  };

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Panoramica</h2>
          <p className="text-muted-foreground">Monitora lo stato della tua documentazione ISO</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${getBgColor(stat.variant)}`}>
                    <Icon className={`h-5 w-5 ${getIconColor(stat.variant)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsOverview;
