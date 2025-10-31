import { Button } from "@/components/ui/button";
import { FileCheck, Shield, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            Conformità ISO Semplificata
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Gestione Documentale ISO
            <span className="block text-primary mt-2">per le PMI</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Semplifica la gestione di processi, procedure e documentazione secondo gli standard ISO 9000. 
            Tutto in un'unica piattaforma intuitiva.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Scopri di Più
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-4">
                <FileCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Documenti Organizzati</h3>
              <p className="text-muted-foreground text-center">
                Gestisci tutta la documentazione ISO in modo strutturato e accessibile
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 p-6">
              <div className="rounded-full bg-success/10 p-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Conformità Garantita</h3>
              <p className="text-muted-foreground text-center">
                Rispetta gli standard ISO 9001 e altri requisiti normativi
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 p-6">
              <div className="rounded-full bg-warning/10 p-4">
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Efficienza Aumentata</h3>
              <p className="text-muted-foreground text-center">
                Riduci il tempo dedicato alla gestione documentale del 70%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
