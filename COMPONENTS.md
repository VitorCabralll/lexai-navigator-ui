
# Guia de Componentes - LexAI

## 📋 Índice de Componentes

### 🎨 UI Base (shadcn/ui)
- Badge, Button, Card, Checkbox, Input, Label
- Progress, Select, Skeleton, Toast, Textarea

### 🧩 Componentes Customizados
- FileUpload, PromptGrid, PromptSearch
- GenerationProgress, DocumentEditor, ExpandableDocument

## 📝 Documentação Detalhada

### FileUpload Component

**Propósito**: Gerenciar upload e processamento de arquivos com OCR

**Props**:
```typescript
interface FileUploadProps {
  onSupportFilesChange: (files: UploadedFile[]) => void;
  onTemplateFileChange: (file: UploadedFile | null) => void;
  onStrictModeChange: (enabled: boolean) => void;
  strictMode: boolean;
}
```

**Funcionalidades**:
- Drag & drop com feedback visual
- OCR automático para imagens (Tesseract.js)
- Validação de tipos de arquivo
- Progress indicators
- Toast notifications
- Separação clara entre documentos de apoio e modelos

**Estados Internos**:
- `supportFiles`: Array de arquivos de apoio
- `templateFile`: Arquivo de modelo único
- `isProcessingSupportFiles/Template`: Estados de loading
- `isDragOver`: Feedback visual de drag

**Exemplo de Uso**:
```tsx
<FileUpload
  onSupportFilesChange={setSupportFiles}
  onTemplateFileChange={setTemplateFile}
  onStrictModeChange={setStrictMode}
  strictMode={strictMode}
/>
```

### PromptGrid Component

**Propósito**: Exibir grid de prompts predefinidos com busca e filtros

**Props**:
```typescript
interface PromptGridProps {
  selectedPromptId: string;
  onPromptSelect: (promptId: string) => void;
}
```

**Funcionalidades**:
- Grid responsivo (1-3 colunas)
- Integração com PromptSearch
- Categorização visual
- Estados de seleção
- Animações hover/scale

**Dados**:
- Importa de `PREDEFINED_PROMPTS`
- Mapeia ícones por tipo de prompt
- Categoriza automaticamente

**Exemplo de Uso**:
```tsx
<PromptGrid 
  selectedPromptId={selectedPromptId}
  onPromptSelect={handlePromptSelect}
/>
```

### PromptSearch Component

**Propósito**: Sistema de busca e filtros para prompts

**Props**:
```typescript
interface PromptSearchProps {
  onSearchChange: (query: string) => void;
  onCategoryFilter: (categories: string[]) => void;
  availableCategories: string[];
}
```

**Funcionalidades**:
- Campo de busca com ícone
- Filtros por categoria (badges clicáveis)
- Botão "Limpar filtros"
- Estados visuais para filtros ativos

**Estados**:
- `searchQuery`: Texto da busca
- `selectedCategories`: Categorias selecionadas

### GenerationProgress Component

**Propósito**: Indicador de progresso da geração de documentos

**Props**:
```typescript
interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete: () => void;
}
```

**Funcionalidades**:
- 4 etapas de progresso animadas
- Barra de progresso suave
- Ícones contextuais por etapa
- Descrições detalhadas
- Auto-complete com callback

**Etapas**:
1. Lendo documentos (2s)
2. Aplicando inteligência (3s)
3. Redigindo texto jurídico (2.5s)
4. Finalizando documento (1.5s)

### DocumentEditor Component

**Propósito**: Editor simples para conteúdo de documentos

**Props**:
```typescript
interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
}
```

**Funcionalidades**:
- Auto-resize do textarea
- Font monospace para clareza
- Placeholder informativo

### ExportButtons Component

**Propósito**: Botões para exportar documentos

**Props**:
```typescript
interface ExportButtonsProps {
  content: string;
  filename: string;
}
```

**Funcionalidades**:
- Export para DOCX (docx library)
- Export para PDF (jsPDF)
- Download automático
- Tratamento de erros

## 🎯 Padrões de Design

### Estrutura de Card
```tsx
<Card className="border-{color}-200 transition-all hover:shadow-md">
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-lg">
      <Icon className="h-5 w-5 text-{color}-600" />
      Título
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### Feedback Visual
```tsx
// Loading state
{isLoading && (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    Processando...
  </div>
)}

// Success state
<Badge variant="default" className="bg-green-100 text-green-800">
  Sucesso
</Badge>

// Error handling
toast({
  title: "Erro",
  description: "Mensagem de erro detalhada",
  variant: "destructive",
});
```

### Responsividade
```tsx
// Grid responsivo padrão
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Layout principal
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// Spacing consistente
<div className="space-y-4"> {/* Vertical */}
<div className="flex gap-2">   {/* Horizontal */}
```

## 🔧 Hooks Customizados

### useToast
```typescript
const { toast } = useToast();

toast({
  title: "Título",
  description: "Descrição",
  variant: "default" | "destructive",
});
```

### useAuth
```typescript
const { user, login, logout, loading } = useAuth();
```

### useWorkspace
```typescript
const { 
  workspaces, 
  selectedWorkspace, 
  agents, 
  officialAgents 
} = useWorkspace();
```

## 🎨 Sistema de Cores

### Código de Cores por Contexto
```css
/* Documentos de Apoio */
border-blue-200, bg-blue-50, text-blue-600

/* Modelo de Referência */
border-green-200, bg-green-50, text-green-600

/* Estados */
/* Success */ bg-green-100, text-green-800
/* Warning */ bg-yellow-100, text-yellow-800
/* Error */   bg-red-100, text-red-800
/* Info */    bg-blue-100, text-blue-800
```

## 📱 Responsividade por Componente

### FileUpload
- Mobile: Stack vertical
- Tablet: Duas colunas
- Desktop: Layout otimizado

### PromptGrid
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3 colunas

### Generate Page
- Mobile: Stack completo
- Desktop: Duas colunas (config + preview)

## 🔄 Estados de Loading

### Skeleton Patterns
```tsx
// Card skeleton
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-8 w-full" />
</div>

// Grid skeleton
<div className="grid grid-cols-3 gap-4">
  {[...Array(6)].map((_, i) => (
    <Skeleton key={i} className="h-32 w-full" />
  ))}
</div>
```

## 🧪 Testing Guidelines

### Component Testing
```typescript
// Render test
test('renders without crashing', () => {
  render(<Component {...requiredProps} />);
});

// Interaction test
test('handles user interaction', async () => {
  const mockFn = jest.fn();
  render(<Component onAction={mockFn} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled();
});
```

### Accessibility Testing
```typescript
// Screen reader
expect(screen.getByLabelText('Upload arquivo')).toBeInTheDocument();

// Keyboard navigation
fireEvent.keyDown(element, { key: 'Enter' });
```

---

**Nota**: Mantenha sempre a consistência visual e funcional entre componentes
**Revisão**: Dezembro 2024
