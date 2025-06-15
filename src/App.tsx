
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { OnboardingTourProvider } from "@/contexts/OnboardingTourContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Agents from "./pages/Agents";
import CreateAgent from "./pages/CreateAgent";
import Settings from "./pages/Settings";
import Workspace from "./pages/Workspace";
import NotFound from "./pages/NotFound";

// Onboarding pages
import Welcome from "./pages/onboarding/Welcome";
import WorkspaceQuestion from "./pages/onboarding/WorkspaceQuestion";
import CreateWorkspace from "./pages/onboarding/CreateWorkspace";
import LegalProfile from "./pages/onboarding/LegalProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <OnboardingTourProvider>
              <Router>
                <div className="min-h-screen bg-background text-foreground">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Onboarding routes */}
                    <Route path="/onboarding" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                    <Route path="/onboarding/workspace" element={<ProtectedRoute><WorkspaceQuestion /></ProtectedRoute>} />
                    <Route path="/onboarding/create-workspace" element={<ProtectedRoute><CreateWorkspace /></ProtectedRoute>} />
                    <Route path="/onboarding/legal-profile" element={<ProtectedRoute><LegalProfile /></ProtectedRoute>} />
                    
                    {/* Main app routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/generate" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
                    <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
                    <Route path="/agents/create" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
                    <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Router>
              <Toaster />
            </OnboardingTourProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
