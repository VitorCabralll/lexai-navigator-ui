
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Database, BarChart3, Sparkles, Edit } from "lucide-react";
import { PromptMarketplace } from "@/components/PromptMarketplace";
import { PromptAnalytics } from "@/components/PromptAnalytics";
import { PromptEditor } from "@/components/PromptEditor";
import { PromptRecommendations } from "@/components/PromptRecommendations";
import { AdvancedPrompt, PromptAnalyticsData, PromptCategory } from "@/types/advancedPrompts";
import { useToast } from "@/hooks/use-toast";

// Mock data - in real app this would come from API
const mockCategories: PromptCategory[] = [
  {
    id: 'civil',
    name: 'Direito Civil',
    description: 'Contratos, responsabilidade civil, direitos reais',
    icon: 'file-text',
    subcategories: [
      { id: 'contratos', name: 'Contratos', description: 'Elaboração de contratos', promptCount: 25 },
      { id: 'responsabilidade', name: 'Responsabilidade Civil', description: 'Ações de danos', promptCount: 18 }
    ],
    promptCount: 43
  },
  {
    id: 'trabalhista',
    name: 'Direito Trabalhista',
    description: 'Relações de trabalho, CLT, dissídios',
    icon: 'users',
    subcategories: [
      { id: 'clt', name: 'CLT', description: 'Consolidação das Leis do Trabalho', promptCount: 32 },
      { id: 'dissidios', name: 'Dissídios', description: 'Conflitos trabalhistas', promptCount: 15 }
    ],
    promptCount: 47
  },
  {
    id: 'penal',
    name: 'Direito Penal',
    description: 'Crimes, defesas, recursos penais',
    icon: 'shield',
    subcategories: [
      { id: 'defesa', name: 'Defesa', description: 'Peças de defesa criminal', promptCount: 28 },
      { id: 'recursos', name: 'Recursos', description: 'Recursos criminais', promptCount: 22 }
    ],
    promptCount: 50
  }
];

const mockPrompts: AdvancedPrompt[] = [
  {
    id: '1',
    title: 'Petição Inicial - Danos Morais',
    description: 'Template para ações de danos morais com fundamentação completa',
    category: 'civil',
    subcategories: ['responsabilidade'],
    tags: ['danos morais', 'responsabilidade civil', 'indenização'],
    difficulty: 'intermediate',
    visibility: 'public',
    author: 'user1',
    authorName: 'Dr. João Silva',
    version: '2.1',
    rating: 4.8,
    usageCount: 1247,
    lastUsed: new Date(),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    content: 'Template para petição inicial...',
    internalPrompt: 'Você é um advogado especialista em direito civil...',
    metadata: {
      legalArea: 'Direito Civil',
      documentType: 'Petição Inicial',
      complexity: 6,
      estimatedTime: 15,
      requiredFields: ['Nome do autor', 'Nome do réu', 'Valor dos danos'],
      keywords: ['danos morais', 'responsabilidade', 'indenização']
    },
    analytics: {
      successRate: 0.92,
      averageRating: 4.8,
      totalGenerations: 1247,
      averageGenerationTime: 3.2,
      feedbackCount: 156,
      lastMonthUsage: 89
    },
    isFavorite: true
  },
  {
    id: '2',
    title: 'Contrato de Prestação de Serviços',
    description: 'Modelo completo de contrato de prestação de serviços',
    category: 'civil',
    subcategories: ['contratos'],
    tags: ['contrato', 'prestação de serviços', 'cláusulas'],
    difficulty: 'beginner',
    visibility: 'public',
    author: 'user2',
    authorName: 'Dra. Maria Santos',
    version: '1.5',
    rating: 4.6,
    usageCount: 892,
    lastUsed: new Date(),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10'),
    content: 'Template para contrato...',
    internalPrompt: 'Você é um especialista em direito contratual...',
    metadata: {
      legalArea: 'Direito Civil',
      documentType: 'Contrato',
      complexity: 4,
      estimatedTime: 10,
      requiredFields: ['Contratante', 'Contratado', 'Objeto do contrato'],
      keywords: ['contrato', 'prestação', 'serviços']
    },
    analytics: {
      successRate: 0.88,
      averageRating: 4.6,
      totalGenerations: 892,
      averageGenerationTime: 2.8,
      feedbackCount: 98,
      lastMonthUsage: 67
    },
    isFavorite: false
  }
];

