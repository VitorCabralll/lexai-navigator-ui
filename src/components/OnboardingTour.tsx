
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingTour } from "@/contexts/OnboardingTourContext";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";

const tourSteps = [
  {
    title: "Bem-vindo ao LexAI!",
    text: "Aqui você encontra tudo o que precisa para gerenciar e automatizar tarefas jurídicas.",
  },
  {
    title: "Workspaces",
    text: "Organize seus projetos por área ou cliente no menu 'Workspaces'.",
  },
  {
    title: "Geração de Documentos",
    text: "Crie documentos automaticamente com IA na aba 'Gerar'.",
  },
  {
    title: "Configurações",
    text: "Personalize a experiência e configure sua conta pelo menu de Configurações.",
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const { showTour, endTour } = useOnboardingTour();
  const navigate = useNavigate();

  if (!showTour) return null;
  const { title, text } = tourSteps[step];

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep((s) => s + 1);
    } else {
      endTour();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-background border shadow-lg rounded-lg p-6 max-w-sm w-full relative space-y-4">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={endTour}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{text}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{step + 1} / {tourSteps.length}</span>
          <div>
            <Button onClick={handleNext}>
              {step === tourSteps.length - 1
                ? "Começar a usar"
                : <>
                    Próximo
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

