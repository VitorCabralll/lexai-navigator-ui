
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingTour } from "@/contexts/OnboardingTourContext";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";

const tourSteps = [
  {
    title: "Bem-vindo ao LexAI!",
    text: (
      <>
        <p>
          O LexAI foi criado para facilitar o seu dia a dia jurídico com tecnologia de ponta!
        </p>
        <p className="mt-2">
          Neste mini guia, você verá em poucos passos como usar a plataforma para criar, automatizar e organizar documentos jurídicos.
        </p>
      </>
    ),
  },
  {
    title: "1. Crie seu Ambiente de Trabalho",
    text: (
      <>
        <p>
          Comece criando um <span className="font-semibold">Workspace</span>, onde você pode agrupar projetos, documentos e agentes por área de atuação ou cliente.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Dica: Você pode criar diferentes workspaces para cada tipo de processo ou cliente!
        </p>
      </>
    ),
  },
  {
    title: "2. Personalize com Agentes Inteligentes",
    text: (
      <>
        <p>
          Cadastre <span className="font-semibold">Agentes</span> personalizados (modelos de IA com expertise jurídica) ou utilize agentes oficiais LexAI.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Use cada agente para atender demandas específicas ou automatizar tarefas repetitivas.
        </p>
      </>
    ),
  },
  {
    title: "3. Gere Documentos em Segundos",
    text: (
      <>
        <p>
          Clique em <span className="font-semibold">Gerar</span> para criar petições, contratos ou pareceres de forma automatizada.
        </p>
        <ul className="list-disc ml-5 mt-2 text-sm text-muted-foreground">
          <li>Anexe documentos de apoio</li>
          <li>Escolha um modelo</li>
          <li>Revise, edite e exporte para PDF ou DOCX</li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Ajuste e Progrida!",
    text: (
      <>
        <p>
          Utilize o menu <span className="font-semibold">Configurações</span> para personalizar o sistema, convidar membros e gerenciar sua conta.
        </p>
        <p className="mt-2">
          Pronto! Agora você já pode explorar o LexAI e transformar seu fluxo jurídico!
        </p>
      </>
    ),
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const { showTour, endTour } = useOnboardingTour();
  const _navigate = useNavigate(); // Prefixed unused variable

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
        <div className="text-muted-foreground">{text}</div>
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

