
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, X, Eye, Loader2, BookOpen, Files } from "lucide-react";
import { createWorker } from 'tesseract.js';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface FileUploadProps {
  onSupportFilesChange: (files: UploadedFile[]) => void;
  onTemplateFileChange: (file: UploadedFile | null) => void;
  onStrictModeChange: (enabled: boolean) => void;
  strictMode: boolean;
}

export function FileUpload({ onSupportFilesChange, onTemplateFileChange, onStrictModeChange, strictMode }: FileUploadProps) {
  const [supportFiles, setSupportFiles] = useState<UploadedFile[]>([]);
  const [templateFile, setTemplateFile] = useState<UploadedFile | null>(null);
  const [isProcessingSupportFiles, setIsProcessingSupportFiles] = useState(false);
  const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);
  const [processingFileName, setProcessingFileName] = useState<string>("");

  const performOCR = async (file: File): Promise<string> => {
    try {
      const worker = await createWorker('por');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
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

  const handleSupportFilesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsProcessingSupportFiles(true);
    const newFiles: UploadedFile[] = [];
    
    for (const file of selectedFiles) {
      setProcessingFileName(file.name);
      
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

    const updatedFiles = [...supportFiles, ...newFiles];
    setSupportFiles(updatedFiles);
    onSupportFilesChange(updatedFiles);
    setIsProcessingSupportFiles(false);
    setProcessingFileName("");
  };

  const handleTemplateFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsProcessingTemplate(true);
    setProcessingFileName(selectedFile.name);

    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substring(7),
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      content: `Modelo jurídico ${selectedFile.name} carregado`
    };

    setTemplateFile(uploadedFile);
    onTemplateFileChange(uploadedFile);
    setIsProcessingTemplate(false);
    setProcessingFileName("");
  };

  const removeSupportFile = (fileId: string) => {
    const updatedFiles = supportFiles.filter(f => f.id !== fileId);
    setSupportFiles(updatedFiles);
    onSupportFilesChange(updatedFiles);
  };

  const removeTemplateFile = () => {
    setTemplateFile(null);
    onTemplateFileChange(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Documentos de Apoio */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Files className="h-5 w-5 text-blue-600" />
            Documentos de Apoio (Contexto Fático e Jurídico)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="support-files">Anexar Documentos (opcional)</Label>
            <div className="mt-2">
              <Input
                id="support-files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                onChange={handleSupportFilesUpload}
                disabled={isProcessingSupportFiles}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Estes documentos serão analisados pela IA para compreender o caso.
              </p>
              <p className="text-xs text-muted-foreground">
                Suporte a PDF, DOC, DOCX, TXT, JPG, PNG com OCR automático
              </p>
            </div>
          </div>

          {supportFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Documentos Anexados</h4>
              {supportFiles.map((file) => (
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
                    <Button size="sm" variant="ghost" onClick={() => removeSupportFile(file.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isProcessingSupportFiles && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando {processingFileName} com OCR...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modelo Jurídico de Referência */}
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-green-600" />
            Modelo Jurídico de Referência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-file">Upload de Modelo (opcional)</Label>
            <div className="mt-2">
              <Input
                id="template-file"
                type="file"
                accept=".docx"
                onChange={handleTemplateFileUpload}
                disabled={isProcessingTemplate}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Este modelo ajuda a IA a redigir no seu formato preferido. Recomendado.
              </p>
              <p className="text-xs text-muted-foreground">
                Apenas arquivos .docx são aceitos
              </p>
            </div>
          </div>

          {templateFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Modelo Anexado</h4>
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
              
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{templateFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(templateFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={removeTemplateFile}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isProcessingTemplate && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando {processingFileName}...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
