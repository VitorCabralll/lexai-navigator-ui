
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Brain, PenTool, CheckCircle } from "lucide-react";

interface GenerationStep {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  active: boolean;
}

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete: () => void;
}

export function GenerationProgress({ isGenerating, onComplete }: GenerationProgressProps) {
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'reading', label: 'Lendo documentos', Icon: FileText, completed: false, active: false },
    { id: 'applying', label: 'Aplicando agente ou prompt predefinido', Icon: Brain, completed: false, active: false },
    { id: 'writing', label: 'Redigindo texto jurídico', Icon: PenTool, completed: false, active: false },
    { id: 'finalizing', label: 'Finalizando documento', Icon: CheckCircle, completed: false, active: false }
  ]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setSteps(prev => prev.map(step => ({ ...step, completed: false, active: false })));
      setProgress(0);
      return;
    }

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          active: index === currentStep,
          completed: index < currentStep
        })));
        
        setProgress(((currentStep + 1) / steps.length) * 100);
        currentStep++;
      } else {
        clearInterval(interval);
        setSteps(prev => prev.map(step => ({ ...step, completed: true, active: false })));
        setTimeout(() => onComplete(), 500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Gerando documento...</h3>
            <Progress value={progress} className="w-full" />
          </div>
          
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <step.Icon className={`h-5 w-5 ${
                  step.completed ? 'text-green-600' : 
                  step.active ? 'text-primary animate-pulse' : 
                  'text-muted-foreground'
                }`} />
                <span className={`text-sm ${
                  step.completed ? 'text-green-600 line-through' : 
                  step.active ? 'text-primary font-medium' : 
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {step.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
