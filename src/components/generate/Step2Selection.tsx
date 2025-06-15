import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromptGrid } from '@/components/PromptGrid';
import { Crown, Users } from 'lucide-react';
// Assuming Agent type is defined elsewhere and can be imported
// import { Agent } from '@/types/agent';
// For now, using a placeholder type
interface Agent { id: string; name: string; theme: string; workspaceId?: string; }

interface Step2SelectionProps {
  creationMode: 'assistant' | 'template';
  selectedAgent: string;
  onSetSelectedAgent: (agentId: string) => void;
  officialAgents: Agent[];
  workspaceAgents: Agent[];
  selectedPromptId: string;
  onPromptSelect: (promptId: string) => void;
}

export function Step2Selection({
  creationMode,
  selectedAgent,
  onSetSelectedAgent,
  officialAgents,
  workspaceAgents,
  selectedPromptId,
  onPromptSelect,
}: Step2SelectionProps) {
  if (creationMode === 'assistant') {
    return (
      <div className="space-y-6">
        <Label htmlFor="agent" className="text-lg text-gray-900">Qual modelo você quer usar?</Label>
        <Select value={selectedAgent} onValueChange={onSetSelectedAgent}>
          <SelectTrigger className="h-14 text-left">
            <SelectValue placeholder="Escolha um modelo que se encaixa no que você precisa" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="official-header" disabled className="text-xs font-medium text-gray-500 bg-gray-50">
              🏆 MODELOS OFICIAIS (RECOMENDADOS)
            </SelectItem>
            {officialAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id} className="py-3">
                <div className="flex items-center gap-3">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.theme}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
            {workspaceAgents.length > 0 && (
              <>
                <SelectItem value="my-agents-header" disabled className="text-xs font-medium text-gray-500 bg-gray-50 mt-2">
                  👤 MEUS MODELOS PERSONALIZADOS
                </SelectItem>
                {workspaceAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-500">{agent.theme}</div>
                      </div>
                    </SelectItem>
                  ))}
                </>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (creationMode === 'template') {
    return (
      <div className="space-y-6">
        <Label className="text-lg text-gray-900">Que tipo de documento você precisa?</Label>
        <PromptGrid
          selectedPromptId={selectedPromptId}
          onPromptSelect={onPromptSelect}
        />
      </div>
    );
  }
  return null;
}
