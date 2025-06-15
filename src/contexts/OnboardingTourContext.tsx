
import { createContext, useContext, useState, useEffect } from "react";

interface OnboardingTourContextType {
  showTour: boolean;
  startTour: () => void;
  endTour: () => void;
  currentTourStep: number;
  setCurrentTourStep: (step: number) => void;
}

export const OnboardingTourContext = createContext<OnboardingTourContextType>({
  showTour: false,
  startTour: () => {},
  endTour: () => {},
  currentTourStep: 0,
  setCurrentTourStep: () => {},
});

export function OnboardingTourProvider({ children }: { children: React.ReactNode }) {
  const [showTour, setShowTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  useEffect(() => {
    // Exibe o tour visual somente se o usuário nunca viu antes
    const hasSeenTour = localStorage.getItem("hasSeenVisualTour");
    if (!hasSeenTour) {
      // Pequeno delay para a interface carregar
      setTimeout(() => {
        setShowTour(true);
      }, 1000);
    }
  }, []);

  const startTour = () => {
    setShowTour(true);
    setCurrentTourStep(0);
  };
  
  const endTour = () => {
    setShowTour(false);
    setCurrentTourStep(0);
    localStorage.setItem("hasSeenVisualTour", "true");
  };

  return (
    <OnboardingTourContext.Provider value={{ 
      showTour, 
      startTour, 
      endTour, 
      currentTourStep, 
      setCurrentTourStep 
    }}>
      {children}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour() {
  return useContext(OnboardingTourContext);
}
