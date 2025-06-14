
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AuthProvider } from '@/hooks/useAuth';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { OnboardingTourProvider } from '@/contexts/OnboardingTourContext';
import { Layout } from '@/components/Layout';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Generate from '@/pages/Generate';
import Agents from '@/pages/Agents';
import CreateAgent from '@/pages/CreateAgent';
import Settings from '@/pages/Settings';
import Workspace from '@/pages/Workspace';
import Welcome from '@/pages/onboarding/Welcome';
import CreateWorkspace from '@/pages/onboarding/CreateWorkspace';
import WorkspaceQuestion from '@/pages/onboarding/WorkspaceQuestion';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 2;
      }
    }
  }
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <OnboardingTourProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />

                    {/* Onboarding routes */}
                    <Route path="/onboarding" element={<Navigate to="/onboarding/welcome" replace />} />
                    <Route path="/onboarding/welcome" element={<Welcome />} />
                    <Route path="/onboarding/workspace-question" element={<WorkspaceQuestion />} />
                    <Route path="/onboarding/create-workspace" element={<CreateWorkspace />} />

                    {/* Protected routes with layout */}
                    <Route path="/" element={<Layout />}>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="generate" element={<Generate />} />
                      <Route path="agents" element={<Agents />} />
                      <Route path="agents/create" element={<CreateAgent />} />
                      <Route path="workspace" element={<Workspace />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </OnboardingTourProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
