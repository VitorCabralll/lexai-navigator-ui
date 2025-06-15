
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Scale, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LEGAL_SUBJECTS } from "@/types/legalSubjects";

const LEGAL_POSITIONS = [
  'Advogado(a)',
  'Promotor(a) de Justiça',
  'Juiz(a)',
  'Procurador(a)',
  'Defensor(a) Público(a)',
  'Delegado(a)',
  'Escrivão(ã)',
  'Analista Jurídico',
  'Assessor(a) Jurídico(a)',
  'Estudante de Direito',
  'Outro'
] as const;

export default function LegalProfile() {
  const [position, setPosition] = useState("");
  const [primaryAreas, setPrimaryAreas] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleAreaToggle = (area: string) => {
    setPrimaryAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : prev.length < 3 ? [...prev, area] : prev
    );
  };

  const canContinue = position && primaryAreas.length > 0;

  const handleContinue = () => {
    // Salvar perfil no localStorage para uso posterior
    localStorage.setItem('lexai-legal-profile', JSON.stringify({
      position,
      primaryAreas
    }));
    navigate("/onboarding/workspace-question");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Seu Perfil Jurídico</CardTitle>
          <CardDescription>
            Vamos personalizar sua experiência no LexAI de acordo com sua área de atuação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cargo/Posição */}
          <div className="space-y-2">
            <Label>Qual é o seu cargo ou posição?</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua posição" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {LEGAL_POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Áreas de Atuação */}
          <div className="space-y-3">
            <div>
              <Label>Principais áreas de atuação</Label>
              <p className="text-sm text-muted-foreground">
                Selecione até 3 áreas onde você mais atua (clique para selecionar/desselecionar)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LEGAL_SUBJECTS.map((area) => {
                const isSelected = primaryAreas.includes(area);
                return (
                  <Button
                    key={area}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAreaToggle(area)}
                    className={`justify-start text-left h-auto py-2 px-3 ${
                      isSelected ? "bg-primary text-primary-foreground" : ""
                    }`}
                    disabled={!isSelected && primaryAreas.length >= 3}
                  >
                    {area}
                  </Button>
                );
              })}
            </div>
            {primaryAreas.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selecionadas: {primaryAreas.length}/3
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/onboarding/welcome")}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!canContinue}
              className="flex-1"
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
