import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, FileText, Bot, Zap, CheckCircle, MessageCircle, Sparkles, Crown, Users, Database } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { FileUploadModern } from "@/components/FileUploadModern";
import { GenerationProgress } from "@/components/GenerationProgress";
import { PromptGrid } from "@/components/PromptGrid";
import { PromptMarketplace } from "@/components/PromptMarketplace";
import { ExpandableDocument } from "@/components/ExpandableDocument";
import { PREDEFINED_PROMPTS } from "@/types/prompts";
import { AdvancedPrompt, PromptCategory } from "@/types/advancedPrompts";
import { Toaster } from "@/components/ui/toaster";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
}

// Mock data for advanced prompts
const mockAdvancedPrompts: AdvancedPrompt[] = [
  {
    id: 'adv-1',
    title: 'Petição Inicial - Danos Morais Avançada',
    description: 'Template avançado com análise jurisprudencial automática',
    category: 'civil',
    subcategories: ['responsabilidade'],
    tags: ['danos morais', 'jurisprudência', 'IA'],
    difficulty: 'advanced',
    visibility: 'public',
    author: 'ai-system',
    authorName: 'Sistema IA',
    version: '3.0',
    rating: 4.9,
    usageCount: 2156,
    lastUsed: new Date(),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    content: 'Template avançado...',
    internalPrompt: 'Você é um advogado especialista com acesso a jurisprudência...',
    metadata: {
      legalArea: 'Direito Civil',
      documentType: 'Petição Inicial',
      complexity: 8,
      estimatedTime: 20,
      requiredFields: ['Nome do autor', 'CPF/CNPJ', 'Nome do réu', 'Valor dos danos', 'Fatos'],
      keywords: ['danos morais', 'responsabilidade', 'jurisprudência']
    },
    analytics: {
      successRate: 0.95,
      averageRating: 4.9,
      totalGenerations: 2156,
      averageGenerationTime: 4.2,
      feedbackCount: 287,
      lastMonthUsage: 156
    },
    isFavorite: false
  }
];

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
  }
];

