import { Home, FolderOpen, Wand2, FileCheck, Settings, LogOut, User, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Libreria Documenti", url: "/documents", icon: FolderOpen },
  { title: "Genera Documenti", url: "/generate", icon: Wand2 },
  { title: "Analisi Conformità", url: "/analyze", icon: FileCheck },
  { title: "Impostazioni", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, isAdmin, signOut } = useAuth();

  const getUserInitials = () => {
    const email = user?.email || '';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar-background">
      <div className="p-4 border-b border-sidebar-border">
        {open ? (
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-sidebar-foreground p-2 shrink-0">
              <FileCheck className="h-5 w-5 text-sidebar-background" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sidebar-foreground truncate">QualityDoc</h2>
              <p className="text-xs text-sidebar-foreground/80 truncate">Gestione ISO</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="rounded-lg bg-sidebar-foreground p-2">
              <FileCheck className="h-5 w-5 text-sidebar-background" />
            </div>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel className="text-sidebar-foreground/80">Navigazione</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-foreground text-sidebar-background font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {open && (
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium truncate w-full">
                        {user?.email?.split('@')[0]}
                      </span>
                      {isAdmin && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    {isAdmin && (
                      <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Amministratore
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
