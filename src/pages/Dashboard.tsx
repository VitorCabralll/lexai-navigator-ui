
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, Plus, Crown, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function Dashboard() {
  const { selectedWorkspace, getAgentsForWorkspace, officialAgents } = useWorkspace();

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Bem-vindo ao LexAI</h1>
          <p className="text-muted-foreground max-w-md">
            Para começar, você precisa criar seu primeiro ambiente de trabalho.
          </p>
          <Button asChild>
            <Link to="/workspace">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Ambiente
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const workspaceAgents = getAgentsForWorkspace(selectedWorkspace.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{selectedWorkspace.name}</h1>
          <p className="text-muted-foreground">
            Gerencie seus agentes e documentos neste ambiente
          </p>
        </div>
        <Button asChild>
          <Link to="/agents/create">
            <Plus className="mr-2 h-4 w-4" />
            Criar Agente
          </Link>
        </Button>
      </div>

      {/* Agentes Oficiais */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Agentes Oficiais</h2>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            LexAI
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officialAgents.map((agent) => (
            <Card key={agent.id} className="relative">
              <div className="absolute top-2 right-2">
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <CardDescription>{agent.theme}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{agent.type}</Badge>
                  <Button size="sm" asChild>
                    <Link to={`/generate?agent=${agent.id}`}>
                      Usar Agente
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Meus Agentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Meus Agentes</h2>
          <Button variant="outline" asChild>
            <Link to="/agents/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agente
            </Link>
          </Button>
        </div>
        
        {workspaceAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaceAgents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.theme}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{agent.type}</Badge>
                    <Button size="sm" asChild>
                      <Link to={`/generate?agent=${agent.id}`}>
                        Usar Agente
                      </Link>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {agent.createdAt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum agente criado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie seu primeiro agente anexando um modelo de documento
              </p>
              <Button asChild>
                <Link to="/agents/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Agente
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais usadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link to="/generate">
              <FileText className="mr-2 h-4 w-4" />
              Gerar Documento
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link to="/workspace">
              <Building2 className="mr-2 h-4 w-4" />
              Gerenciar Ambientes
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
