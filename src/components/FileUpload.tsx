
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, X, Eye, Loader2 } from "lucide-react";
import Tesseract from 'tesseract.js';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  onStrictModeChange: (enabled: boolean) => void;
  strictMode: boolean;
}

export function FileUpload({ onFilesChange, onStrictModeChange, strictMode }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState<string>("");

  const performOCR = async (file: File): Promise<string> => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'por', {
        logger: m => console.log(m)
      });
      return text;
    } catch (error) {
      console.error('Erro no OCR:', error);
      return `Erro ao processar ${file.name} com OCR`;
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    const newFiles: UploadedFile[] = [];
    
    for (const file of selectedFiles) {
      setProcessingFile(file.name);
      
      let content = '';
      
      if (file.type.startsWith('image/')) {
        content = await performOCR(file);
      } else if (file.type === 'text/plain') {
        content = await readTextFile(file);
      } else {
        content = `Arquivo ${file.name} carregado. Tipo: ${file.type}`;
      }
      
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
        content
      };
      
      newFiles.push(uploadedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setIsProcessing(false);
    setProcessingFile("");
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Anexar Documentos (opcional)</Label>
        <div className="mt-2">
          <Input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Suporte a PDF, DOC, DOCX, TXT, JPG, PNG com OCR automático
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Documentos Anexados</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="strict-mode" 
                    checked={strictMode}
                    onCheckedChange={onStrictModeChange}
                  />
                  <Label htmlFor="strict-mode" className="text-sm">
                    Modo Rigoroso (seguir modelo exatamente)
                  </Label>
                </div>
              </div>
              
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processando {processingFile} com OCR...
        </div>
      )}
    </div>
  );
}
