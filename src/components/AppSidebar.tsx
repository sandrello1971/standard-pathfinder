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
    <Sidebar collapsible="icon" className="border-r bg-sidebar-background">
      <div className="p-4 border-b border-sidebar-border">
        {open ? (
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2 shrink-0">
              <FileCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sidebar-foreground truncate">QualityDoc</h2>
              <p className="text-xs text-sidebar-foreground/70 truncate">Gestione ISO</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="rounded-lg bg-primary p-2">
              <FileCheck className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel className="text-sidebar-foreground/70">Navigazione</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }
                      end={item.url === "/"}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
