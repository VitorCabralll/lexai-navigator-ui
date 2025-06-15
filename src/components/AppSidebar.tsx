
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  Building2, 
  HelpCircle,
  Plus,
  Crown,
  Sparkles
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
    description: "Sua página principal"
  },
  {
    title: "Criar Documento",
    url: "/generate",
    icon: FileText,
    description: "Fazer novos documentos"
  }
];

const manageItems = [
  {
    title: "Meus Modelos",
    url: "/agents",
    icon: Users,
    description: "Ver e gerenciar modelos inteligentes"
  },
  {
    title: "Meu Escritório",
    url: "/workspace",
    icon: Building2,
    description: "Gerenciar área de trabalho"
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
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">LexAI</h2>
            <p className="text-xs text-gray-500">Sua assistente jurídica</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {/* Workspace Info */}
        {selectedWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700">Escritório Atual</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="font-semibold text-blue-900 text-sm">{selectedWorkspace.name}</p>
                </div>
                <p className="text-xs text-blue-700">Seu ambiente de trabalho jurídico</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Create */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Criação Rápida
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs h-9 hover:bg-blue-50 hover:text-blue-700">
                <Link to="/generate?step=2&type=peticao">
                  <FileText className="mr-2 h-3 w-3" />
                  Nova Petição
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs h-9 hover:bg-green-50 hover:text-green-700">
                <Link to="/generate?step=2&type=parecer">
                  <FileText className="mr-2 h-3 w-3" />
                  Novo Parecer
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs h-9 hover:bg-purple-50 hover:text-purple-700">
                <Link to="/agents/create">
                  <Plus className="mr-2 h-3 w-3" />
                  Novo Modelo
                </Link>
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Modelos Favoritos */}
        {(officialAgents.length > 0 || workspaceAgents.length > 0) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700">⭐ Modelos Favoritos</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1">
                {officialAgents.slice(0, 2).map((agent) => (
                  <Button
                    key={agent.id}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-9 hover:bg-yellow-50"
                  >
                    <Link to={`/generate?step=3&agent=${agent.id}`}>
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
                    className="w-full justify-start text-xs h-9 hover:bg-blue-50"
                  >
                    <Link to={`/generate?step=3&agent=${agent.id}`}>
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
          <SidebarGroupLabel className="text-gray-700">Gerenciar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                      {item.url === "/agents" && workspaceAgents.length > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-800">
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
          <SidebarGroupLabel className="text-gray-700">Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 px-4 py-4">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs hover:bg-gray-50">
          <a href="#" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Precisa de ajuda?
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
