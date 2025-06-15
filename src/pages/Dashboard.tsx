
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Crown, Building2, Users, BookOpen, PenTool, FileCheck, Shield, Play, MessageCircle, Sparkles } from "lucide-react"; // Removed Zap
import { Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const scenarios = [
  {
    title: "Preciso criar uma petição",
    description: "Tenho um cliente que precisa processar alguém",
    icon: FileText,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    href: "/generate?type=peticao",
    example: "Ex: Ação de cobrança, indenização por danos..."
  },
  {
    title: "Quero fazer um parecer jurídico",
    description: "Preciso analisar um caso ou contrato",
    icon: BookOpen,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    href: "/generate?type=parecer",
    example: "Ex: Análise de viabilidade, opinião legal..."
  },
  {
    title: "Vou redigir um contrato",
    description: "Meu cliente precisa de um acordo",
    icon: PenTool,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    href: "/generate?type=contrato",
    example: "Ex: Prestação de serviços, compra e venda..."
  },
  {
    title: "Tenho que fazer um recurso",
    description: "Perdi na primeira instância",
    icon: FileCheck,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    href: "/generate?type=recurso",
    example: "Ex: Apelação, agravo, embargos..."
  }
];

export default function Dashboard() {
  const { selectedWorkspace, getAgentsForWorkspace, officialAgents } = useWorkspace();

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-8 max-w-lg mx-auto p-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Olá! Bem-vindo ao LexAI</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Sou sua assistente jurídica inteligente. Para começarmos a trabalhar juntos, 
              vamos configurar seu escritório virtual.
            </p>
          </div>
          <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 py-6 text-lg">
            <Link to="/workspace">
              <Plus className="mr-3 h-5 w-5" />
              Configurar Meu Escritório
            </Link>
          </Button>
          <p className="text-sm text-gray-500">
            Levará apenas 2 minutos ⏰
          </p>
        </div>
      </div>
    );
  }

  const workspaceAgents = getAgentsForWorkspace(selectedWorkspace.id);

  return (
    <div className="space-y-10">
      {/* Header Conversacional */}
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 font-medium">Como posso te ajudar hoje?</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">O que você precisa fazer?</h1>
        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
          Escolha abaixo a situação que mais se parece com a sua
        </p>
      </div>

      {/* Cenários Visuais - Cards Grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {scenarios.map((scenario) => (
          <Card key={scenario.title} className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 overflow-hidden">
            <Link to={scenario.href}>
              <div className="relative">
                <div className={`${scenario.color} p-8 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <scenario.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{scenario.title}</h3>
                        <p className="text-blue-100 text-lg">{scenario.description}</p>
                      </div>
                    </div>
                    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 bg-white">
                  <p className="text-gray-600 italic">{scenario.example}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Clique para começar</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </CardContent>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {/* Modelos Inteligentes Oficiais */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Modelos Prontos para Usar</h2>
            <p className="text-gray-600">Criados por especialistas jurídicos</p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            ⭐ Recomendados
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officialAgents.map((agent) => (
            <Card key={agent.id} className="relative hover:shadow-lg transition-all duration-200 border border-gray-200">
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Crown className="h-3 w-3 text-yellow-600" />
                </div>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">{agent.name}</CardTitle>
                <CardDescription className="text-gray-600">{agent.theme}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge variant="outline" className="text-xs">{agent.type}</Badge>
                  <Button size="sm" asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                    <Link to={`/generate?agent=${agent.id}`}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Usar Este Modelo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Meus Modelos Personalizados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Meus Modelos Personalizados</h2>
              <p className="text-gray-600">Baseados nos seus documentos</p>
            </div>
          </div>
          <Button variant="outline" asChild className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50">
            <Link to="/agents/create">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Modelo
            </Link>
          </Button>
        </div>
        
        {workspaceAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaceAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900">{agent.name}</CardTitle>
                      <CardDescription className="text-gray-600">{agent.theme}</CardDescription>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{agent.type}</Badge>
                      <span className="text-xs text-gray-500">Criado {agent.createdAt}</span>
                    </div>
                    <Button size="sm" asChild className="w-full">
                      <Link to={`/generate?agent=${agent.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Usar Este Modelo
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ainda não há modelos personalizados</h3>
              <p className="text-gray-600 text-center mb-8 max-w-md leading-relaxed">
                Que tal criar seu primeiro modelo? Envie um documento que você usa frequentemente e eu aprendo como fazer outros iguais.
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                <Link to="/agents/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Meu Primeiro Modelo
                </Link>
              </Button>
              <p className="text-sm text-gray-500 mt-4">É rápido e fácil! 📝</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dica com Visual Mais Amigável */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-3">
            💡 Dica para Iniciantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-blue-800 leading-relaxed">
              <strong>Primeira vez aqui?</strong> Comece testando um dos modelos prontos acima. 
              Depois, quando se sentir à vontade, você pode criar seus próprios modelos personalizados.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span>🎯</span>
              <span>Quanto mais específico você for, melhor será o resultado!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
