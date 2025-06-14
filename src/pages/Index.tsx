
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar diretamente para o dashboard para testes
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">L</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">LexAI</h1>
        <p className="text-xl text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
