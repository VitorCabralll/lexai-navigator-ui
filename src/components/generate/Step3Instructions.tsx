import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step3InstructionsProps {
  creationMode: 'assistant' | 'template';
  instructions: string;
  onSetInstructions: (instructions: string) => void;
  additionalInstructions: string;
  onSetAdditionalInstructions: (instructions: string) => void;
}

export function Step3Instructions({
  creationMode,
  instructions,
  onSetInstructions,
  additionalInstructions,
  onSetAdditionalInstructions,
}: Step3InstructionsProps) {
  if (creationMode === 'assistant') {
    return (
      <>
        <Label htmlFor="instructions" className="text-lg text-gray-900">
          Agora me conte: o que exatamente você precisa?
        </Label>
        <Textarea
          id="instructions"
          placeholder="Exemplo: Meu cliente João da Silva quer processar a empresa ABC Ltda por danos morais..."
          value={instructions}
          onChange={(e) => onSetInstructions(e.target.value)}
          rows={8}
          className="resize-none text-base"
        />
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> Quanto mais detalhes você me der, melhor será o documento.
            Inclua nomes, valores, datas e o que aconteceu.
          </p>
        </div>
      </>
    );
  }

  if (creationMode === 'template') {
    return (
      <>
        <Label htmlFor="additional-instructions" className="text-lg text-gray-900">
          Há algo específico que deve aparecer no documento?
        </Label>
        <Textarea
          id="additional-instructions"
          placeholder="Exemplo: Preciso mencionar o artigo 6º da Lei de Improbidade..."
          value={additionalInstructions}
          onChange={(e) => onSetAdditionalInstructions(e.target.value)}
          rows={8}
          className="resize-none text-base"
        />
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>💡 Dica:</strong> Se você não tem certeza, pode deixar em branco.
            Eu crio um documento padrão baseado no tipo escolhido.
          </p>
        </div>
      </>
    );
  }
  return null;
}
