import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, FileText, Bot, Zap } from "lucide-react";
import { Link } from "react-router-dom";
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
  const { agents, officialAgents, selectedWorkspace } = useWorkspace();
  const [mode, setMode] = useState<"agent" | "prompt">("agent");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [supportFiles, setSupportFiles] = useState<UploadedFile[]>([]);
  const [templateFile, setTemplateFile] = useState<UploadedFile | null>(null);
  const [strictMode, setStrictMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");

  const workspaceAgents = selectedWorkspace ? agents.filter(a => a.workspaceId === selectedWorkspace.id) : [];
  const allAgents = [...officialAgents, ...workspaceAgents];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    // Set document title based on mode
    if (mode === 'prompt' && selectedPromptId) {
      const prompt = PREDEFINED_PROMPTS.find(p => p.id === selectedPromptId);
      setDocumentTitle(prompt?.name || 'Documento Jurídico');
    } else if (mode === 'agent' && selectedAgent) {
      const agent = allAgents.find(a => a.id === selectedAgent);
      setDocumentTitle(`Documento - ${agent?.name || 'Agente'}`);
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    
    // Generate content based on mode
    let content = '';
    if (mode === 'agent') {
      const agent = allAgents.find(a => a.id === selectedAgent);
      content = `DOCUMENTO JURÍDICO GERADO

Gerado usando o agente: ${agent?.name || 'Agente selecionado'}
Tema: ${agent?.theme || 'Não especificado'}

Este documento foi elaborado com base nas instruções fornecidas e nos documentos anexados.

INSTRUÇÕES DE AJUSTE FINO:
${instructions}

DOCUMENTOS DE APOIO ANALISADOS:
${supportFiles.length > 0 ? supportFiles.map(f => `- ${f.name}`).join('\n') : 'Nenhum documento de apoio fornecido.'}

${templateFile ? `MODELO DE REFERÊNCIA UTILIZADO: ${templateFile.name}` : ''}

1. CONSIDERAÇÕES INICIAIS
Com base na análise dos documentos anexados e no conhecimento jurídico especializado...

2. FUNDAMENTAÇÃO JURÍDICA
${instructions || 'Análise jurídica detalhada será desenvolvida conforme o caso específico...'}

3. CONCLUSÃO
Pelos fundamentos expostos, conclui-se que...

${strictMode && templateFile ? '\n[Documento gerado em MODO RIGOROSO - seguindo exatamente o modelo fornecido]' : ''}

---
Documento gerado automaticamente pelo LexAI usando agente inteligente`;
    } else {
      const prompt = PREDEFINED_PROMPTS.find(p => p.id === selectedPromptId);
      content = `${prompt?.name.toUpperCase() || 'DOCUMENTO JURÍDICO'}

Tipo: ${prompt?.name || 'Documento personalizado'}

${additionalInstructions ? `INSTRUÇÕES ADICIONAIS:\n${additionalInstructions}\n` : ''}

DOCUMENTOS DE APOIO ANALISADOS:
${supportFiles.length > 0 ? supportFiles.map(f => `- ${f.name}`).join('\n') : 'Nenhum documento de apoio fornecido.'}

${templateFile ? `MODELO DE REFERÊNCIA UTILIZADO: ${templateFile.name}` : ''}

1. CONSIDERAÇÕES INICIAIS
Este documento foi elaborado seguindo os padrões específicos para ${prompt?.name.toLowerCase() || 'documentos jurídicos'}...

2. DESENVOLVIMENTO
${additionalInstructions || 'Conteúdo será desenvolvido conforme as especificações técnicas...'}

3. FUNDAMENTAÇÃO JURÍDICA
Com base na doutrina e jurisprudência aplicáveis...

4. CONCLUSÃO
Pelos fundamentos expostos...

${strictMode && templateFile ? '\n[Documento gerado em MODO RIGOROSO - seguindo exatamente o modelo fornecido]' : ''}

---
Documento gerado automaticamente pelo LexAI`;
    }
    
    setGeneratedContent(content);
  };

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
  };

  const canGenerate = mode === 'agent' ? selectedAgent && instructions : selectedPromptId;

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
            <h1 className="text-3xl font-bold">Gerar Documento Jurídico</h1>
            <p className="text-muted-foreground">
              Use agentes inteligentes ou prompts predefinidos para criar documentos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuração do Documento
              </CardTitle>
              <CardDescription>
                Escolha como gerar seu documento jurídico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection with Radio Group */}
              <div className="space-y-3">
                <Label>Modo de Geração</Label>
                <RadioGroup value={mode} onValueChange={(value) => setMode(value as "agent" | "prompt")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agent" id="agent" />
                    <Label htmlFor="agent" className="flex items-center gap-2 cursor-pointer">
                      <Bot className="h-4 w-4" />
                      Usar Agente Inteligente
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prompt" id="prompt" />
                    <Label htmlFor="prompt" className="flex items-center gap-2 cursor-pointer">
                      <Zap className="h-4 w-4" />
                      Usar Prompt Predefinido
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {mode === "agent" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent">Selecionar Agente Inteligente</Label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um agente do seu ambiente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="official-header" disabled className="text-xs font-medium">
                          AGENTES OFICIAIS
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
                              MEUS AGENTES
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

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instruções de Ajuste Fino</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Adicione instruções específicas para complementar o prompt do agente..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Estas instruções complementam o prompt mestre do agente selecionado
                    </p>
                  </div>
                </div>
              )}

              {mode === "prompt" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selecione o Tipo de Documento</Label>
                    <PromptGrid 
                      selectedPromptId={selectedPromptId}
                      onPromptSelect={handlePromptSelect}
                    />
                  </div>

                  {selectedPromptId && (
                    <div className="space-y-2">
                      <Label htmlFor="additional-instructions">Instruções Adicionais</Label>
                      <Textarea
                        id="additional-instructions"
                        placeholder="Exemplo: Trate do art. 6º da Lei de Improbidade e relacione ao caso da empresa X..."
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Instruções específicas para ajustar o documento às suas necessidades
                      </p>
                    </div>
                  )}
                </div>
              )}

              <FileUpload
                onSupportFilesChange={setSupportFiles}
                onTemplateFileChange={setTemplateFile}
                onStrictModeChange={setStrictMode}
                strictMode={strictMode}
              />

              <Button 
                onClick={handleGenerate} 
                disabled={!canGenerate || isGenerating}
                className="w-full transition-all hover:scale-105"
                size="lg"
              >
                {isGenerating ? "Gerando..." : "Gerar Documento com IA"}
              </Button>
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
              title={documentTitle || "Documento Jurídico"}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
