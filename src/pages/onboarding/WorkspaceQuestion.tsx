
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WorkspaceQuestion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Seu Primeiro Workspace</CardTitle>
          <CardDescription>
            Workspaces ajudam você a organizar seus projetos por área do direito ou cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Deseja criar seu primeiro workspace agora?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Você pode fazer isso depois nas configurações, mas recomendamos começar organizando seu trabalho desde o início.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/onboarding/create-workspace")}
              size="lg"
              className="w-full"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Sim, criar workspace
            </Button>
            
            <Button 
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Pular por enquanto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
