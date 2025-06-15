
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
  },
  {
    title: "Criar Documento",
    url: "/generate",
    icon: FileText,
  }
];

const workItems = [
  {
    title: "Meus Modelos",
    url: "/agents",
    icon: Users,
  },
  {
    title: "Meu Escritório",
    url: "/workspace",
    icon: Building2,
  }
];

const systemItems = [
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Ajuda",
    url: "#",
    icon: HelpCircle,
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { selectedWorkspace, getAgentsForWorkspace, officialAgents } = useWorkspace();

  const workspaceAgents = selectedWorkspace ? getAgentsForWorkspace(selectedWorkspace.id) : [];
  const totalAgents = workspaceAgents.length;
  const favoriteAgents = [...officialAgents.slice(0, 1), ...workspaceAgents.slice(0, 1)];

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">LexAI</h2>
            <p className="text-xs text-gray-500">
              {selectedWorkspace ? selectedWorkspace.name : "Assistente jurídica"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {/* Principal */}
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

        {/* Trabalho */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700">Trabalho</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                      {item.url === "/agents" && totalAgents > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {totalAgents}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Modelos Frequentes */}
            {favoriteAgents.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs text-gray-500 px-3 mb-2">Acesso Rápido</p>
                {favoriteAgents.map((agent) => (
                  <Button
                    key={agent.id}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8 px-3"
                  >
                    <Link to={`/generate?agent=${agent.id}`} className="flex items-center gap-2">
                      <Crown className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{agent.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {/* Criar Novo Modelo */}
            <div className="mt-4">
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="w-full border-dashed"
              >
                <Link to="/agents/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Modelo
                </Link>
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sistema */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700">Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    {item.url === "#" ? (
                      <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </button>
                    ) : (
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    )}
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
