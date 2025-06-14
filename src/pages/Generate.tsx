
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Download, Copy } from "lucide-react";
import { Link } from "react-router-dom";

export default function Generate() {
  const [documentType, setDocumentType] = useState("");
  const [agentId, setAgentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulação de geração de documento
    setTimeout(() => {
      setGeneratedContent(`
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Este contrato é firmado entre:

CONTRATANTE: [Nome da empresa contratante]
CNPJ: [CNPJ]
Endereço: [Endereço completo]

CONTRATADA: [Nome da empresa prestadora]
CNPJ: [CNPJ]
Endereço: [Endereço completo]

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de [especificar serviços], conforme especificações detalhadas no Anexo I deste instrumento.

CLÁUSULA 2ª - DO PRAZO
O prazo de vigência deste contrato será de [período], iniciando-se em [data] e encerrando-se em [data].

CLÁUSULA 3ª - DO VALOR E FORMA DE PAGAMENTO
Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor total de R$ [valor], que será pago da seguinte forma: [condições de pagamento].

CLÁUSULA 4ª - DAS OBRIGAÇÕES DA CONTRATADA
A CONTRATADA obriga-se a:
a) Executar os serviços com diligência e qualidade;
b) Cumprir os prazos estabelecidos;
c) Manter sigilo sobre informações confidenciais.

CLÁUSULA 5ª - DAS OBRIGAÇÕES DA CONTRATANTE
A CONTRATANTE obriga-se a:
a) Efetuar os pagamentos nas datas acordadas;
b) Fornecer as informações necessárias para execução dos serviços;
c) Dar acesso aos recursos necessários.

CLÁUSULA 6ª - DA RESCISÃO
Este contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de [período].

CLÁUSULA 7ª - DO FORO
Fica eleito o foro da comarca de [cidade/estado] para dirimir quaisquer questões oriundas do presente contrato.

Local e data: ________________

_______________________        _______________________
    CONTRATANTE                    CONTRATADA
      `);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
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
          <h1 className="text-3xl font-bold">Gerar Minuta</h1>
          <p className="text-muted-foreground">
            Use a IA para gerar documentos jurídicos personalizados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configurações do Documento
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para gerar sua minuta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contrato de Prestação de Serviços</SelectItem>
                  <SelectItem value="nda">Acordo de Confidencialidade</SelectItem>
                  <SelectItem value="employment">Contrato de Trabalho</SelectItem>
                  <SelectItem value="partnership">Contrato de Sociedade</SelectItem>
                  <SelectItem value="lease">Contrato de Locação</SelectItem>
                  <SelectItem value="purchase">Contrato de Compra e Venda</SelectItem>
                  <SelectItem value="license">Contrato de Licenciamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Agente IA</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract-agent">Especialista em Contratos</SelectItem>
                  <SelectItem value="corporate-agent">Direito Empresarial</SelectItem>
                  <SelectItem value="labor-agent">Direito Trabalhista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Detalhes e Instruções</Label>
              <Textarea
                id="prompt"
                placeholder="Descreva os detalhes específicos do documento que você precisa. Inclua informações como partes envolvidas, valores, prazos, condições especiais, etc."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!documentType || !agentId || !prompt || isGenerating}
              className="w-full"
            >
              {isGenerating ? "Gerando..." : "Gerar Documento"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Documento Gerado</CardTitle>
                <CardDescription>
                  Resultado da geração com IA
                </CardDescription>
              </div>
              {generatedContent && (
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
  );
}