export default function Generate() {
  const [searchParams] = useSearchParams();
  const { agents, officialAgents, selectedWorkspace } = useWorkspace();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMode, setCreationMode] = useState<"assistant" | "template" | "advanced" | "">(
    searchParams.get('agent') ? "assistant" : searchParams.get('type') ? "template" : ""
  );
  const [selectedAgent, setSelectedAgent] = useState(searchParams.get('agent') || "");
  const [instructions, setInstructions] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState(searchParams.get('type') || "");
  const [selectedAdvancedPrompt, setSelectedAdvancedPrompt] = useState<AdvancedPrompt | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [supportFiles, setSupportFiles] = useState<UploadedFile[]>([]);
  const [templateFile, setTemplateFile] = useState<UploadedFile | null>(null);
  const [strictMode, setStrictMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");

  const workspaceAgents = selectedWorkspace ? agents.filter(a => a.workspaceId === selectedWorkspace.id) : [];
  const allAgents = [...officialAgents, ...workspaceAgents];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    // Set document title based on mode
    if (creationMode === 'advanced' && selectedAdvancedPrompt) {
      setDocumentTitle(selectedAdvancedPrompt.title);
    } else if (creationMode === 'template' && selectedPromptId) {
      const prompt = PREDEFINED_PROMPTS.find(p => p.id === selectedPromptId);
      setDocumentTitle(prompt?.name || 'Documento Jurídico');
    } else if (creationMode === 'assistant' && selectedAgent) {
      const agent = allAgents.find(a => a.id === selectedAgent);
      setDocumentTitle(`Documento - ${agent?.name || 'Assistente'}`);
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    
    // Generate content based on mode
    let content = '';
    if (creationMode === 'advanced' && selectedAdvancedPrompt) {
      content = `${selectedAdvancedPrompt.title.toUpperCase()}

Documento gerado com IA Avançada v${selectedAdvancedPrompt.version}
Área: ${selectedAdvancedPrompt.metadata.legalArea}

${additionalInstructions ? `SUAS INSTRUÇÕES:\n${additionalInstructions}\n` : ''}

DOCUMENTOS ANALISADOS:
${supportFiles.length > 0 ? supportFiles.map(f => `- ${f.name}`).join('\n') : 'Nenhum documento anexado.'}

[Documento gerado utilizando prompt avançado com análise jurisprudencial automática]

1. CONSIDERAÇÕES INICIAIS COM ANÁLISE JURISPRUDENCIAL
Com base na análise automatizada de jurisprudência e nos documentos anexados...

2. FUNDAMENTAÇÃO TÉCNICA AVANÇADA
${additionalInstructions || 'Análise jurídica detalhada com precedentes...'}

3. CONCLUSÃO TÉCNICA
Pelos fundamentos expostos e precedentes analisados...

Taxa de sucesso esperada: ${(selectedAdvancedPrompt.analytics.successRate * 100).toFixed(0)}%
Complexidade: ${selectedAdvancedPrompt.metadata.complexity}/10

---
Documento criado com LexAI Pro - Prompt ID: ${selectedAdvancedPrompt.id}`;
    } else if (creationMode === 'assistant') {
      const agent = allAgents.find(a => a.id === selectedAgent);
      content = `DOCUMENTO JURÍDICO GERADO

Criado com o modelo: ${agent?.name || 'Modelo selecionado'}
Especialidade: ${agent?.theme || 'Não especificado'}

Este documento foi elaborado com base nas suas instruções e nos documentos anexados.

SUAS INSTRUÇÕES:
${instructions}

DOCUMENTOS ANALISADOS:
${supportFiles.length > 0 ? supportFiles.map(f => `- ${f.name}`).join('\n') : 'Nenhum documento anexado.'}

${templateFile ? `MODELO USADO COMO REFERÊNCIA: ${templateFile.name}` : ''}

1. CONSIDERAÇÕES INICIAIS
Com base na análise dos documentos anexados e no conhecimento jurídico especializado...

2. FUNDAMENTAÇÃO JURÍDICA
${instructions || 'Análise jurídica detalhada será desenvolvida conforme o caso específico...'}

3. CONCLUSÃO
Pelos fundamentos expostos, conclui-se que...

${strictMode && templateFile ? '\n[Documento criado seguindo rigorosamente o modelo fornecido]' : ''}

---
Documento criado automaticamente pelo LexAI`;
    } else {
      const prompt = PREDEFINED_PROMPTS.find(p => p.id === selectedPromptId);
      content = `${prompt?.name.toUpperCase() || 'DOCUMENTO JURÍDICO'}

Tipo de documento: ${prompt?.name || 'Documento personalizado'}

${additionalInstructions ? `SUAS INSTRUÇÕES:\n${additionalInstructions}\n` : ''}

DOCUMENTOS ANALISADOS:
${supportFiles.length > 0 ? supportFiles.map(f => `- ${f.name}`).join('\n') : 'Nenhum documento anexado.'}

${templateFile ? `MODELO USADO COMO REFERÊNCIA: ${templateFile.name}` : ''}

1. CONSIDERAÇÕES INICIAIS
Este documento foi elaborado seguindo os padrões para ${prompt?.name.toLowerCase() || 'documentos jurídicos'}...

2. DESENVOLVIMENTO
${additionalInstructions || 'Conteúdo será desenvolvido conforme suas especificações...'}

3. FUNDAMENTAÇÃO JURÍDICA
Com base na doutrina e jurisprudência aplicáveis...

4. CONCLUSÃO
Pelos fundamentos expostos...

${strictMode && templateFile ? '\n[Documento criado seguindo rigorosamente o modelo fornecido]' : ''}

---
Documento criado automaticamente pelo LexAI`;
    }
    
    setGeneratedContent(content);
  };

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
  };

  const handleAdvancedPromptSelect = (prompt: AdvancedPrompt) => {
    setSelectedAdvancedPrompt(prompt);
  };

  const handleAdvancedPromptFavorite = (promptId: string) => {
    // Handle favorite logic
    console.log('Favoriting prompt:', promptId);
  };

  const handleAdvancedPromptUse = (promptId: string) => {
    const prompt = mockAdvancedPrompts.find(p => p.id === promptId);
    if (prompt) {
      setSelectedAdvancedPrompt(prompt);
    }
  };

  const canProceedStep1 = creationMode !== "";
  const canProceedStep2 = creationMode === 'assistant' ? selectedAgent : 
                          creationMode === 'advanced' ? selectedAdvancedPrompt : 
                          selectedPromptId;
  const canProceedStep3 = creationMode === 'assistant' ? instructions.trim() : true;
  const canGenerate = currentStep === 4;

  const steps = [
    { number: 1, title: "Como vamos fazer?", description: "Escolha o método", icon: MessageCircle },
    { 
      number: 2, 
      title: creationMode === 'assistant' ? "Qual modelo usar?" : 
             creationMode === 'advanced' ? "Qual prompt avançado?" : 
             "Que tipo de documento?", 
      description: "Selecione a opção", 
      icon: creationMode === 'assistant' ? Bot : 
            creationMode === 'advanced' ? Database : 
            FileText 
    },
    { number: 3, title: "Me conte os detalhes", description: "Explique o que precisa", icon: MessageCircle },
    { number: 4, title: "Documentos extras", description: "Anexos opcionais", icon: FileText }
  ];

  return (
    <div>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vamos criar seu documento</h1>
            <p className="text-gray-600">
              Te guio passo a passo para fazer exatamente o que você precisa
            </p>
          </div>
        </div>

        {/* Progress Visual Simplificado */}
        <div className="relative">
          <div className="flex items-center justify-between mb-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                      {currentStep === step.number && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Sparkles className="h-2 w-2 text-yellow-800" />
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-3">
                      <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-6 rounded-full ${
                      currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="h-fit">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-8 w-8 text-blue-600" })}
              </div>
              <CardTitle className="text-2xl text-gray-900">
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Step 1: Creation Mode */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <Label className="text-lg text-gray-900">Como você prefere trabalhar?</Label>
                  <div className="space-y-4">
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                        creationMode === 'assistant' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCreationMode('assistant')}
                    >
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">Usar um Modelo Inteligente</h3>
                          <p className="text-gray-600">
                            Escolha um modelo que já sabe como fazer o que você precisa
                          </p>
                          <p className="text-sm text-blue-600 mt-2">💡 Recomendado para quem já tem modelos</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                        creationMode === 'advanced' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCreationMode('advanced')}
                    >
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Database className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">Prompts Avançados (NOVO)</h3>
                          <p className="text-gray-600">
                            Use prompts inteligentes com IA avançada e análise jurisprudencial
                          </p>
                          <p className="text-sm text-purple-600 mt-2">🚀 Máxima qualidade e precisão</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                        creationMode === 'template' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCreationMode('template')}
                    >
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">Começar do Zero</h3>
                          <p className="text-gray-600">
                            Escolha o tipo de documento e eu te ajudo a criar
                          </p>
                          <p className="text-sm text-green-600 mt-2">⚡ Perfeito para iniciantes</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 2: Selection */}
              {currentStep === 2 && creationMode === 'assistant' && (
                <div className="space-y-6">
                  <Label htmlFor="agent" className="text-lg text-gray-900">Qual modelo você quer usar?</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="h-14 text-left">
                      <SelectValue placeholder="Escolha um modelo que se encaixa no que você precisa" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="official-header" disabled className="text-xs font-medium text-gray-500 bg-gray-50">
                        🏆 MODELOS OFICIAIS (RECOMENDADOS)
                      </SelectItem>
                      {officialAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id} className="py-3">
                          <div className="flex items-center gap-3">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <div>
                              <div className="font-medium">{agent.name}</div>
                              <div className="text-sm text-gray-500">{agent.theme}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      {workspaceAgents.length > 0 && (
                        <>
                          <SelectItem value="my-agents-header" disabled className="text-xs font-medium text-gray-500 bg-gray-50 mt-2">
                            👤 MEUS MODELOS PERSONALIZADOS
                          </SelectItem>
                          {workspaceAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id} className="py-3">
                              <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-blue-500" />
                                <div>
                                  <div className="font-medium">{agent.name}</div>
                                  <div className="text-sm text-gray-500">{agent.theme}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 2 && creationMode === 'advanced' && (
                <div className="space-y-6">
                  <Label className="text-lg text-gray-900">Escolha um prompt avançado:</Label>
                  <div className="max-h-96 overflow-y-auto">
                    <PromptMarketplace
                      prompts={mockAdvancedPrompts}
                      categories={mockCategories}
                      onPromptSelect={handleAdvancedPromptSelect}
                      onPromptFavorite={handleAdvancedPromptFavorite}
                      onPromptUse={handleAdvancedPromptUse}
                    />
                  </div>
                  {selectedAdvancedPrompt && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900">Selecionado: {selectedAdvancedPrompt.title}</h4>
                      <p className="text-sm text-purple-700 mt-1">{selectedAdvancedPrompt.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Complexidade: {selectedAdvancedPrompt.metadata.complexity}/10
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Sucesso: {(selectedAdvancedPrompt.analytics.successRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && creationMode === 'template' && (
                <div className="space-y-6">
                  <Label className="text-lg text-gray-900">Que tipo de documento você precisa?</Label>
                  <PromptGrid 
                    selectedPromptId={selectedPromptId}
                    onPromptSelect={handlePromptSelect}
                  />
                </div>
              )}

              {/* Step 3: Instructions */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {creationMode === 'assistant' ? (
                    <>
                      <Label htmlFor="instructions" className="text-lg text-gray-900">
                        Agora me conte: o que exatamente você precisa?
                      </Label>
                      <Textarea
                        id="instructions"
                        placeholder="Exemplo: Meu cliente João da Silva quer processar a empresa ABC Ltda por danos morais. Ele comprou um produto no valor de R$ 1.500 que veio com defeito e a empresa se recusou a trocar. Quero pedir indenização de R$ 10.000..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={8}
                        className="resize-none text-base"
                      />
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>💡 Dica:</strong> Quanto mais detalhes você me der, melhor será o documento. 
                          Inclua nomes, valores, datas e o que aconteceu.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="additional-instructions" className="text-lg text-gray-900">
                        {creationMode === 'advanced' 
                          ? 'Instruções específicas para o prompt avançado:'
                          : 'Há algo específico que deve aparecer no documento?'
                        }
                      </Label>
                      <Textarea
                        id="additional-instructions"
                        placeholder={
                          creationMode === 'advanced'
                            ? "Forneça detalhes específicos do caso: nomes das partes, valores, datas, fatos relevantes..."
                            : "Exemplo: Preciso mencionar o artigo 6º da Lei de Improbidade e que o réu já foi processado antes pela empresa XYZ em 2020..."
                        }
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        rows={8}
                        className="resize-none text-base"
                      />
                      <div className={`p-4 rounded-lg ${creationMode === 'advanced' ? 'bg-purple-50' : 'bg-green-50'}`}>
                        <p className={`text-sm ${creationMode === 'advanced' ? 'text-purple-800' : 'text-green-800'}`}>
                          <strong>💡 Dica:</strong> {
                            creationMode === 'advanced'
                              ? 'O prompt avançado utilizará IA para analisar jurisprudência automaticamente. Forneça os detalhes do caso.'
                              : 'Se você não tem certeza, pode deixar em branco. Eu crio um documento padrão baseado no tipo escolhido.'
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: File Upload */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Quer anexar algum documento?
                    </h3>
                    <p className="text-gray-600">
                      Isso é opcional, mas pode ajudar a criar um documento ainda melhor
                    </p>
                  </div>
                  <FileUploadModern
                    onFilesChange={setSupportFiles}
                    maxFiles={10}
                    maxSize={50}
                    enableOCR={true}
                    enablePreview={true}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6">
                {currentStep > 1 && (
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && !canProceedStep1) ||
                      (currentStep === 2 && !canProceedStep2) ||
                      (currentStep === 3 && !canProceedStep3)
                    }
                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleGenerate}
                    disabled={!canGenerate || isGenerating}
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Criando seu documento...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Criar Meu Documento
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {isGenerating && (
              <GenerationProgress
                isGenerating={isGenerating}
                onComplete={handleGenerationComplete}
              />
            )}

            <ExpandableDocument
              content={generatedContent}
              onContentChange={setGeneratedContent}
              title={documentTitle || "Seu Documento"}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
