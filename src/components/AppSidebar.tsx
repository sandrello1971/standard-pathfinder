import { Home, FolderOpen, Wand2, FileCheck, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Libreria Documenti", url: "/documents", icon: FolderOpen },
  { title: "Genera Documenti", url: "/generate", icon: Wand2 },
  { title: "Analisi Conformità", url: "/analyze", icon: FileCheck },
  { title: "Impostazioni", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className={open ? "w-64" : "w-14"} collapsible="icon">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2">
            <FileCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          {open && (
            <div>
              <h2 className="font-bold text-foreground">QualityDoc</h2>
              <p className="text-xs text-muted-foreground">Gestione ISO</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted/50"
                      }
                      end={item.url === "/"}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
}