const mockAnalyticsData: PromptAnalyticsData = {
  totalPrompts: 140,
  publicPrompts: 85,
  workspacePrompts: 32,
  privatePrompts: 23,
  topCategories: [
    { name: 'Direito Civil', count: 43, percentage: 0.31 },
    { name: 'Direito Trabalhista', count: 47, percentage: 0.34 },
    { name: 'Direito Penal', count: 50, percentage: 0.35 }
  ],
  recentActivity: [
    { date: '2024-03-01', generations: 45, newPrompts: 3 },
    { date: '2024-03-02', generations: 52, newPrompts: 1 },
    { date: '2024-03-03', generations: 38, newPrompts: 2 }
  ],
  popularPrompts: mockPrompts,
  qualityTrends: [
    { month: 'Jan', averageRating: 4.2, totalUsage: 1200 },
    { month: 'Fev', averageRating: 4.5, totalUsage: 1350 },
    { month: 'Mar', averageRating: 4.7, totalUsage: 1480 }
  ]
};

export default function PromptDatabase() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [prompts, setPrompts] = useState<AdvancedPrompt[]>(mockPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<AdvancedPrompt | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<PromptAnalyticsData>(mockAnalyticsData);
  const { toast } = useToast();

  const handlePromptSelect = (prompt: AdvancedPrompt) => {
    setSelectedPrompt(prompt);
  };

  const handlePromptFavorite = (promptId: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
    toast({
      title: "Favorito atualizado",
      description: "Prompt adicionado/removido dos favoritos"
    });
  };

  const handlePromptUse = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      toast({
        title: "Prompt selecionado",
        description: `Usando: ${prompt.title}`
      });
      // Here you would redirect to generation page with this prompt
    }
  };

  const handleSavePrompt = (promptData: Partial<AdvancedPrompt>) => {
    if (selectedPrompt) {
      // Update existing prompt
      setPrompts(prev => prev.map(p => 
        p.id === selectedPrompt.id ? { ...p, ...promptData } : p
      ));
      toast({
        title: "Prompt atualizado",
        description: "As alterações foram salvas com sucesso"
      });
    } else {
      // Create new prompt
      const newPrompt: AdvancedPrompt = {
        id: Date.now().toString(),
        author: 'current-user',
        authorName: 'Usuário Atual',
        version: '1.0',
        rating: 0,
        usageCount: 0,
        lastUsed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        analytics: {
          successRate: 0,
          averageRating: 0,
          totalGenerations: 0,
          averageGenerationTime: 0,
          feedbackCount: 0,
          lastMonthUsage: 0
        },
        isFavorite: false,
        ...promptData
      } as AdvancedPrompt;
      
      setPrompts(prev => [...prev, newPrompt]);
      toast({
        title: "Prompt criado",
        description: "Novo prompt foi criado com sucesso"
      });
    }
    setIsEditing(false);
    setSelectedPrompt(undefined);
  };

  const handleTestPrompt = (promptData: Partial<AdvancedPrompt>) => {
    toast({
      title: "Testando prompt",
      description: "Executando teste de geração..."
    });
    // Here you would test the prompt
  };

  const handleRecommendationAction = (recommendation: any) => {
    toast({
      title: "Recomendação aplicada",
      description: `Ação executada: ${recommendation.actionText}`
    });
  };

  if (isEditing) {
    return (
      <div className="container mx-auto p-6">
        <PromptEditor
          prompt={selectedPrompt}
          categories={mockCategories}
          onSave={handleSavePrompt}
          onTest={handleTestPrompt}
          onCancel={() => {
            setIsEditing(false);
            setSelectedPrompt(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banco de Dados de Prompts</h1>
          <p className="text-gray-600">
            Explore, crie e gerencie prompts jurídicos inteligentes
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Prompt
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="my-prompts" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Meus Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <PromptMarketplace
            prompts={prompts}
            categories={mockCategories}
            onPromptSelect={handlePromptSelect}
            onPromptFavorite={handlePromptFavorite}
            onPromptUse={handlePromptUse}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PromptAnalytics
            data={analyticsData}
            selectedPrompt={selectedPrompt}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <PromptRecommendations
            userPrompts={prompts.filter(p => p.author === 'current-user')}
            allPrompts={prompts}
            recentActivity={['civil', 'trabalhista']}
            onPromptSelect={handlePromptSelect}
            onRecommendationAction={handleRecommendationAction}
          />
        </TabsContent>

        <TabsContent value="my-prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Prompts Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prompts
                  .filter(p => p.author === 'current-user')
                  .map(prompt => (
                    <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{prompt.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {prompt.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            v{prompt.version}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedPrompt(prompt);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
