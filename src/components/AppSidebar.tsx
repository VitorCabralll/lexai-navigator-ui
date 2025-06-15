
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
import { LayoutDashboard, Settings, FileText, Plus, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { LEGAL_SUBJECT_ICONS, LEGAL_SUBJECT_COLORS } from "@/types/legalSubjectIcons";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const { 
    workspaces, 
    selectedWorkspace, 
    setSelectedWorkspace, 
    getAgentsByLegalSubject,
    getAvailableLegalSubjects,
    officialAgents
  } = useWorkspace();
  
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  const handleWorkspaceSelect = (workspace: any) => {
    setSelectedWorkspace(workspace);
    window.history.pushState({}, '', `/dashboard?workspace=${workspace.id}`);
  };

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
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

        {/* Agentes por Matéria - só aparece se há workspace selecionado */}
        {selectedWorkspace && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel>Agentes por Matéria</SidebarGroupLabel>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/agents/create">
                  <Plus className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Agentes Oficiais */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gold rounded-full"></div>
                          <span>Agentes Oficiais</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="h-5 text-xs">
                            {officialAgents.length}
                          </Badge>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-4 space-y-1">
                      {officialAgents.map((agent) => {
                        const IconComponent = LEGAL_SUBJECT_ICONS[agent.type];
                        const iconColor = LEGAL_SUBJECT_COLORS[agent.type];
                        return (
                          <SidebarMenuItem key={agent.id}>
                            <SidebarMenuButton size="sm" className="pl-4">
                              <IconComponent className={`h-4 w-4 ${iconColor}`} />
                              <span className="text-sm">{agent.name}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                {/* Agentes por Matéria */}
                {getAvailableLegalSubjects(selectedWorkspace.id).map((subject) => {
                  const agentsInSubject = getAgentsByLegalSubject(selectedWorkspace.id, subject);
                  const IconComponent = LEGAL_SUBJECT_ICONS[subject];
                  const iconColor = LEGAL_SUBJECT_COLORS[subject];
                  const isExpanded = expandedSubjects.includes(subject);

                  return (
                    <SidebarMenuItem key={subject}>
                      <Collapsible open={isExpanded} onOpenChange={() => toggleSubject(subject)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`h-4 w-4 ${iconColor}`} />
                              <span className="text-sm">{subject}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="h-5 text-xs">
                                {agentsInSubject.length}
                              </Badge>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 space-y-1">
                          {agentsInSubject.map((agent) => (
                            <SidebarMenuItem key={agent.id}>
                              <SidebarMenuButton size="sm" className="pl-4">
                                <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                                <span className="text-sm">{agent.name}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                })}

                {getAvailableLegalSubjects(selectedWorkspace.id).length === 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/agents/create" className="text-muted-foreground">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">Criar primeiro agente</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
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
