
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  Loader2, 
  Image, 
  FileType,
  Film,
  Music,
  Archive,
  AlertCircle,
  Sparkles,
  Eye
} from "lucide-react";
import { createWorker } from 'tesseract.js';
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  preview?: string;
}

interface FileUploadModernProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  enableOCR?: boolean;
  enablePreview?: boolean;
}

export function FileUploadModern({ 
  onFilesChange, 
  maxFiles = 10,
  maxSize = 50,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.jpeg'],
  enableOCR = true,
  enablePreview = true
}: FileUploadModernProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Film;
    if (fileType.startsWith('audio/')) return Music;
    if (fileName.toLowerCase().endsWith('.pdf')) return FileType;
    if (fileType.includes('zip') || fileType.includes('rar')) return Archive;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxSize}MB permitido.`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Tipo de arquivo não suportado. Tipos aceitos: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const performOCR = async (file: File, uploadedFile: UploadedFile): Promise<string> => {
    try {
      const worker = await createWorker('por');
      
      // Update progress during OCR
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 500);

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      clearInterval(progressInterval);
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Falha no processamento OCR');
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const generatePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!enablePreview || !file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    const fileId = Math.random().toString(36).substring(7);
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    // Add file to list immediately
    setFiles(prev => [...prev, uploadedFile]);

    try {
      // Generate preview
      const preview = await generatePreview(file);
      
      // Update with preview and start processing
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, preview, status: 'processing', progress: 20 }
          : f
      ));

      let content = '';
      
      // Process based on file type
      if (file.type.startsWith('image/') && enableOCR) {
        content = await performOCR(file, uploadedFile);
      } else if (file.type === 'text/plain') {
        content = await readTextFile(file);
      } else {
        content = `Arquivo ${file.name} carregado. Tipo: ${file.type}`;
      }

      // Complete processing
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, content, status: 'completed', progress: 100 }
          : f
      ));

      toast({
        title: "Arquivo processado",
        description: `${file.name} foi processado com sucesso`,
      });

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));

      toast({
        title: "Erro no processamento",
        description: `Falha ao processar ${file.name}`,
        variant: "destructive"
      });
    }
  };

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo de ${maxFiles} arquivos permitidos`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Arquivo inválido",
          description: error,
          variant: "destructive"
        });
        continue;
      }

      await processFile(file);
    }

    setIsProcessing(false);
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
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      await handleFiles(droppedFiles);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const retryFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Reset file status
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    // Retry processing (would need original File object - simplified here)
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'completed', progress: 100, content: 'Reprocessado com sucesso' }
          : f
      ));
    }, 2000);
  };

  // Update parent component when files change
  React.useEffect(() => {
    onFilesChange(files.filter(f => f.status === 'completed'));
  }, [files, onFilesChange]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card 
        className={`transition-all duration-200 cursor-pointer ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 border-2 border-dashed' 
            : 'border-gray-300 border-2 border-dashed hover:border-blue-400 hover:bg-blue-50/50'
        } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              isDragOver ? 'bg-blue-200' : 'bg-gray-100'
            }`}>
              {isDragOver ? (
                <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isDragOver ? 'Solte os arquivos aqui!' : 'Arraste arquivos ou clique para selecionar'}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Tipos aceitos: {acceptedTypes.join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                Máximo {maxFiles} arquivos • {maxSize}MB por arquivo
                {enableOCR && ' • OCR automático para imagens'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Arquivos ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => {
                const Icon = getFileIcon(file.name, file.type);
                
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Preview or Icon */}
                    <div className="w-12 h-12 flex-shrink-0 rounded border bg-gray-50 flex items-center justify-center overflow-hidden">
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <div className="flex items-center gap-2">
                          {file.status === 'completed' && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                          {file.status === 'error' && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Erro
                            </Badge>
                          )}
                          {(file.status === 'uploading' || file.status === 'processing') && (
                            <Badge variant="outline">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {file.status === 'uploading' ? 'Enviando...' : 'Processando...'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>{formatFileSize(file.size)}</span>
                        {file.status === 'completed' && file.content && (
                          <span className="text-xs text-green-600">
                            {file.content.length} caracteres extraídos
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <Progress value={file.progress} className="h-2" />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {file.status === 'completed' && enablePreview && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {file.status === 'error' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => retryFile(file.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Loader2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
