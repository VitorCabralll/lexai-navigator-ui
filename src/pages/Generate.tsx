
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, FileText, Bot, Zap, CheckCircle } from "lucide-react";
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

Criado com o assistente: ${agent?.name || 'Assistente selecionado'}
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
    { number: 1, title: "Como criar?", description: "Escolha o método" },
    { number: 2, title: creationMode === 'assistant' ? "Qual assistente?" : "Que documento?", description: "Selecione a opção" },
    { number: 3, title: "Suas instruções", description: "Detalhe o que precisa" },
    { number: 4, title: "Arquivos extras", description: "Anexe documentos (opcional)" }
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Documento Jurídico</h1>
            <p className="text-muted-foreground">
              Vamos criar seu documento passo a passo
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.number ? <CheckCircle className="h-5 w-5" /> : step.number}
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Creation Mode */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <Label className="text-base">Como você gostaria de criar seu documento?</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        creationMode === 'assistant' ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setCreationMode('assistant')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Bot className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Usar Assistente Inteligente</h3>
                          <p className="text-sm text-muted-foreground">
                            Use um assistente treinado para sua área específica
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        creationMode === 'template' ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setCreationMode('template')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Zap className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-medium">Usar Modelo Pronto</h3>
                          <p className="text-sm text-muted-foreground">
                            Escolha um tipo de documento pré-configurado
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 2: Agent/Template Selection */}
              {currentStep === 2 && creationMode === 'assistant' && (
                <div className="space-y-4">
                  <Label htmlFor="agent">Qual assistente você quer usar?</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um assistente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official-header" disabled className="text-xs font-medium">
                        ASSISTENTES OFICIAIS
                      </SelectItem>
                      {officialAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              OFICIAL
                            </span>
                            {agent.name}
                          </div>
                        </SelectItem>
                      ))}
                      {workspaceAgents.length > 0 && (
                        <>
                          <SelectItem value="my-agents-header" disabled className="text-xs font-medium mt-2">
                            MEUS ASSISTENTES
                          </SelectItem>
                          {workspaceAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name} - {agent.theme}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 2 && creationMode === 'template' && (
                <div className="space-y-4">
                  <Label>Que tipo de documento você precisa?</Label>
                  <PromptGrid 
                    selectedPromptId={selectedPromptId}
                    onPromptSelect={handlePromptSelect}
                  />
                </div>
              )}

              {/* Step 3: Instructions */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {creationMode === 'assistant' ? (
                    <>
                      <Label htmlFor="instructions">Conte mais detalhes sobre o que você precisa</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Exemplo: Preciso de uma petição inicial para ação de cobrança contra a empresa X, no valor de R$ 10.000,00..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Seja específico sobre o caso, valores, partes envolvidas, etc.
                      </p>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="additional-instructions">Instruções específicas para seu documento</Label>
                      <Textarea
                        id="additional-instructions"
                        placeholder="Exemplo: Mencionar o artigo 6º da Lei de Improbidade e relacionar ao caso da empresa X..."
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Adicione detalhes específicos que devem aparecer no documento
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: File Upload */}
              {currentStep === 4 && (
                <FileUpload
                  onSupportFilesChange={setSupportFiles}
                  onTemplateFileChange={setTemplateFile}
                  onStrictModeChange={setStrictMode}
                  strictMode={strictMode}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
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
                    className="flex-1"
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleGenerate}
                    disabled={!canGenerate || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? "Criando..." : "Criar Documento"}
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
    </>
  );
}
