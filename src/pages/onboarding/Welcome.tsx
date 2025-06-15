
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Users, Zap, Scale, Gavel } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Bem-vindo ao LexAI!</CardTitle>
          <CardDescription className="text-lg">
            A plataforma de inteligência artificial desenvolvida especialmente para operadores do direito
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Scale className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Especializado em Direito</h3>
                <p className="text-sm text-muted-foreground">
                  IA treinada especificamente para advogados, promotores, juízes e operadores jurídicos
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Documentos Jurídicos</h3>
                <p className="text-sm text-muted-foreground">
                  Crie petições, pareceres, contratos e outros documentos com precisão técnica
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Gavel className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Agentes por Matéria</h3>
                <p className="text-sm text-muted-foreground">
                  Organize seus agentes de IA por área jurídica: Civil, Penal, Trabalhista e mais
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold">Produtividade Jurídica</h3>
                <p className="text-sm text-muted-foreground">
                  Reduza drasticamente o tempo em tarefas repetitivas e foque no que realmente importa
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <Button 
              onClick={() => navigate("/onboarding/legal-profile")}
              size="lg"
              className="w-full md:w-auto"
            >
              Começar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
