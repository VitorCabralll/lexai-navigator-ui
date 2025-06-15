
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Crown, Building2, Users, BookOpen, PenTool, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const scenarios = [
  {
    title: "Criar petição",
    description: "Processar alguém",
    icon: FileText,
    href: "/generate?type=peticao",
  },
  {
    title: "Fazer parecer",
    description: "Analisar caso ou contrato",
    icon: BookOpen,
    href: "/generate?type=parecer",
  },
  {
    title: "Redigir contrato",
    description: "Acordo entre partes",
    icon: PenTool,
    href: "/generate?type=contrato",
  },
  {
    title: "Fazer recurso",
    description: "Contestar decisão",
    icon: FileCheck,
    href: "/generate?type=recurso",
  }
];

export default function Dashboard() {
  const { selectedWorkspace, getAgentsForWorkspace, officialAgents } = useWorkspace();

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto" />
            <h1 className="text-xl font-medium">Configure seu escritório</h1>
            <p className="text-gray-600">
              Você precisa configurar um escritório para começar
            </p>
            <Button asChild className="w-full">
              <Link to="/workspace">
                <Plus className="mr-2 h-4 w-4" />
                Configurar Escritório
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workspaceAgents = getAgentsForWorkspace(selectedWorkspace.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium mb-2">O que você precisa fazer?</h1>
        <p className="text-gray-600">Escolha uma das opções abaixo</p>
      </div>

      {/* Cenários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <Card key={scenario.title} className="hover:shadow-sm transition-shadow">
            <Link to={scenario.href}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <scenario.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{scenario.title}</h3>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Modelos Oficiais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Modelos prontos</h2>
            <p className="text-sm text-gray-600">Criados por especialistas</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Crown className="h-3 w-3" />
            Oficiais
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officialAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <CardDescription className="text-sm">{agent.theme}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline" className="text-xs">{agent.type}</Badge>
                  <Button size="sm" asChild className="w-full">
                    <Link to={`/generate?agent=${agent.id}`}>
                      Usar modelo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Meus Modelos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Meus modelos</h2>
            <p className="text-sm text-gray-600">Baseados nos seus documentos</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/agents/create">
              <Plus className="mr-2 h-4 w-4" />
              Criar modelo
            </Link>
          </Button>
        </div>
        
        {workspaceAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaceAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <CardDescription className="text-sm">{agent.theme}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{agent.type}</Badge>
                      <span className="text-xs text-gray-500">{agent.createdAt}</span>
                    </div>
                    <Button size="sm" asChild className="w-full">
                      <Link to={`/generate?agent=${agent.id}`}>
                        Usar modelo
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-8 w-8 text-gray-400 mb-3" />
              <h3 className="font-medium mb-2">Nenhum modelo personalizado</h3>
              <p className="text-sm text-gray-600 text-center mb-4 max-w-sm">
                Crie um modelo enviando um documento que você usa frequentemente
              </p>
              <Button size="sm" asChild>
                <Link to="/agents/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeiro modelo
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
