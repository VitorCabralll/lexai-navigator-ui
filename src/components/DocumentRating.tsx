
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, Send, Sparkles } from "lucide-react"; // Removed MessageSquare
import { useToast } from "@/hooks/use-toast";

interface DocumentRatingProps {
  documentId: string;
  documentTitle: string;
  onRatingSubmit: (rating: DocumentRating) => void;
}

interface DocumentRating {
  documentId: string;
  rating: number;
  feedback: string;
  categories: string[];
  timestamp: string;
}

const FEEDBACK_CATEGORIES = [
  "Precisão Jurídica",
  "Formatação",
  "Clareza",
  "Completude",
  "Estrutura",
  "Linguagem"
];

export function DocumentRating({ documentId, documentTitle, onRatingSubmit }: DocumentRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating obrigatório",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const ratingData: DocumentRating = {
      documentId,
      rating,
      feedback,
      categories: selectedCategories,
      timestamp: new Date().toISOString()
    };

    try {
      await onRatingSubmit(ratingData);
      
      toast({
        title: "Obrigado pelo feedback!",
        description: "Sua avaliação nos ajuda a melhorar continuamente",
      });

      // Reset form
      setRating(0);
      setFeedback("");
      setSelectedCategories([]);
    } catch (_error) {
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuickFeedback = (type: 'good' | 'bad') => {
    if (type === 'good') {
      setRating(5);
      setFeedback("Documento excelente! Atendeu perfeitamente às expectativas.");
    } else {
      setRating(2);
      setFeedback("Documento precisa de melhorias. ");
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Avalie este documento
        </CardTitle>
        <p className="text-sm text-gray-600">
          <strong>{documentTitle}</strong> - Sua avaliação nos ajuda a melhorar
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating com estrelas */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Nota geral (1-5 estrelas)</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="transition-all hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600">
              {rating === 5 && "⭐ Excelente!"}
              {rating === 4 && "👍 Muito bom!"}
              {rating === 3 && "👌 Bom"}
              {rating === 2 && "⚠️ Precisa melhorar"}
              {rating === 1 && "❌ Insatisfatório"}
            </p>
          )}
        </div>

        {/* Feedback rápido */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Avaliação rápida</label>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => getQuickFeedback('good')}
              className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
            >
              <ThumbsUp className="h-4 w-4" />
              Documento bom
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => getQuickFeedback('bad')}
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300"
            >
              <ThumbsDown className="h-4 w-4" />
              Precisa melhorar
            </Button>
          </div>
        </div>

        {/* Categorias de feedback */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Aspectos avaliados (opcional)</label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className="transition-all"
              >
                <Badge
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategories.includes(category)
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'hover:bg-purple-50'
                  }`}
                >
                  {category}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Comentários detalhados */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Comentários (opcional)</label>
          <Textarea
            placeholder="Compartilhe sua experiência... O que funcionou bem? O que pode melhorar?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Botão de envio */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
        </Button>
      </CardContent>
    </Card>
  );
}
