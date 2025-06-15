
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Bot, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { LEGAL_SUBJECTS } from "@/types/legalSubjects";

export default function CreateAgent() {
  const [agentName, setAgentName] = useState("");
  const [agentTheme, setAgentTheme] = useState("");
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
            <h2 className="text-xl font-bold mb-2">Nenhum ambiente selecionado</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa ter um ambiente ativo para criar agentes
            </p>
            <Button asChild>
              <Link to="/workspace">Gerenciar Ambientes</Link>
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
    if (!agentName.trim() || !agentTheme.trim() || !selectedFile) return;

    setIsAnalyzing(true);
    setStep(2);

    // Simular análise do documento
    setTimeout(() => {
      const newAgent = {
        id: `agent-${Date.now()}`,
        name: agentName,
        type: agentTheme,
        theme: `Especializado em ${agentTheme.toLowerCase()}`,
        isOfficial: false,
        workspaceId: selectedWorkspace.id,
        createdAt: new Date().toLocaleDateString()
      };

      addAgent(newAgent);

      toast({
        title: "Agente criado com sucesso!",
        description: `${agentName} foi criado e está pronto para uso`,
      });

      navigate(`/dashboard?workspace=${selectedWorkspace.id}`);
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
            <h2 className="text-xl font-bold">Analisando documento...</h2>
            <p className="text-muted-foreground">
              Nossa IA está analisando seu modelo e criando o agente personalizado
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
          <h1 className="text-3xl font-bold">Criar Agente</h1>
          <p className="text-muted-foreground">
            Ambiente: <span className="font-medium">{selectedWorkspace.name}</span>
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Novo Agente de IA</CardTitle>
          <CardDescription>
            Anexe um modelo de documento e nossa IA criará um agente especializado automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload do arquivo */}
            <div className="space-y-2">
              <Label htmlFor="document">Modelo de Documento (.docx)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                        Arquivo selecionado com sucesso
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="font-medium">Clique para selecionar arquivo</p>
                      <p className="text-sm text-muted-foreground">
                        Anexe um modelo de parecer, petição ou outro documento
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Nome do agente */}
            <div className="space-y-2">
              <Label htmlFor="agent-name">Nome do Agente</Label>
              <Input
                id="agent-name"
                placeholder="Ex: Parecer Ambiental, Denúncia Criminal..."
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
            </div>

            {/* Tema/Especialidade com Select */}
            <div className="space-y-2">
              <Label htmlFor="agent-theme">Matéria Jurídica</Label>
              <Select value={agentTheme} onValueChange={setAgentTheme} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a matéria jurídica" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {LEGAL_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={!agentName.trim() || !agentTheme.trim() || !selectedFile}
                className="flex-1"
              >
                <Bot className="mr-2 h-4 w-4" />
                Criar Agente
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Informações sobre o processo */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <p className="text-sm">Anexe um modelo de documento (.docx)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600">2</span>
            </div>
            <p className="text-sm">Nossa IA analisa a estrutura e conteúdo</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600">3</span>
            </div>
            <p className="text-sm">O agente é criado automaticamente e fica pronto para uso</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
