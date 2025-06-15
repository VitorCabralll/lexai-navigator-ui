
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Star, 
  Users, 
  Globe, 
  Lock, 
  TrendingUp, 
  Clock, 
  Heart,
  Filter,
  SortDesc,
  Download,
  Eye,
  ThumbsUp
} from "lucide-react";
import { AdvancedPrompt, DIFFICULTY_COLORS, PromptCategory } from "@/types/advancedPrompts";

interface PromptMarketplaceProps {
  prompts: AdvancedPrompt[];
  categories: PromptCategory[];
  onPromptSelect: (prompt: AdvancedPrompt) => void;
  onPromptFavorite: (promptId: string) => void;
  onPromptUse: (promptId: string) => void;
}

export function PromptMarketplace({ 
  prompts, 
  categories, 
  onPromptSelect, 
  onPromptFavorite, 
  onPromptUse 
}: PromptMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [activeTab, setActiveTab] = useState("explore");

  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const matchesSearch = searchQuery === "" || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || prompt.difficulty === selectedDifficulty;
      const matchesVisibility = selectedVisibility === "all" || prompt.visibility === selectedVisibility;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesVisibility;
    });

    // Sort prompts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "usage":
          return b.usageCount - a.usageCount;
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [prompts, searchQuery, selectedCategory, selectedDifficulty, selectedVisibility, sortBy]);

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <Lock className="h-3 w-3" />;
      case 'workspace': return <Users className="h-3 w-3" />;
      case 'public': return <Globe className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  const formatUsageCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const PromptCard = ({ prompt }: { prompt: AdvancedPrompt }) => (
    <Card className="hover:shadow-md transition-all cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm line-clamp-2">{prompt.title}</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={DIFFICULTY_COLORS[prompt.difficulty]}>
                {prompt.difficulty}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getVisibilityIcon(prompt.visibility)}
                {prompt.visibility}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onPromptFavorite(prompt.id);
            }}
            className="p-1 h-8 w-8"
          >
            <Heart className={`h-4 w-4 ${prompt.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {prompt.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {prompt.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{prompt.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{prompt.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{formatUsageCount(prompt.usageCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{prompt.metadata.estimatedTime}min</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onPromptSelect(prompt);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onPromptUse(prompt.id);
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Usar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketplace de Prompts</h2>
          <p className="text-muted-foreground">
            Descubra, compartilhe e utilize os melhores prompts jurídicos
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explore">Explorar</TabsTrigger>
          <TabsTrigger value="trending">Em Alta</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="my-prompts">Meus Prompts</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      Avaliação
                    </div>
                  </SelectItem>
                  <SelectItem value="usage">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      Uso
                    </div>
                  </SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Recente
                    </div>
                  </SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="explore" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedPrompts.length} prompt(s) encontrado(s)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedPrompts
                .filter(p => p.analytics.lastMonthUsage > 0)
                .slice(0, 12)
                .map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedPrompts
                .filter(p => p.isFavorite)
                .map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="my-prompts" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Seus prompts personalizados
              </p>
              <Button size="sm">
                Criar Novo Prompt
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedPrompts
                .filter(p => p.visibility === 'private')
                .map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
