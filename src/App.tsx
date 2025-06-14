
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Agents from "./pages/Agents";
import CreateAgent from "./pages/CreateAgent";
import Generate from "./pages/Generate";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/onboarding/Welcome";
import WorkspaceQuestion from "./pages/onboarding/WorkspaceQuestion";
import CreateWorkspace from "./pages/onboarding/CreateWorkspace";
import { OnboardingTourProvider } from "@/contexts/OnboardingTourContext";
import { OnboardingTour } from "@/components/OnboardingTour";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <TooltipProvider>
          <OnboardingTourProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OnboardingTour /> {/* <-- MOVED HERE */}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Welcome />} />
                <Route path="/onboarding/workspace-question" element={<WorkspaceQuestion />} />
                <Route path="/onboarding/create-workspace" element={<CreateWorkspace />} />
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/workspace" element={<Workspace />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/agents/create" element={<CreateAgent />} />
                  <Route path="/generate" element={<Generate />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </OnboardingTourProvider>
        </TooltipProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

