
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, FileText, Plus, Building2, Crown } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Gerar Documento",
    url: "/generate",
    icon: FileText,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { workspaces, selectedWorkspace, setSelectedWorkspace } = useWorkspace();

  const handleWorkspaceSelect = (workspace: any) => {
    setSelectedWorkspace(workspace);
    // Navegar para o dashboard do workspace
    window.history.pushState({}, '', `/dashboard?workspace=${workspace.id}`);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <h1 className="text-lg font-bold text-sidebar-foreground">LexAI</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Meus Ambientes */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Meus Ambientes</SidebarGroupLabel>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/workspace">
                <Plus className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton 
                    onClick={() => handleWorkspaceSelect(workspace)}
                    isActive={selectedWorkspace?.id === workspace.id}
                    className="cursor-pointer"
                  >
                    <Building2 className={workspace.iconColor} />
                    <span>{workspace.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {workspaces.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/workspace" className="text-muted-foreground">
                      <Plus />
                      <span>Criar primeiro ambiente</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Criar Agente - só aparece se há workspace selecionado */}
        {selectedWorkspace && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/agents/create" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus />
                      <span>Criar Agente</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          © 2024 LexAI - Inteligência Jurídica
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
