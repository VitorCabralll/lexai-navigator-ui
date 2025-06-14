
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface GenerationStep {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
  active: boolean;
}

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete: () => void;
}

export function GenerationProgress({ isGenerating, onComplete }: GenerationProgressProps) {
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'reading', label: 'Lendo instruções', icon: '📄', completed: false, active: false },
    { id: 'applying', label: 'Aplicando prompt', icon: '🧠', completed: false, active: false },
    { id: 'writing', label: 'Redigindo', icon: '✍️', completed: false, active: false },
    { id: 'finalizing', label: 'Finalizando', icon: '✅', completed: false, active: false }
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
                <div className={`text-lg ${step.active ? 'animate-pulse' : ''}`}>
                  {step.icon}
                </div>
                <span className={`text-sm ${
                  step.completed ? 'text-green-600 line-through' : 
                  step.active ? 'text-primary font-medium' : 
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {step.completed && <span className="text-green-600 text-xs">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
