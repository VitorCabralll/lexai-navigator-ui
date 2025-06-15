import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, FileText, Bot, Zap, CheckCircle, MessageCircle, Sparkles, Crown, Users, Heart, Star, Coffee, Clock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { FileUpload } from "@/components/FileUpload";
import { GenerationProgress } from "@/components/GenerationProgress";
import { PromptGrid } from "@/components/PromptGrid";
import { ExpandableDocument } from "@/components/ExpandableDocument";
import { PREDEFINED_PROMPTS } from "@/types/prompts";
import { Toaster } from "@/components/ui/toaster";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

export default function Generate() {
  const [searchParams] = useSearchParams();
  const { agents, officialAgents, selectedWorkspace } = useWorkspace();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMode, setCreationMode] = useState<"assistant" | "template" | "">(
    searchParams.get('agent') ? "assistant" : searchParams.get('type') ? "template" : ""
  );
  const [selectedAgent, setSelectedAgent] = useState(searchParams.get('agent') || "");
  const [instructions, setInstructions] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState(searchParams.get('type') || "");
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
    if (creationMode === 'template' && selectedPromptId) {
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
    if (creationMode === 'assistant') {
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

  const canProceedStep1 = creationMode !== "";
  const canProceedStep2 = creationMode === 'assistant' ? selectedAgent : selectedPromptId;
  const canProceedStep3 = creationMode === 'assistant' ? instructions.trim() : true;
  const canGenerate = currentStep === 4;

  const steps = [
    { number: 1, title: "Como vamos fazer?", description: "Escolha o método", icon: MessageCircle, emoji: "🤔" },
    { number: 2, title: creationMode === 'assistant' ? "Qual especialista?" : "Que tipo de documento?", description: "Selecione a opção", icon: creationMode === 'assistant' ? Bot : FileText, emoji: creationMode === 'assistant' ? "👨‍💼" : "📄" },
    { number: 3, title: "Me conte os detalhes", description: "Explique sua situação", icon: MessageCircle, emoji: "💬" },
    { number: 4, title: "Documentos extras", description: "Anexos opcionais", icon: FileText, emoji: "📎" }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header conversacional */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100 rounded-full">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Vamos criar algo incrível juntos! ✨</h1>
                <p className="text-gray-600 text-lg">
                  Te guio passo a passo para fazer exatamente o que você precisa
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>≈ 3 min para concluir</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Progress Visual Humanizado */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-lg transition-all ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-110' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="h-8 w-8" />
                      ) : (
                        <span className="text-2xl">{step.emoji}</span>
                      )}
                      {currentStep === step.number && (
                        <>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-yellow-800" />
                          </div>
                          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-25 animate-ping"></div>
                        </>
                      )}
                    </div>
                    <div className="text-center mt-4 max-w-32">
                      <p className={`text-sm font-semibold ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-2 mx-6 rounded-full transition-all ${
                      currentStep > step.number 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card Principal - Design Conversacional */}
            <Card className="h-fit shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2"></div>
              <CardHeader className="text-center pb-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                  {steps[currentStep - 1].emoji}
                </div>
                <CardTitle className="text-3xl text-gray-900 mb-3">
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  {steps[currentStep - 1].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Step 1: Creation Mode - Mais Visual */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Como você prefere trabalhar?</h3>
                      <p className="text-gray-600">Escolha a opção que mais faz sentido para você</p>
                    </div>
                    <div className="space-y-6">
                      <Card 
                        className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 ${
                          creationMode === 'assistant' ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setCreationMode('assistant')}
                      >
                        <CardContent className="p-8 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                            👨‍💼
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 mb-3">Usar um Especialista</h3>
                          <p className="text-gray-600 mb-4">
                            Escolha um especialista que já sabe exatamente como fazer o que você precisa
                          </p>
                          <div className="bg-blue-100 px-4 py-2 rounded-full inline-block">
                            <p className="text-sm text-blue-800 font-medium">💡 Recomendado se você tem pressa</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 ${
                          creationMode === 'template' ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setCreationMode('template')}
                      >
                        <CardContent className="p-8 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                            ⚡
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 mb-3">Começar do Zero</h3>
                          <p className="text-gray-600 mb-4">
                            Me diga o que você quer e eu te ajudo a criar passo a passo
                          </p>
                          <div className="bg-green-100 px-4 py-2 rounded-full inline-block">
                            <p className="text-sm text-green-800 font-medium">⚡ Perfeito se você está começando</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Step 2: Agent/Template Selection */}
                {currentStep === 2 && creationMode === 'assistant' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Qual especialista você quer usar?</h3>
                      <p className="text-gray-600">Cada um tem suas próprias habilidades e conhecimentos</p>
                    </div>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger className="h-16 text-left border-2 hover:border-blue-300 transition-colors">
                        <SelectValue placeholder="Clique aqui para ver os especialistas disponíveis 👇" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-80">
                        <div className="p-2">
                          <div className="text-xs font-bold text-gray-500 bg-yellow-50 p-2 rounded mb-2 flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-600" />
                            ESPECIALISTAS OFICIAIS (OS MELHORES!)
                          </div>
                          {officialAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id} className="py-4 hover:bg-blue-50">
                              <div className="flex items-center gap-4 w-full">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl">
                                  👑
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{agent.name}</div>
                                  <div className="text-sm text-gray-600">{agent.theme}</div>
                                </div>
                                <Star className="h-5 w-5 text-yellow-500" />
                              </div>
                            </SelectItem>
                          ))}
                          {workspaceAgents.length > 0 && (
                            <>
                              <div className="text-xs font-bold text-gray-500 bg-blue-50 p-2 rounded mb-2 mt-4 flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                MEUS ESPECIALISTAS PERSONALIZADOS
                              </div>
                              {workspaceAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id} className="py-4 hover:bg-blue-50">
                                  <div className="flex items-center gap-4 w-full">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl">
                                      👤
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900">{agent.name}</div>
                                      <div className="text-sm text-gray-600">{agent.theme}</div>
                                    </div>
                                    <Heart className="h-5 w-5 text-red-500" />
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentStep === 2 && creationMode === 'template' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Que tipo de documento você precisa?</h3>
                      <p className="text-gray-600">Escolha o que mais se parece com o que você quer fazer</p>
                    </div>
                    <PromptGrid 
                      selectedPromptId={selectedPromptId}
                      onPromptSelect={handlePromptSelect}
                    />
                  </div>
                )}

                {/* Step 3: Instructions - Mais Conversacional */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    {creationMode === 'assistant' ? (
                      <>
                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Agora me conte: qual é a sua situação? 🤔
                          </h3>
                          <p className="text-gray-600">
                            Quanto mais detalhes você me der, melhor será o documento
                          </p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              L
                            </div>
                            <div className="flex-1">
                              <p className="text-blue-900 font-medium mb-2">Como posso te ajudar melhor?</p>
                              <p className="text-blue-800 text-sm">
                                Me conte nomes, valores, datas e o que aconteceu. Pense como se estivesse contando para um amigo advogado.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Textarea
                          id="instructions"
                          placeholder="Exemplo: Meu cliente João da Silva quer processar a empresa ABC Ltda por danos morais. Ele comprou um produto no valor de R$ 1.500 que veio com defeito e a empresa se recusou a trocar. Queremos pedir indenização de R$ 10.000..."
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          rows={8}
                          className="resize-none text-base border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Há algo específico que deve aparecer? 📝
                          </h3>
                          <p className="text-gray-600">
                            Se você não tem certeza, pode deixar em branco mesmo!
                          </p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                              💡
                            </div>
                            <div className="flex-1">
                              <p className="text-green-900 font-medium mb-2">Dica especial</p>
                              <p className="text-green-800 text-sm">
                                Se você não souber o que escrever, pode deixar vazio. Eu crio um documento padrão baseado no tipo escolhido!
                              </p>
                            </div>
                          </div>
                        </div>
                        <Textarea
                          id="additional-instructions"
                          placeholder="Exemplo: Preciso mencionar o artigo 6º da Lei de Improbidade e que o réu já foi processado antes pela empresa XYZ em 2020..."
                          value={additionalInstructions}
                          onChange={(e) => setAdditionalInstructions(e.target.value)}
                          rows={8}
                          className="resize-none text-base border-2 hover:border-green-300 focus:border-green-500 transition-colors"
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Step 4: File Upload - Mais Amigável */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Quer anexar algum documento? 📎
                      </h3>
                      <p className="text-gray-600 text-lg">
                        Isso é <strong>totalmente opcional</strong>, mas pode deixar seu documento ainda mais completo
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                      <div className="flex items-center gap-4 mb-4">
                        <Coffee className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="text-yellow-900 font-semibold">Relaxa! 😌</p>
                          <p className="text-yellow-800 text-sm">
                            Se você não tem nenhum documento para anexar, pode pular esta etapa. Eu crio algo incrível mesmo assim!
                          </p>
                        </div>
                      </div>
                    </div>
                    <FileUpload
                      onSupportFilesChange={setSupportFiles}
                      onTemplateFileChange={setTemplateFile}
                      onStrictModeChange={setStrictMode}
                      strictMode={strictMode}
                    />
                  </div>
                )}

                {/* Navigation Buttons - Mais Amigáveis */}
                <div className="flex gap-4 pt-8 border-t border-gray-100">
                  {currentStep > 1 && (
                    <Button 
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-14 text-lg border-2 hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-3 h-5 w-5" />
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
                      className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                    >
                      Continuar
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleGenerate}
                      disabled={!canGenerate || isGenerating}
                      className="flex-1 h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Criando sua obra-prima...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-5 w-5" />
                          Criar Meu Documento Incrível!
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Section - Mais Visual */}
            <div className="space-y-6">
              {isGenerating && (
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2"></div>
                  <GenerationProgress
                    isGenerating={isGenerating}
                    onComplete={handleGenerationComplete}
                  />
                </Card>
              )}

              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2"></div>
                <ExpandableDocument
                  content={generatedContent}
                  onContentChange={setGeneratedContent}
                  title={documentTitle || "Seu Documento Aparecerá Aqui"}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
