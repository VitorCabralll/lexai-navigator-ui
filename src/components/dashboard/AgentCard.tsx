
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Scale, Search, Calculator, FileCheck, Shield } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  lastUsed?: string;
  isOfficial?: boolean;
}

interface AgentCardProps {
  agent: Agent;
}

const typeIcons = {
  parecer: FileText,
  inicial: Scale,
  pesquisa: Search,
  calculo: Calculator,
  revisao: FileCheck,
};

const typeLabels = {
  parecer: "Parecer",
  inicial: "Petição Inicial", 
  pesquisa: "Pesquisa",
  calculo: "Cálculo",
  revisao: "Revisão",
};

export function AgentCard({ agent }: AgentCardProps) {
  const IconComponent = typeIcons[agent.type as keyof typeof typeIcons] || FileText;

  return (
    <Card className="bg-card border-border hover:border-border/80 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            {agent.isOfficial && (
              <Shield className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {typeLabels[agent.type as keyof typeof typeLabels] || agent.type}
          </Badge>
        </div>
        <CardTitle className="text-lg">{agent.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {agent.description}
        </p>
        
        {agent.lastUsed && (
          <p className="text-xs text-muted-foreground mb-4">
            Usado {agent.lastUsed}
          </p>
        )}
        
        <Button className="w-full" variant={agent.isOfficial ? "outline" : "default"}>
          Abrir
        </Button>
      </CardContent>
    </Card>
  );
}
