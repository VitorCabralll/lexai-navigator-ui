import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Bot, CheckCircle, Lightbulb, Sparkles, Crown } from "lucide-react";
import { Building2 } from "lucide-react";
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
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ops! Falta configurar algo</h2>
            <p className="text-gray-600 mb-6">
              Você precisa ter um escritório ativo para criar modelos personalizados
            </p>
            <Button asChild className="w-full">
              <Link to="/workspace">Configurar Meu Escritório</Link>
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
        title: "🎉 Modelo criado com sucesso!",
        description: `${agentName} está pronto para uso`,
      });

      navigate(`/dashboard?workspace=${selectedWorkspace!.id}`);
    }, 3000);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Bot className="h-10 w-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-6 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-yellow-800 animate-spin" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Analisando seu documento...</h2>
              <p className="text-gray-600 leading-relaxed">
                Estou estudando o seu modelo e aprendendo como fazer documentos similares
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
              <p className="text-sm text-gray-500">
                Isso pode levar alguns segundos... ⏳
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criar Modelo Personalizado</h1>
          <p className="text-gray-600">
            Escritório: <span className="font-medium text-blue-600">{selectedWorkspace?.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Vamos criar seu modelo</CardTitle>
            <CardDescription className="text-lg">
              Envie um documento que você usa e eu aprendo como fazer outros iguais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Upload do arquivo */}
              <div className="space-y-4">
                <Label htmlFor="document" className="text-lg font-medium text-gray-900">
                  Seu Documento Modelo
                </Label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  selectedFile 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
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
                      <div className="space-y-3">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <div>
                          <p className="font-semibold text-green-900">{selectedFile.name}</p>
                          <p className="text-sm text-green-700">
                            Perfeito! Arquivo carregado com sucesso 
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="font-semibold text-gray-900">Clique para escolher seu arquivo</p>
                          <p className="text-sm text-gray-600">
                            Aceito apenas arquivos .docx (Word)
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  💡 <strong>Dica:</strong> Escolha um documento que você usa frequentemente e está bem formatado
                </p>
              </div>

              {/* Nome do modelo */}
              <div className="space-y-3">
                <Label htmlFor="agent-name" className="text-lg font-medium text-gray-900">
                  Como quer chamar este modelo?
                </Label>
                <Input
                  id="agent-name"
                  placeholder="Ex: Meu Modelo de Petições Trabalhistas"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                  className="h-12 text-base"
                />
                <p className="text-sm text-gray-600">
                  Escolha um nome que te ajude a identificar facilmente
                </p>
              </div>

              {/* Área jurídica */}
              <div className="space-y-3">
                <Label htmlFor="agent-theme" className="text-lg font-medium text-gray-900">
                  Qual área jurídica?
                </Label>
                <Select value={agentTheme} onValueChange={(value: LegalSubject) => setAgentTheme(value)} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Escolha a área principal do seu documento" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {LEGAL_SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject} className="py-2">
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  Isso me ajuda a entender melhor o contexto do seu documento
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={!agentName.trim() || !agentTheme || !selectedFile}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Criar Meu Modelo
                </Button>
                <Button type="button" variant="outline" asChild className="h-12">
                  <Link to="/dashboard">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações sobre o processo */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-blue-900">
                <Lightbulb className="h-6 w-6" />
                Como isso funciona?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <p className="text-blue-800">Você envia um documento modelo (.docx) que usa frequentemente</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <p className="text-blue-800">Eu analiso a estrutura, linguagem e padrões do seu documento</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <p className="text-blue-800">O modelo fica disponível para criar documentos similares rapidamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="h-4 w-4 text-yellow-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Dica Importante</h3>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    Quanto melhor for o seu documento modelo, mais preciso será o modelo criado. 
                    Use documentos bem estruturados e completos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exemplos de bons modelos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Petição inicial completa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Parecer jurídico estruturado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Contrato padronizado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Recurso bem fundamentado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
