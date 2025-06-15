
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Bot, CheckCircle, Building2 } from "lucide-react";
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
          <CardContent className="pt-6 text-center space-y-4">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto" />
            <h2 className="text-xl font-medium">Configure seu escritório</h2>
            <p className="text-gray-600">
              Você precisa ter um escritório ativo para criar modelos
            </p>
            <Button asChild className="w-full">
              <Link to="/workspace">Configurar Escritório</Link>
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
        title: "Arquivo não compatível",
        description: "Por favor, escolha um arquivo .docx (Word)",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !agentTheme || !selectedFile) return;

    setIsAnalyzing(true);
    setStep(2);

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
        title: "Modelo criado com sucesso",
        description: `${agentName} está pronto para uso`,
      });

      navigate(`/dashboard?workspace=${selectedWorkspace!.id}`);
    }, 3000);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-6">
            <Bot className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-xl font-medium">Analisando documento...</h2>
              <p className="text-gray-600">
                Processando seu modelo para criar novos documentos
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
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
          <h1 className="text-2xl font-medium">Criar Modelo</h1>
          <p className="text-gray-600">
            Escritório: <span className="font-medium">{selectedWorkspace?.name}</span>
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Novo modelo personalizado</CardTitle>
          <CardDescription>
            Envie um documento para criar um modelo similar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document">Documento modelo</Label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
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
                      <p className="font-medium text-green-900">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="font-medium">Clique para escolher arquivo</p>
                      <p className="text-sm text-gray-600">Apenas arquivos .docx</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-name">Nome do modelo</Label>
              <Input
                id="agent-name"
                placeholder="Ex: Modelo de Petições Trabalhistas"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-theme">Área jurídica</Label>
              <Select value={agentTheme} onValueChange={(value: LegalSubject) => setAgentTheme(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha a área jurídica" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60">
                  {LEGAL_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={!agentName.trim() || !agentTheme || !selectedFile}
                className="flex-1"
              >
                Criar Modelo
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
