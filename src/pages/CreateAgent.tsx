
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Bot, CheckCircle, Lightbulb } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { LEGAL_SUBJECTS, LegalSubject } from "@/types/legalSubjects";

export default function CreateAgent() {
  const [agentName, setAgentName] = useState("");
  const [agentTheme, setAgentTheme] = useState<LegalSubject | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedWorkspace, addAgent } = useWorkspace();

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Nenhuma área selecionada</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa ter uma área de trabalho ativa para criar assistentes
            </p>
            <Button asChild>
              <Link to="/workspace">Gerenciar Áreas de Trabalho</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo .docx",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !agentTheme || !selectedFile) return;

    setIsAnalyzing(true);
    setStep(2);

    // Simular análise do documento
    setTimeout(() => {
      const newAgent = {
        id: `agent-${Date.now()}`,
        name: agentName,
        type: agentTheme as LegalSubject,
        theme: `Especializado em ${agentTheme.toLowerCase()}`,
        isOfficial: false,
        workspaceId: selectedWorkspace!.id,
        createdAt: new Date().toLocaleDateString()
      };

      addAgent(newAgent);

      toast({
        title: "Assistente criado com sucesso!",
        description: `${agentName} foi criado e está pronto para uso`,
      });

      navigate(`/dashboard?workspace=${selectedWorkspace!.id}`);
    }, 3000);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold">Analisando seu documento...</h2>
            <p className="text-muted-foreground">
              Nossa inteligência artificial está estudando seu modelo e criando o assistente personalizado
            </p>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Isso pode levar alguns segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Criar Assistente Inteligente</h1>
          <p className="text-muted-foreground">
            Área atual: <span className="font-medium">{selectedWorkspace?.name}</span>
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Novo Assistente Personalizado</CardTitle>
          <CardDescription>
            Anexe um modelo de documento e nossa IA criará um assistente especializado automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload do arquivo */}
            <div className="space-y-2">
              <Label htmlFor="document">Seu Modelo de Documento (.docx)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="document"
                  accept=".docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="document" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Arquivo carregado com sucesso! 
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="font-medium">Clique para escolher seu arquivo</p>
                      <p className="text-sm text-muted-foreground">
                        Anexe um modelo de petição, parecer, contrato ou outro documento que você usa
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Nome do assistente */}
            <div className="space-y-2">
              <Label htmlFor="agent-name">Nome do Assistente</Label>
              <Input
                id="agent-name"
                placeholder="Ex: Assistente de Pareceres Ambientais, Criador de Petições Trabalhistas..."
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Dê um nome descritivo para identificar facilmente seu assistente
              </p>
            </div>

            {/* Tema/Especialidade com Select */}
            <div className="space-y-2">
              <Label htmlFor="agent-theme">Área Jurídica de Especialização</Label>
              <Select value={agentTheme} onValueChange={(value: LegalSubject) => setAgentTheme(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área de atuação" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {LEGAL_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Escolha a área jurídica principal do seu documento modelo
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={!agentName.trim() || !agentTheme || !selectedFile}
                className="flex-1"
              >
                <Bot className="mr-2 h-4 w-4" />
                Criar Meu Assistente
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Informações sobre o processo */}
      <Card className="max-w-2xl bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <Lightbulb className="h-5 w-5" />
            Como funciona?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">1</span>
            </div>
            <p className="text-sm text-blue-800">Você anexa um documento modelo (.docx) que usa frequentemente</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">2</span>
            </div>
            <p className="text-sm text-blue-800">Nossa IA analisa a estrutura, linguagem e padrões do seu documento</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">3</span>
            </div>
            <p className="text-sm text-blue-800">O assistente é criado e fica disponível para gerar documentos similares</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg mt-4">
            <p className="text-sm text-blue-800 font-medium">
              💡 Dica: Quanto melhor for seu modelo, mais preciso será o assistente!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
