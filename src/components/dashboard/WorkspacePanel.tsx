
import { Button } from "@/components/ui/button";
import { AgentCard } from "./AgentCard";
import { Plus, Shield } from "lucide-react";

interface WorkspacePanelProps {
  workspaceName: string;
}

export function WorkspacePanel({ workspaceName }: WorkspacePanelProps) {
  // Dados mockados dos agentes do workspace
  const workspaceAgents = [
    {
      id: "1",
      name: "Análise de Contratos",
      type: "parecer",
      description: "Analisa contratos e identifica cláusulas problemáticas",
      lastUsed: "2 horas atrás"
    },
    {
      id: "2", 
      name: "Redação de Petições",
      type: "inicial",
      description: "Auxilia na redação de petições iniciais",
      lastUsed: "1 dia atrás"
    }
  ];

  // Agentes oficiais da empresa (estáticos)
  const officialAgents = [
    {
      id: "official-1",
      name: "Pesquisa Jurisprudencial",
      type: "pesquisa",
      description: "Busca precedentes e jurisprudência relevante",
      isOfficial: true
    },
    {
      id: "official-2",
      name: "Cálculo de Honorários",
      type: "calculo",
      description: "Calcula honorários advocatícios automaticamente",
      isOfficial: true
    },
    {
      id: "official-3",
      name: "Revisão de Documentos",
      type: "revisao",
      description: "Revisa documentos em busca de erros e inconsistências",
      isOfficial: true
    }
  ];

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{workspaceName}</h1>
        <p className="text-muted-foreground">
          Gerencie seus agentes de IA especializados para este ambiente
        </p>
      </div>

      {/* Agentes do Workspace */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Meus Agentes</h2>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Agente
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Agentes Oficiais */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-foreground">Agentes Oficiais LexAI</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officialAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
