import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Users, Building } from "lucide-react";
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Impostazioni</h1>
        <p className="text-muted-foreground">
          Configura la piattaforma secondo le tue esigenze
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Generali
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Gestione Utenti
            </TabsTrigger>
          )}
          <TabsTrigger value="organization">
            <Building className="h-4 w-4 mr-2" />
            Organizzazione
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Impostazioni Generali
              </CardTitle>
              <CardDescription>
                Configurazioni di base della piattaforma
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
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestione Utenti
                </CardTitle>
                <CardDescription>
                  Gestisci gli utenti e i loro ruoli nella piattaforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informazioni Organizzazione
              </CardTitle>
              <CardDescription>
                Dati aziendali e configurazione certificazioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Questa sezione sarà disponibile a breve</p>
                <p className="text-sm mt-2">
                  Potrai configurare i dati aziendali e gli standard ISO applicabili
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
