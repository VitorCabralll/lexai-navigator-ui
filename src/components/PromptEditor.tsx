
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Eye, 
  TestTube, 
  Sparkles, 
  Plus, 
  X, 
  Lock, 
  Users, 
  Globe,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { AdvancedPrompt, PromptCategory } from "@/types/advancedPrompts";

interface PromptEditorProps {
  prompt?: AdvancedPrompt;
  categories: PromptCategory[];
  onSave: (prompt: Partial<AdvancedPrompt>) => void;
  onTest: (prompt: Partial<AdvancedPrompt>) => void;
  onCancel: () => void;
}

export function PromptEditor({ prompt, categories, onSave, onTest, onCancel }: PromptEditorProps) {
  const [formData, setFormData] = useState<Partial<AdvancedPrompt>>({
    title: prompt?.title || "",
    description: prompt?.description || "",
    category: prompt?.category || "",
    subcategories: prompt?.subcategories || [],
    tags: prompt?.tags || [],
    difficulty: prompt?.difficulty || "beginner",
    visibility: prompt?.visibility || "private",
    content: prompt?.content || "",
    internalPrompt: prompt?.internalPrompt || "",
    metadata: {
      legalArea: prompt?.metadata?.legalArea || "",
      documentType: prompt?.metadata?.documentType || "",
      complexity: prompt?.metadata?.complexity || 1,
      estimatedTime: prompt?.metadata?.estimatedTime || 5,
      requiredFields: prompt?.metadata?.requiredFields || [],
      keywords: prompt?.metadata?.keywords || []
    }
  });

  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newRequiredField, setNewRequiredField] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.title?.trim()) newErrors.push("Título é obrigatório");
    if (!formData.description?.trim()) newErrors.push("Descrição é obrigatória");
    if (!formData.category) newErrors.push("Categoria é obrigatória");
    if (!formData.internalPrompt?.trim()) newErrors.push("Prompt interno é obrigatório");
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleTest = () => {
    if (validateForm()) {
      onTest(formData);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.metadata?.keywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata!,
          keywords: [...(prev.metadata?.keywords || []), newKeyword.trim()]
        }
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        keywords: prev.metadata?.keywords?.filter(k => k !== keyword) || []
      }
    }));
  };

  const addRequiredField = () => {
    if (newRequiredField.trim() && !formData.metadata?.requiredFields?.includes(newRequiredField.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata!,
          requiredFields: [...(prev.metadata?.requiredFields || []), newRequiredField.trim()]
        }
      }));
      setNewRequiredField("");
    }
  };

  const removeRequiredField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        requiredFields: prev.metadata?.requiredFields?.filter(f => f !== field) || []
      }
    }));
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <Lock className="h-4 w-4" />;
      case 'workspace': return <Users className="h-4 w-4" />;
      case 'public': return <Globe className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {prompt ? 'Editar Prompt' : 'Criar Novo Prompt'}
          </h2>
          <p className="text-muted-foreground">
            Configure o prompt para gerar documentos jurídicos específicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={isPreviewMode}
            onCheckedChange={setIsPreviewMode}
          />
          <Label>Modo Preview</Label>
        </div>
      </div>

      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Corrija os seguintes erros:</span>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Petição Inicial - Danos Morais"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva quando e como usar este prompt..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.category || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select 
                  value={formData.difficulty || "beginner"} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Visibilidade</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['private', 'workspace', 'public'].map(vis => (
                  <Button
                    key={vis}
                    variant={formData.visibility === vis ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, visibility: vis as any }))}
                    className="flex items-center gap-2"
                  >
                    {getVisibilityIcon(vis)}
                    {vis === 'private' ? 'Privado' : vis === 'workspace' ? 'Workspace' : 'Público'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="legalArea">Área Jurídica</Label>
              <Input
                id="legalArea"
                value={formData.metadata?.legalArea || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata!, legalArea: e.target.value }
                }))}
                placeholder="Ex: Direito Civil, Direito Trabalhista..."
              />
            </div>

            <div>
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Input
                id="documentType"
                value={formData.metadata?.documentType || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata!, documentType: e.target.value }
                }))}
                placeholder="Ex: Petição, Contrato, Parecer..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="complexity">Complexidade (1-10)</Label>
                <Input
                  id="complexity"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.metadata?.complexity || 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata!, complexity: parseInt(e.target.value) || 1 }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="estimatedTime">Tempo Estimado (min)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  min="1"
                  value={formData.metadata?.estimatedTime || 5}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata!, estimatedTime: parseInt(e.target.value) || 5 }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
          <TabsTrigger value="fields">Campos Obrigatórios</TabsTrigger>
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
        </TabsList>

        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nova tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Palavras-chave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Nova palavra-chave..."
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.metadata?.keywords?.map(keyword => (
                  <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle>Campos Obrigatórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequiredField}
                  onChange={(e) => setNewRequiredField(e.target.value)}
                  placeholder="Ex: Nome do réu, Valor da causa..."
                  onKeyPress={(e) => e.key === 'Enter' && addRequiredField()}
                />
                <Button onClick={addRequiredField} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.metadata?.requiredFields?.map(field => (
                  <div key={field} className="flex items-center justify-between p-2 border rounded">
                    <span>{field}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-red-500" 
                      onClick={() => removeRequiredField(field)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Interno *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.internalPrompt || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, internalPrompt: e.target.value }))}
                placeholder="Digite aqui o prompt que será usado pela IA para gerar o documento..."
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Salvar Prompt
        </Button>
        <Button onClick={handleTest} variant="outline" className="flex-1">
          <TestTube className="h-4 w-4 mr-2" />
          Testar Prompt
        </Button>
        <Button onClick={onCancel} variant="ghost">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
