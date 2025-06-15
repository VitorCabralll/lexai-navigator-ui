
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useFormValidation } from "@/hooks/useFormValidation";
import { loginSchema, type LoginFormData } from "@/schemas/validationSchemas";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertTriangle, ExternalLink } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, isFirebaseConfigured } = useAuth();
  const { validate, getFieldError, clearErrors } = useFormValidation(loginSchema);

  // Se Firebase não estiver configurado, mostrar mensagem de configuração
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">LexAI</CardTitle>
            <CardDescription>Configuração Necessária</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Firebase não está configurado. Para usar a aplicação, você precisa:
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Passos para configuração:</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Criar um projeto no Firebase Console</li>
                  <li>Copiar .env.local.example para .env.local</li>
                  <li>Preencher com suas credenciais do Firebase</li>
                  <li>Recarregar a aplicação</li>
                </ol>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Firebase Console
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate(formData)) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password);
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao LexAI"
        });
        navigate("/onboarding");
      } else {
        await signIn(formData.email, formData.password);
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta ao LexAI"
        });
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.";
      toast({
        title: "Erro na autenticação",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao LexAI"
      });
      navigate("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.";
      toast({
        title: "Erro no login com Google",
        description: message,
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">LexAI</CardTitle>
          <CardDescription>
            {isSignUp ? "Crie sua conta para começar" : "Entre na sua conta para acessar a plataforma"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? "Entrando..." : "Continuar com Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={getFieldError('email') ? 'border-destructive' : ''}
                required
              />
              {getFieldError('email') && (
                <p className="text-sm text-destructive">{getFieldError('email')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={getFieldError('password') ? 'border-destructive' : ''}
                required
              />
              {getFieldError('password') && (
                <p className="text-sm text-destructive">{getFieldError('password')}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Carregando...
                </>
              ) : (
                isSignUp ? "Criar Conta" : "Entrar"
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp ? "Já tem uma conta? Entrar" : "Não tem uma conta? Criar conta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
