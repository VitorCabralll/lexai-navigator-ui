
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  Star,
  Brain,
  Target,
  Award,
  Activity
} from "lucide-react";

interface WorkspaceStats {
  documentsGenerated: number;
  agentsCreated: number;
  averageRating: number;
  totalRatings: number;
  productivityScore: number;
  mostUsedAgent: string;
  timesSaved: number; // em horas
  qualityTrend: 'up' | 'down' | 'stable';
}

interface AgentPerformance {
  id: string;
  name: string;
  documentsGenerated: number;
  averageRating: number;
  usagePercentage: number;
}

interface WorkspaceAnalyticsProps {
  workspaceId: string;
  workspaceName: string;
}

export function WorkspaceAnalytics({ workspaceId, workspaceName }: WorkspaceAnalyticsProps) {
  const [stats, setStats] = useState<WorkspaceStats>({
    documentsGenerated: 0,
    agentsCreated: 0,
    averageRating: 0,
    totalRatings: 0,
    productivityScore: 0,
    mostUsedAgent: '',
    timesSaved: 0,
    qualityTrend: 'stable'
  });

  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento de dados
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados - em produção viria do Firebase
      setStats({
        documentsGenerated: 47,
        agentsCreated: 8,
        averageRating: 4.3,
        totalRatings: 23,
        productivityScore: 87,
        mostUsedAgent: 'Petições Trabalhistas',
        timesSaved: 15.5,
        qualityTrend: 'up'
      });

      setAgentPerformance([
        { id: '1', name: 'Petições Trabalhistas', documentsGenerated: 18, averageRating: 4.5, usagePercentage: 38 },
        { id: '2', name: 'Contratos Comerciais', documentsGenerated: 12, averageRating: 4.2, usagePercentage: 26 },
        { id: '3', name: 'Recursos Cíveis', documentsGenerated: 8, averageRating: 4.1, usagePercentage: 17 },
        { id: '4', name: 'Pareceres Jurídicos', documentsGenerated: 6, averageRating: 4.6, usagePercentage: 13 },
        { id: '5', name: 'Defesas Administrativas', documentsGenerated: 3, averageRating: 4.0, usagePercentage: 6 }
      ]);

      setIsLoading(false);
    };

    loadAnalytics();
  }, [workspaceId]);

  const getQualityTrendIcon = () => {
    switch (stats.qualityTrend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics do Workspace</h2>
          <p className="text-gray-600">{workspaceName}</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <BarChart className="h-3 w-3 mr-1" />
          Últimos 30 dias
        </Badge>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Documentos Gerados</p>
                <p className="text-2xl font-bold text-blue-900">{stats.documentsGenerated}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Agentes Criados</p>
                <p className="text-2xl font-bold text-purple-900">{stats.agentsCreated}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Avaliação Média</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-green-900">{stats.averageRating}</p>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-green-600">{stats.totalRatings} avaliações</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Tempo Economizado</p>
                <p className="text-2xl font-bold text-orange-900">{stats.timesSaved}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score de produtividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Score de Produtividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score Atual</span>
              <span className={`text-2xl font-bold ${getProductivityColor(stats.productivityScore)}`}>
                {stats.productivityScore}%
              </span>
            </div>
            <Progress value={stats.productivityScore} className="h-3" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getQualityTrendIcon()}
              <span>
                {stats.qualityTrend === 'up' && 'Tendência de melhoria'}
                {stats.qualityTrend === 'down' && 'Tendência de queda'}
                {stats.qualityTrend === 'stable' && 'Estável'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance dos agentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance dos Agentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformance.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{agent.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{agent.averageRating}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {agent.documentsGenerated} docs
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Uso: {agent.usagePercentage}%</span>
                    </div>
                    <Progress value={agent.usagePercentage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e recomendações */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <TrendingUp className="h-5 w-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">Destaque</Badge>
              <p>O agente <strong>{stats.mostUsedAgent}</strong> é o mais utilizado com {agentPerformance[0]?.usagePercentage}% dos documentos gerados.</p>
            </div>
            
            {stats.averageRating >= 4.0 && (
              <div className="flex items-start gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Excelente</Badge>
                <p>Qualidade dos documentos está acima da média (4.0+). Continue assim!</p>
              </div>
            )}
            
            {stats.productivityScore >= 80 && (
              <div className="flex items-start gap-2">
                <Badge variant="default" className="bg-purple-100 text-purple-800 text-xs">Produtivo</Badge>
                <p>Seu workspace está altamente produtivo. Considere criar mais agentes especializados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
