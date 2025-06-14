
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, X, Eye, Loader2, BookOpen, Files, Image, FileType } from "lucide-react";
import { createWorker } from 'tesseract.js';
import { useToast } from "@/components/ui/use-toast";

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
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const performOCR = async (file: File): Promise<string> => {
    try {
      const worker = await createWorker('por');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error('Erro no OCR:', error);
      toast({
        title: "Erro no OCR",
        description: `Não foi possível processar ${file.name} com OCR`,
        variant: "destructive",
      });
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Check if files are acceptable for support documents
    const acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'];
    const validFiles = files.filter(file => 
      acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.replace('.', '')))
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Arquivos não suportados",
        description: "Alguns arquivos não são suportados e foram ignorados",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      await processSupportFiles(validFiles);
    }
  }, []);

  const processSupportFiles = async (selectedFiles: File[]) => {
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

    toast({
      title: "Upload concluído",
      description: `${newFiles.length} arquivo(s) processado(s) com sucesso`,
    });
  };

  const handleSupportFilesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    await processSupportFiles(selectedFiles);
  };

  const handleTemplateFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos .docx são aceitos para modelos",
        variant: "destructive",
      });
      return;
    }

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

    toast({
      title: "Modelo carregado",
      description: `${selectedFile.name} foi carregado como modelo de referência`,
    });
  };

  const removeSupportFile = (fileId: string) => {
    const fileToRemove = supportFiles.find(f => f.id === fileId);
    const updatedFiles = supportFiles.filter(f => f.id !== fileId);
    setSupportFiles(updatedFiles);
    onSupportFilesChange(updatedFiles);

    toast({
      title: "Arquivo removido",
      description: `${fileToRemove?.name} foi removido`,
    });
  };

  const removeTemplateFile = () => {
    const fileName = templateFile?.name;
    setTemplateFile(null);
    onTemplateFileChange(null);

    toast({
      title: "Modelo removido",
      description: `${fileName} foi removido`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileName.toLowerCase().endsWith('.pdf')) return FileType;
    return FileText;
  };

  const getFilePreview = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
          <Image className="h-4 w-4 text-blue-600" />
        </div>
      );
    }
    
    const Icon = getFileIcon(file.name, file.type);
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Documentos de Apoio */}
      <Card className="border-blue-200 transition-all hover:shadow-md">
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
              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${
                  isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${isProcessingSupportFiles ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('support-files')?.click()}
              >
                <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm font-medium mb-1">
                  {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, TXT, JPG, PNG com OCR automático
                </p>
              </div>
              
              <Input
                id="support-files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                onChange={handleSupportFilesUpload}
                disabled={isProcessingSupportFiles}
                className="hidden"
              />
              
              <p className="text-sm text-muted-foreground mt-2">
                Estes documentos serão analisados pela IA para compreender o caso.
              </p>
            </div>
          </div>

          {supportFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Documentos Anexados ({supportFiles.length})</h4>
              <div className="space-y-2">
                {supportFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getFilePreview(file)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeSupportFile(file.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProcessingSupportFiles && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4 bg-blue-50 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando {processingFileName} com OCR...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modelo Jurídico de Referência */}
      <Card className="border-green-200 transition-all hover:shadow-md">
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
                className="cursor-pointer"
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
                  <Label htmlFor="strict-mode" className="text-sm cursor-pointer">
                    Modo Rigoroso (seguir modelo exatamente)
                  </Label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{templateFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(templateFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={removeTemplateFile}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isProcessingTemplate && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4 bg-green-50 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando {processingFileName}...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
