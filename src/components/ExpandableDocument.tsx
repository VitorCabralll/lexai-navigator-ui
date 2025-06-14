
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Copy, Download, Edit3, FileText } from "lucide-react";
import { DocumentEditor } from "./DocumentEditor";
import { ExportButtons } from "./ExportButtons";

interface ExpandableDocumentProps {
  content: string;
  onContentChange: (content: string) => void;
  title: string;
}

export function ExpandableDocument({ content, onContentChange, title }: ExpandableDocumentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  if (!content) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">O documento gerado aparecerá aqui</p>
          <p className="text-sm text-muted-foreground">Configure os parâmetros e clique em "Gerar Documento"</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {title}
              </div>
              <div className="flex items-center gap-2">
                <ExportButtons content={content} filename={title} />
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <DocumentEditor content={content} onChange={onContentChange} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsEditing(false)}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Documento
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
