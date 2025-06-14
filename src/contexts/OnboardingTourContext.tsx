
import { createContext, useContext, useState, useEffect } from "react";

interface OnboardingTourContextType {
  showTour: boolean;
  startTour: () => void;
  endTour: () => void;
}

export const OnboardingTourContext = createContext<OnboardingTourContextType>({
  showTour: false,
  startTour: () => {},
  endTour: () => {},
});

export function OnboardingTourProvider({ children }: { children: React.ReactNode }) {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Exibe o tour somente se o usuário nunca fechou antes
    const hasSeenTour = localStorage.getItem("hasSeenOnboardingTour");
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  const startTour = () => setShowTour(true);
  const endTour = () => {
    setShowTour(false);
    localStorage.setItem("hasSeenOnboardingTour", "true");
  }

  return (
    <OnboardingTourContext.Provider value={{ showTour, startTour, endTour }}>
      {children}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour() {
  return useContext(OnboardingTourContext);
}

