
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  Building2, 
  HelpCircle,
  Plus,
  Crown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  {
    title: "Início",
    url: "/dashboard",
    icon: Home,
    description: "Página principal"
  },
  {
    title: "Criar Documento",
    url: "/generate",
    icon: FileText,
    description: "Gerar novos documentos"
  }
];

const manageItems = [
  {
    title: "Meus Assistentes",
    url: "/agents",
    icon: Users,
    description: "Ver e gerenciar assistentes"
  },
  {
    title: "Minhas Áreas",
    url: "/workspace",
    icon: Building2,
    description: "Gerenciar ambientes de trabalho"
  }
];

const configItems = [
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    description: "Preferências e configurações"
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { selectedWorkspace, getAgentsForWorkspace, officialAgents } = useWorkspace();

  const workspaceAgents = selectedWorkspace ? getAgentsForWorkspace(selectedWorkspace.id) : [];

  return (
    <Sidebar className="bg-white border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">LexAI</h2>
            <p className="text-xs text-muted-foreground">Inteligência Jurídica</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {/* Workspace Info */}
        {selectedWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel>Área Atual</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900 text-sm">{selectedWorkspace.name}</p>
                <p className="text-xs text-blue-700">{selectedWorkspace.description}</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Create */}
        <SidebarGroup>
          <SidebarGroupLabel>Criar Rápido</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
                <Link to="/generate?type=peticao">
                  <FileText className="mr-2 h-3 w-3" />
                  Nova Petição
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
                <Link to="/generate?type=parecer">
                  <FileText className="mr-2 h-3 w-3" />
                  Novo Parecer
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
                <Link to="/agents/create">
                  <Plus className="mr-2 h-3 w-3" />
                  Novo Assistente
                </Link>
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Assistentes Rápidos */}
        {(officialAgents.length > 0 || workspaceAgents.length > 0) && (
          <SidebarGroup>
            <SidebarGroupLabel>Assistentes Favoritos</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1">
                {officialAgents.slice(0, 2).map((agent) => (
                  <Button
                    key={agent.id}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <Link to={`/generate?agent=${agent.id}`}>
                      <Crown className="mr-2 h-3 w-3 text-yellow-500" />
                      <span className="truncate">{agent.name}</span>
                    </Link>
                  </Button>
                ))}
                {workspaceAgents.slice(0, 2).map((agent) => (
                  <Button
                    key={agent.id}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <Link to={`/generate?agent=${agent.id}`}>
                      <Users className="mr-2 h-3 w-3 text-blue-500" />
                      <span className="truncate">{agent.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.url === "/agents" && workspaceAgents.length > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {workspaceAgents.length}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuration */}
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs">
          <a href="#" className="flex items-center gap-2">
            <HelpCircle className="h-3 w-3" />
            Ajuda e Suporte
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
