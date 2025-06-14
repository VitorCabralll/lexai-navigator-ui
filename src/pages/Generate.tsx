
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Download, Copy, Bot, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { FileUpload } from "@/components/FileUpload";
import { GenerationProgress } from "@/components/GenerationProgress";
import { CommandInput } from "@/components/CommandInput";

export default function Generate() {
  const { agents, officialAgents, selectedWorkspace } = useWorkspace();
  const [mode, setMode] = useState<"agent" | "prompt">("agent");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [instructions, setInstructions] = useState("");
  const [promptCommand, setPromptCommand] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [strictMode, setStrictMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const workspaceAgents = selectedWorkspace ? agents.filter(a => a.workspaceId === selectedWorkspace.id) : [];
  const allAgents = [...officialAgents, ...workspaceAgents];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent("");
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    // Simulate document generation
    setGeneratedContent(`
DOCUMENTO JURÍDICO GERADO

${mode === 'agent' ? 
  `Gerado usando o agente: ${allAgents.find(a => a.id === selectedAgent)?.name || 'Agente selecionado'}` :
  `Gerado usando prompt predefinido`
}

Este documento foi elaborado com base nas instruções fornecidas e nos documentos anexados.

CONTEÚDO PRINCIPAL:

1. CONSIDERAÇÕES INICIAIS
${instructions || promptCommand}

2. FUNDAMENTAÇÃO JURÍDICA
Com base na análise dos documentos anexados e na jurisprudência aplicável...

3. CONCLUSÃO
Pelos fundamentos expostos, conclui-se que...

${strictMode ? '\n[Documento gerado em MODO RIGOROSO - seguindo exatamente o modelo fornecido]' : ''}

---
Documento gerado automaticamente pelo LexAI
    `);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handlePromptSelect = (promptId: string, message: string) => {
    setSelectedPromptId(promptId);
  };

  const canGenerate = mode === 'agent' ? selectedAgent && instructions : promptCommand;

  return (
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
        <Card>
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
            <Tabs value={mode} onValueChange={(value) => setMode(value as "agent" | "prompt")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="agent" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Usar Agente
                </TabsTrigger>
                <TabsTrigger value="prompt" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Prompt Predefinido
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agent" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent">Selecionar Agente Inteligente</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um agente do seu ambiente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem disabled className="text-xs font-medium">
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
                          <SelectItem disabled className="text-xs font-medium mt-2">
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
              </TabsContent>

              <TabsContent value="prompt" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-command">Comando e Instruções</Label>
                  <CommandInput
                    value={promptCommand}
                    onChange={setPromptCommand}
                    onPromptSelect={handlePromptSelect}
                    placeholder="Digite / para ver prompts disponíveis ou escreva suas instruções..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Use comandos como /parecer, /petição, /contrato seguidos de suas instruções
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <FileUpload
              onFilesChange={setUploadedFiles}
              onStrictModeChange={setStrictMode}
              strictMode={strictMode}
            />

            <Button 
              onClick={handleGenerate} 
              disabled={!canGenerate || isGenerating}
              className="w-full"
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

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Documento Gerado</CardTitle>
                  <CardDescription>
                    Resultado da geração com IA
                  </CardDescription>
                </div>
                {generatedContent && !isGenerating && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-96">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>O documento gerado aparecerá aqui</p>
                  <p className="text-sm">Configure os parâmetros e clique em "Gerar Documento"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
