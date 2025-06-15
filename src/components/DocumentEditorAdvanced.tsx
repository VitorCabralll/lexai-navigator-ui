
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge"; // Unused
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Copy, 
  Download, 
  Eye, 
  Edit3, 
  Check, 
  AlertTriangle,
  Lightbulb,
  Zap,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentEditorAdvancedProps {
  content: string;
  onChange: (content: string) => void;
  title?: string;
  suggestions?: string[];
  onExport?: (format: 'docx' | 'pdf') => void;
}

interface DocumentStats {
  words: number;
  characters: number;
  paragraphs: number;
  pages: number;
}

interface QualityCheck {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
}

export function DocumentEditorAdvanced({ 
  content, 
  onChange, 
  title = "Documento",
  suggestions = [],
  onExport 
}: DocumentEditorAdvancedProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [stats, setStats] = useState<DocumentStats>({ words: 0, characters: 0, paragraphs: 0, pages: 0 });
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && !isPreviewMode) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content, isPreviewMode]);

  // Calculate document statistics
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0).length;
    const pages = Math.max(1, Math.ceil(words / 250)); // Approx 250 words per page

    setStats({ words, characters, paragraphs, pages });
  }, [content]);

  // Quality checks (simplified)
  useEffect(() => {
    const checks: QualityCheck[] = [];
    
    // Check for common issues
    if (content.includes('  ')) {
      checks.push({
        type: 'warning',
        message: 'Espaços duplos detectados'
      });
    }
    
    if (content.length > 0 && !content.trim().endsWith('.')) {
      checks.push({
        type: 'suggestion',
        message: 'Documento não termina com ponto final'
      });
    }
    
    // Check for very long paragraphs
    const longParagraphs = content.split('\n\n').filter(p => p.length > 500);
    if (longParagraphs.length > 0) {
      checks.push({
        type: 'suggestion',
        message: `${longParagraphs.length} parágrafo(s) muito longo(s) - considere dividir`
      });
    }

    setQualityChecks(checks);
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência",
      });
    } catch (_error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive"
      });
    }
  };

  const getQualityIcon = (type: QualityCheck['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2 leading-relaxed">
        {line || <br />}
      </p>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Header com título e estatísticas */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={isPreviewMode ? "bg-blue-50 border-blue-300" : ""}
              >
                {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {isPreviewMode ? "Editar" : "Preview"}
              </Button>
              {suggestions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center gap-1"
                >
                  <Zap className="h-4 w-4" />
                  Sugestões ({suggestions.length})
                </Button>
              )}
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{stats.words} palavras</span>
            <span>{stats.characters} caracteres</span>
            <span>{stats.paragraphs} parágrafos</span>
            <span>~{stats.pages} página(s)</span>
          </div>
        </CardHeader>
      </Card>

      {/* Sugestões (se houver) */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Sugestões de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                  <BookOpen className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor principal */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          {isPreviewMode ? (
            <div className="p-6 min-h-[400px] bg-white">
              <div className="prose max-w-none">
                {formatText(content)}
              </div>
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[400px] border-0 rounded-none resize-none font-mono text-sm leading-relaxed"
              placeholder="Digite o conteúdo do documento..."
            />
          )}
        </CardContent>
      </Card>

      {/* Quality checks */}
      {qualityChecks.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              Verificação de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qualityChecks.map((check, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {getQualityIcon(check.type)}
                  <span>{check.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Copiar
        </Button>
        
        {onExport && (
          <>
            <Button 
              onClick={() => onExport('docx')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar DOCX
            </Button>
            <Button 
              onClick={() => onExport('pdf')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
