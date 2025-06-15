
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Crown, Building2, Zap, Users, BookOpen, PenTool, FileCheck, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const quickActions = [
  {
    title: "Criar Petição",
    description: "Petição inicial, contestação, recurso ou outros documentos processuais",
    icon: FileText,
    color: "bg-blue-500",
    href: "/generate?type=peticao"
  },
  {
    title: "Fazer Parecer",
    description: "Análise jurídica, opinião legal ou consultoria especializada",
    icon: BookOpen,
    color: "bg-green-500",
    href: "/generate?type=parecer"
  },
  {
    title: "Redigir Contrato",
    description: "Contratos, termos ou documentos contratuais",
    icon: PenTool,
    color: "bg-purple-500",
    href: "/generate?type=contrato"
  },
  {
    title: "Preparar Recurso",
    description: "Apelação, agravo ou outros recursos processuais",
    icon: FileCheck,
    color: "bg-orange-500",
    href: "/generate?type=recurso"
  }
];

export default function Dashboard() {
  const { selectedWorkspace, getAgentsForWorkspace, officialAgents } = useWorkspace();

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <Building2 className="h-20 w-20 text-blue-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Bem-vindo ao LexAI</h1>
            <p className="text-muted-foreground">
              Para começar, vamos criar sua área de trabalho jurídica.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link to="/workspace">
              <Plus className="mr-2 h-4 w-4" />
              Criar Minha Área de Trabalho
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const workspaceAgents = getAgentsForWorkspace(selectedWorkspace.id);

  return (
    <div className="space-y-8">
      {/* Header Principal */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">O que você precisa fazer hoje?</h1>
        <p className="text-muted-foreground text-lg">
          Escolha uma das opções abaixo para criar seu documento jurídico
        </p>
      </div>

      {/* Ações Rápidas - Cards Grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <Link to={action.href}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                    <p className="text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Seção de Assistentes Inteligentes */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-semibold">Assistentes Inteligentes Oficiais</h2>
          <Badge className="bg-yellow-100 text-yellow-800">
            Criados pela LexAI
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officialAgents.map((agent) => (
            <Card key={agent.id} className="relative hover:shadow-md transition-shadow">
              <div className="absolute top-3 right-3">
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
                      Usar Assistente
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Meus Assistentes Personalizados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Meus Assistentes Personalizados</h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/agents/create">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Assistente
            </Link>
          </Button>
        </div>
        
        {workspaceAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaceAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.theme}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{agent.type}</Badge>
                    <Button size="sm" asChild>
                      <Link to={`/generate?agent=${agent.id}`}>
                        Usar Assistente
                      </Link>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Criado em {agent.createdAt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum assistente criado ainda</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Crie seu primeiro assistente personalizado anexando um modelo de documento que você usa com frequência
              </p>
              <Button asChild>
                <Link to="/agents/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Meu Primeiro Assistente
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ajuda Rápida */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Dica Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            <strong>Novo aqui?</strong> Comece criando um documento usando nossos assistentes oficiais. 
            Depois, você pode criar seus próprios assistentes personalizados para documentos que usa frequentemente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
