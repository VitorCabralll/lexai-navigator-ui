
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Star, 
  Activity, 
  Target,
  Eye,
  ThumbsUp,
  Clock,
  BarChart3,
  PieChart
} from "lucide-react";
import { PromptAnalyticsData, AdvancedPrompt } from "@/types/advancedPrompts";

interface PromptAnalyticsProps {
  data: PromptAnalyticsData;
  selectedPrompt?: AdvancedPrompt;
}

export function PromptAnalytics({ data, selectedPrompt }: PromptAnalyticsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Prompts</h2>
          <p className="text-muted-foreground">
            Métricas detalhadas de performance e uso
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Prompts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalPrompts)}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {data.publicPrompts} públicos
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.workspacePrompts} workspace
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts Populares</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.popularPrompts.length}</div>
            <p className="text-xs text-muted-foreground">
              Com alta taxa de uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.qualityTrends.length > 0 
                ? data.qualityTrends[data.qualityTrends.length - 1].averageRating.toFixed(1)
                : '0.0'
              }
            </div>
            <div className="flex items-center mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-xs text-muted-foreground">de 5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Mensal</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                data.qualityTrends.reduce((sum, trend) => sum + trend.totalUsage, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gerações este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribuição por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCategories.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {category.count} prompts
                    </span>
                    <Badge variant="secondary">
                      {formatPercentage(category.percentage)}
                    </Badge>
                  </div>
                </div>
                <Progress value={category.percentage * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prompts Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.popularPrompts.slice(0, 5).map((prompt, index) => (
              <div key={prompt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{prompt.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {prompt.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{formatNumber(prompt.usageCount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{prompt.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{formatPercentage(prompt.analytics.successRate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Prompt Details */}
      {selectedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Detalhes: {selectedPrompt.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
                      <span className="font-medium">
                        {formatPercentage(selectedPrompt.analytics.successRate)}
                      </span>
                    </div>
                    <Progress value={selectedPrompt.analytics.successRate * 100} className="h-2" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avaliação Média</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedPrompt.analytics.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Uso</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de Gerações</span>
                      <span className="font-medium">
                        {formatNumber(selectedPrompt.analytics.totalGenerations)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Uso no Último Mês</span>
                      <span className="font-medium">
                        {formatNumber(selectedPrompt.analytics.lastMonthUsage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Timing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tempo Médio</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">
                          {selectedPrompt.analytics.averageGenerationTime.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tempo Estimado</span>
                      <span className="font-medium">
                        {selectedPrompt.metadata.estimatedTime}min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
