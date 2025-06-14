
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  agentCount: number;
}

interface DashboardSidebarProps {
  workspaces: Workspace[];
  selectedWorkspace: string;
  onWorkspaceSelect: (workspace: string) => void;
}

export function DashboardSidebar({ 
  workspaces, 
  selectedWorkspace, 
  onWorkspaceSelect 
}: DashboardSidebarProps) {
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header com Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">LexAI</h1>
            <p className="text-sm text-muted-foreground">Inteligência Jurídica</p>
          </div>
        </div>
      </div>

      {/* Lista de Ambientes */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Ambientes de Trabalho</h2>
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => onWorkspaceSelect(workspace.name)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  selectedWorkspace === workspace.name
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                )}
              >
                <Building2 className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">{workspace.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {workspace.agentCount} agentes
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full justify-start gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          Criar Ambiente
        </Button>
      </div>

      {/* Footer com usuário */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Usuário" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              João Doe
            </div>
            <div className="text-xs text-muted-foreground truncate">
              joao@exemplo.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
