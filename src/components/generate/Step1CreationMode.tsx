import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Bot, Zap } from 'lucide-react';

interface Step1CreationModeProps {
  creationMode: 'assistant' | 'template' | '';
  onSetCreationMode: (mode: 'assistant' | 'template') => void;
}

export function Step1CreationMode({ creationMode, onSetCreationMode }: Step1CreationModeProps) {
  return (
    <div className="space-y-6">
      <Label className="text-lg text-gray-900">Como você prefere trabalhar?</Label>
      <div className="space-y-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md border-2 ${
            creationMode === 'assistant' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSetCreationMode('assistant')}
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Usar um Modelo Inteligente</h3>
              <p className="text-gray-600">
                Escolha um modelo que já sabe como fazer o que você precisa
              </p>
              <p className="text-sm text-blue-600 mt-2">💡 Recomendado para quem já tem modelos</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md border-2 ${
            creationMode === 'template' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSetCreationMode('template')}
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Começar do Zero</h3>
              <p className="text-gray-600">
                Escolha o tipo de documento e eu te ajudo a criar
              </p>
              <p className="text-sm text-green-600 mt-2">⚡ Perfeito para iniciantes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
