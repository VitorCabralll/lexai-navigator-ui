
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Target, 
  Star,
  Clock,
  ArrowRight,
  Lightbulb,
  Zap
} from "lucide-react";
import { AdvancedPrompt } from "@/types/advancedPrompts";

interface Recommendation {
  id: string;
  type: 'trending' | 'similar' | 'improvement' | 'new';
  title: string;
  description: string;
  prompt: AdvancedPrompt;
  confidence: number;
  reason: string;
  actionText: string;
}

interface PromptRecommendationsProps {
  userPrompts: AdvancedPrompt[];
  allPrompts: AdvancedPrompt[];
  recentActivity: string[];
  onPromptSelect: (prompt: AdvancedPrompt) => void;
  onRecommendationAction: (recommendation: Recommendation) => void;
}

export function PromptRecommendations({ 
  userPrompts, 
  allPrompts, 
  recentActivity, 
  onPromptSelect, 
  onRecommendationAction 
}: PromptRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate AI-powered recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      const recs: Recommendation[] = [];

      // Trending prompts
      const trendingPrompts = allPrompts
        .filter(p => p.analytics.lastMonthUsage > 50)
        .slice(0, 2);
      
      trendingPrompts.forEach(prompt => {
        recs.push({
          id: `trending-${prompt.id}`,
          type: 'trending',
          title: `${prompt.title} está em alta`,
          description: `Este prompt teve ${prompt.analytics.lastMonthUsage} usos no último mês`,
          prompt,
          confidence: 0.85,
          reason: 'Alta demanda recente',
          actionText: 'Usar agora'
        });
      });

      // Similar prompts based on user's work
      if (userPrompts.length > 0) {
        const userCategories = [...new Set(userPrompts.map(p => p.category))];
        const similarPrompts = allPrompts
          .filter(p => 
            userCategories.includes(p.category) && 
            !userPrompts.some(up => up.id === p.id) &&
            p.rating > 4.0
          )
          .slice(0, 2);

        similarPrompts.forEach(prompt => {
          recs.push({
            id: `similar-${prompt.id}`,
            type: 'similar',
            title: `Prompt similar: ${prompt.title}`,
            description: `Baseado no seu trabalho em ${prompt.category}`,
            prompt,
            confidence: 0.75,
            reason: 'Similar aos seus prompts',
            actionText: 'Explorar'
          });
        });
      }

      // Improvement suggestions
      const lowPerformingPrompts = userPrompts
        .filter(p => p.analytics.successRate < 0.7)
        .slice(0, 1);

      lowPerformingPrompts.forEach(prompt => {
        const betterVersion = allPrompts.find(p => 
          p.category === prompt.category && 
          p.analytics.successRate > 0.9 &&
          p.id !== prompt.id
        );

        if (betterVersion) {
          recs.push({
            id: `improvement-${prompt.id}`,
            type: 'improvement',
            title: `Melhore "${prompt.title}"`,
            description: `Encontramos uma versão com ${(betterVersion.analytics.successRate * 100).toFixed(0)}% de taxa de sucesso`,
            prompt: betterVersion,
            confidence: 0.9,
            reason: 'Performance superior',
            actionText: 'Ver alternativa'
          });
        }
      });

      // New prompts in user's areas of interest
      if (userPrompts.length > 0) {
        const userAreas = [...new Set(userPrompts.map(p => p.metadata.legalArea))];
        const newPrompts = allPrompts
          .filter(p => 
            userAreas.includes(p.metadata.legalArea) &&
            !userPrompts.some(up => up.id === p.id) &&
            new Date(p.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 // Last 30 days
          )
          .slice(0, 1);

        newPrompts.forEach(prompt => {
          recs.push({
            id: `new-${prompt.id}`,
            type: 'new',
            title: `Novo em ${prompt.metadata.legalArea}`,
            description: `Prompt recém-adicionado para ${prompt.metadata.documentType}`,
            prompt,
            confidence: 0.65,
            reason: 'Nova funcionalidade',
            actionText: 'Descobrir'
          });
        });
      }

      setRecommendations(recs.slice(0, 6)); // Limit to 6 recommendations
      setIsLoading(false);
    };

    // Simulate loading time
    setTimeout(generateRecommendations, 1500);
  }, [userPrompts, allPrompts]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'similar': return <Target className="h-4 w-4" />;
      case 'improvement': return <Sparkles className="h-4 w-4" />;
      case 'new': return <Zap className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trending': return 'text-blue-600 bg-blue-100';
      case 'similar': return 'text-green-600 bg-green-100';
      case 'improvement': return 'text-purple-600 bg-purple-100';
      case 'new': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trending': return 'Em Alta';
      case 'similar': return 'Similar';
      case 'improvement': return 'Melhoria';
      case 'new': return 'Novo';
      default: return 'Recomendação';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recomendações Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Recomendações Inteligentes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sugestões baseadas em IA para otimizar seu trabalho
        </p>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Continue usando a plataforma para receber recomendações personalizadas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(rec.type)}`}>
                      {getTypeIcon(rec.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getTypeColor(rec.type)}>
                    {getTypeLabel(rec.type)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{rec.prompt.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{rec.prompt.usageCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{rec.prompt.metadata.estimatedTime}min</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confiança: {(rec.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Relevância</span>
                    <span>{(rec.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={rec.confidence * 100} className="h-1" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {rec.reason}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onPromptSelect(rec.prompt)}
                    >
                      Ver detalhes
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onRecommendationAction(rec)}
                    >
                      {rec.actionText}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
