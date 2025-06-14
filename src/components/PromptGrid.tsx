
import { Card, CardContent } from "@/components/ui/card";
import { PREDEFINED_PROMPTS } from "@/types/prompts";
import { FileText, Package, Shield, FileCheck, PenTool } from "lucide-react";

interface PromptGridProps {
  selectedPromptId: string;
  onPromptSelect: (promptId: string) => void;
}

const promptIcons = {
  'parecer': FileText,
  'peticao': Package,
  'contrato': PenTool,
  'recurso': FileCheck,
  'denuncia': Shield
};

export function PromptGrid({ selectedPromptId, onPromptSelect }: PromptGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PREDEFINED_PROMPTS.map((prompt) => {
        const Icon = promptIcons[prompt.id as keyof typeof promptIcons] || FileText;
        const isSelected = selectedPromptId === prompt.id;
        
        return (
          <Card 
            key={prompt.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => onPromptSelect(prompt.id)}
          >
            <CardContent className="p-4 text-center">
              <Icon className={`h-8 w-8 mx-auto mb-2 ${
                isSelected ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <h3 className="font-medium text-sm mb-1">{prompt.name}</h3>
              <p className="text-xs text-muted-foreground">{prompt.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
