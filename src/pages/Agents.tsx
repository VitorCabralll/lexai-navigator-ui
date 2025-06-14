
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bot, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Agents() {
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para criar o agente
    console.log({ agentName, agentType, description, instructions, isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Criar Agente IA</h1>
          <p className="text-muted-foreground">
            Configure um novo agente de inteligência artificial especializado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configurações do Agente
              </CardTitle>
              <CardDescription>
                Defina as características e especialidades do seu agente IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Nome do Agente</Label>
                    <Input
                      id="agent-name"
                      placeholder="Ex: Análise Contratual"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-type">Tipo de Agente</Label>
                    <Select value={agentType} onValueChange={setAgentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="analysis">Análise de Documentos</SelectItem>
                        <SelectItem value="drafting">Redação de Documentos</SelectItem>
                        <SelectItem value="research">Pesquisa Jurídica</SelectItem>
                        <SelectItem value="review">Revisão Legal</SelectItem>
                        <SelectItem value="consultation">Consultoria</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva as funcionalidades e especialidades do agente..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instruções Específicas</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Forneça instruções detalhadas sobre como o agente deve operar, que estilo usar, regulamentações a considerar, etc..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-agent"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active-agent">Agente ativo</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Criar Agente</Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/dashboard">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Dicas de Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Instruções Claras</h4>
                <p className="text-muted-foreground">
                  Seja específico sobre o comportamento esperado, formato de saída e limitações.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Contexto Legal</h4>
                <p className="text-muted-foreground">
                  Inclua informações sobre jurisdição, regulamentações aplicáveis e precedentes relevantes.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Testes</h4>
                <p className="text-muted-foreground">
                  Teste o agente com casos variados antes de usar em produção.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agentes Existentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Revisão Contratual</h4>
                <p className="text-xs text-muted-foreground">Análise de Documentos</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Ativo</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Compliance LGPD</h4>
                <p className="text-xs text-muted-foreground">Compliance</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Ativo</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Pesquisa Jurisprudencial</h4>
                <p className="text-xs text-muted-foreground">Pesquisa Jurídica</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Em configuração</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
