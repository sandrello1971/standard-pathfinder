import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Impostazioni</h1>
        <p className="text-muted-foreground">
          Configura la piattaforma secondo le tue esigenze
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Impostazioni di Sistema
          </CardTitle>
          <CardDescription>
            Funzionalità di configurazione in arrivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <SettingsIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Questa sezione sarà disponibile a breve</p>
            <p className="text-sm mt-2">
              Potrai configurare standard predefiniti, template personalizzati e molto altro
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
