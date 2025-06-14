
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Building2, Scale, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Workspace {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  agentCount: number;
  createdAt: string;
}

const mockWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Escritório",
    icon: Building2,
    iconColor: "text-green-500",
    agentCount: 0,
    createdAt: "Criado há 2 dias"
  },
  {
    id: "2", 
    name: "20° Promotoria",
    icon: Scale,
    iconColor: "text-blue-500",
    agentCount: 1,
    createdAt: "Criado há 1 semana"
  }
];

export default function Workspace() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWorkspace: Workspace = {
        id: Date.now().toString(),
        name: newWorkspaceName,
        icon: Building2,
        iconColor: "text-purple-500",
        agentCount: 0,
        createdAt: "Criado agora"
      };
      setWorkspaces([...workspaces, newWorkspace]);
      setNewWorkspaceName("");
      setIsCreateOpen(false);
    }
  };

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces(workspaces.filter(w => w.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ambientes de Trabalho
            </h1>
            <p className="text-gray-600">
              Gerencie seus ambientes e organize seus agentes de IA
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Criar Ambiente
              </Button>
            </DialogTrigger>
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
                    placeholder="Ex: Escritório, Promotoria..."
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
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="group hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gray-50 ${workspace.iconColor}`}>
                    <workspace.icon className="h-6 w-6" />
                  </div>
                  <button
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  {workspace.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Agentes</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {workspace.agentCount}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{workspace.createdAt}</p>
                </div>

                <Button asChild className="w-full bg-gray-900 hover:bg-gray-800">
                  <Link to={`/dashboard?workspace=${workspace.id}`}>
                    Abrir Ambiente
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum ambiente criado
            </h3>
            <p className="text-gray-600 mb-4">
              Crie seu primeiro ambiente de trabalho para organizar seus agentes
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Ambiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
