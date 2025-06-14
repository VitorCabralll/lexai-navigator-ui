
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Brain, PenTool, CheckCircle, Zap } from "lucide-react";

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  active: boolean;
  duration: number;
}

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete: () => void;
}

export function GenerationProgress({ isGenerating, onComplete }: GenerationProgressProps) {
  const [steps, setSteps] = useState<GenerationStep[]>([
    { 
      id: 'reading', 
      label: 'Lendo documentos', 
      description: 'Analisando documentos anexados e extraindo informações relevantes',
      Icon: FileText, 
      completed: false, 
      active: false,
      duration: 2000
    },
    { 
      id: 'applying', 
      label: 'Aplicando inteligência', 
      description: 'Processando com agente ou prompt predefinido',
      Icon: Brain, 
      completed: false, 
      active: false,
      duration: 3000
    },
    { 
      id: 'writing', 
      label: 'Redigindo texto jurídico', 
      description: 'Gerando conteúdo baseado no contexto e modelo fornecidos',
      Icon: PenTool, 
      completed: false, 
      active: false,
      duration: 2500
    },
    { 
      id: 'finalizing', 
      label: 'Finalizando documento', 
      description: 'Aplicando formatação e verificações finais',
      Icon: CheckCircle, 
      completed: false, 
      active: false,
      duration: 1500
    }
  ]);

  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setSteps(prev => prev.map(step => ({ ...step, completed: false, active: false })));
      setProgress(0);
      setCurrentStepIndex(0);
      return;
    }

    let currentStep = 0;
    let stepProgress = 0;
    
    const updateProgress = () => {
      if (currentStep < steps.length) {
        const currentStepData = steps[currentStep];
        
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          active: index === currentStep,
          completed: index < currentStep
        })));
        
        // Animate progress within current step
        const stepDuration = currentStepData.duration;
        const stepIncrement = (100 / steps.length) / (stepDuration / 50);
        
        const progressInterval = setInterval(() => {
          stepProgress += stepIncrement;
          const totalProgress = (currentStep * (100 / steps.length)) + (stepProgress * (100 / steps.length) / 100);
          setProgress(Math.min(totalProgress, (currentStep + 1) * (100 / steps.length)));
          
          if (stepProgress >= 100) {
            clearInterval(progressInterval);
            currentStep++;
            stepProgress = 0;
            setCurrentStepIndex(currentStep);
            
            if (currentStep < steps.length) {
              setTimeout(updateProgress, 100);
            } else {
              setSteps(prev => prev.map(step => ({ ...step, completed: true, active: false })));
              setProgress(100);
              setTimeout(() => onComplete(), 500);
            }
          }
        }, 50);
      }
    };

    updateProgress();
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  const activeStep = steps[currentStepIndex];

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="font-semibold text-lg">Gerando documento...</h3>
            </div>
            <Progress value={progress} className="w-full h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% concluído
            </p>
          </div>
          
          {activeStep && (
            <div className="text-center p-4 bg-white/50 rounded-lg border">
              <activeStep.Icon className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
              <p className="font-medium text-sm mb-1">{activeStep.label}</p>
              <p className="text-xs text-muted-foreground">{activeStep.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center transition-all ${
                  step.completed ? 'bg-green-100 text-green-600' : 
                  step.active ? 'bg-primary/20 text-primary scale-110' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-xs transition-colors ${
                  step.completed ? 'text-green-600 font-medium' : 
                  step.active ? 'text-primary font-medium' : 
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
