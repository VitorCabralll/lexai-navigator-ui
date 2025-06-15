
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Settings, Trash2, Building2, AlertTriangle } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

export function WorkspaceSelector() {
  const { workspaces, selectedWorkspace, setSelectedWorkspace, addWorkspace, getAgentsForWorkspace } = useWorkspace();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<any>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [transferAgents, setTransferAgents] = useState(false);
  const { toast } = useToast();

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWorkspace = {
        id: Date.now().toString(),
        name: newWorkspaceName,
        icon: "Building2",
        iconColor: "text-blue-500",
        createdAt: new Date().toLocaleDateString()
      };
      
      addWorkspace(newWorkspace);
      setNewWorkspaceName("");
      setIsCreateOpen(false);
      
      toast({
        title: "Ambiente criado!",
        description: `${newWorkspaceName} foi criado com sucesso`,
      });
    }
  };

  const handleDeleteClick = (workspace: any) => {
    setWorkspaceToDelete(workspace);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteOpen(false);
    setIsConfirmDeleteOpen(true);
  };

  const handleFinalDelete = () => {
    // Implementar lógica de exclusão aqui
    toast({
      title: "Ambiente excluído",
      description: `${workspaceToDelete?.name} foi excluído com sucesso`,
    });
    setIsConfirmDeleteOpen(false);
    setWorkspaceToDelete(null);
    setTransferAgents(false);
  };

  const agentsCount = workspaceToDelete ? getAgentsForWorkspace(workspaceToDelete.id).length : 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {selectedWorkspace?.name?.charAt(0) || "L"}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">
                {selectedWorkspace?.name || "Selecionar Ambiente"}
              </span>
              <span className="text-xs text-muted-foreground">
                {workspaces.length} {workspaces.length === 1 ? 'ambiente' : 'ambientes'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">AMBIENTES</div>
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent group">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => setSelectedWorkspace(workspace)}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{workspace.name}</span>
                      {selectedWorkspace?.id === workspace.id && (
                        <Badge variant="secondary" className="text-xs">Ativo</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getAgentsForWorkspace(workspace.id).length} agentes
                    </span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(workspace);
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Ambiente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para criar ambiente */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Ambiente</DialogTitle>
            <DialogDescription>
              Defina um nome para o seu novo ambiente de trabalho
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace-name">Nome do Ambiente</Label>
              <Input
                id="workspace-name"
                placeholder="Ex: 20ª Promotoria, Escritório..."
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateWorkspace}>
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação inicial */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Excluir Ambiente
            </DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o ambiente "{workspaceToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {agentsCount > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Este ambiente possui {agentsCount} {agentsCount === 1 ? 'agente' : 'agentes'} criado{agentsCount === 1 ? '' : 's'}.
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação final */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmação Final
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O ambiente "{workspaceToDelete?.name}" será permanentemente excluído.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {agentsCount > 0 && (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    Atenção: {agentsCount} {agentsCount === 1 ? 'agente será perdido' : 'agentes serão perdidos'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="transfer-agents"
                    checked={transferAgents}
                    onChange={(e) => setTransferAgents(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="transfer-agents" className="text-sm">
                    Exportar agentes antes de excluir (recomendado)
                  </Label>
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleFinalDelete}>
                Excluir Definitivamente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
