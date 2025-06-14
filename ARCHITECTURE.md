
# Arquitetura Técnica - LexAI

## 🏛️ Visão Arquitetural

### Padrões Arquiteturais
- **Component-Based Architecture**: Componentes React reutilizáveis
- **Context Pattern**: Gerenciamento de estado global
- **Compound Components**: Componentes compostos (UI)
- **Custom Hooks**: Lógica reutilizável

### Fluxo de Dados
```
Usuario -> UI Component -> Context/Hook -> API/Service -> Estado
```

## 📊 Diagrama de Componentes

### Hierarquia Principal
```
App
├── AuthProvider
│   └── WorkspaceProvider
│       └── Layout
│           ├── AppSidebar
│           ├── Header
│           └── Pages
│               ├── Generate (Principal)
│               ├── Dashboard
│               ├── Agents
│               └── Settings
```

### Componentes de Geração
```
Generate Page
├── Mode Selection (Agent/Prompt)
├── Configuration Panel
│   ├── Agent Selection
│   ├── PromptGrid
│   └── Instructions Input
├── FileUpload
│   ├── Support Documents
│   └── Reference Template
├── Generation Process
│   ├── GenerationProgress
│   └── Progress Steps
└── Document Output
    ├── ExpandableDocument
    ├── DocumentEditor
    └── ExportButtons
```

## 🔄 Estados e Contextos

### WorkspaceContext
```typescript
interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  agents: Agent[];
  officialAgents: Agent[];
  setSelectedWorkspace: (workspace: Workspace) => void;
}
```

### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

## 🎯 Tipos de Dados Principais

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  theme: string;
  description: string;
  workspaceId?: string;
  isOfficial: boolean;
}
```

### UploadedFile
```typescript
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}
```

### PredefinedPrompt
```typescript
interface PredefinedPrompt {
  id: string;
  name: string;
  description: string;
  category: string;
}
```

## 🔧 Serviços e Utilitários

### OCR Service (Tesseract.js)
- Processamento de imagens
- Extração de texto
- Suporte a múltiplos idiomas

### Export Service
- Geração de PDF (jsPDF)
- Geração de DOCX (docx)
- Formatação automática

### Toast Service
- Notificações contextuais
- Estados de sucesso/erro
- Auto-dismiss

## 🎨 Sistema de Design Técnico

### Tailwind Configuration
- Classes utilitárias customizadas
- Tema consistente
- Responsividade mobile-first

### Shadcn/ui Integration
- Componentes base padronizados
- Variant system
- Acessibilidade built-in

## 🚀 Performance e Otimização

### Code Splitting
```typescript
// Lazy loading de páginas
const Generate = lazy(() => import('./pages/Generate'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### Memoização
```typescript
// Componentes pesados memoizados
const MemoizedPromptGrid = memo(PromptGrid);
const MemoizedFileUpload = memo(FileUpload);
```

### Bundle Optimization
- Tree-shaking automático
- Dynamic imports para ícones
- Minificação em produção

## 🔒 Segurança

### Validação de Arquivos
- Tipos de arquivo permitidos
- Tamanho máximo de upload
- Sanitização de conteúdo

### Tratamento de Dados
- Escape de strings
- Validação de entrada
- Tipos TypeScript rigorosos

## 📱 Responsividade

### Breakpoints
```css
sm: 640px   /* Smartphone */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

### Grid System
- Mobile-first approach
- Flexible layouts
- Touch-friendly interfaces

## 🔄 Lifecycle dos Componentes

### Generate Page Lifecycle
1. **Mount**: Carrega agentes e prompts
2. **Configuration**: Usuario configura parâmetros
3. **Upload**: Processa arquivos
4. **Generation**: Executa geração
5. **Display**: Mostra resultado
6. **Export**: Permite download

### FileUpload Lifecycle
1. **Idle**: Aguarda seleção
2. **Processing**: OCR e validação
3. **Complete**: Arquivo processado
4. **Error**: Tratamento de erros

## 🧪 Padrões de Teste

### Component Testing
```typescript
// Teste de componente isolado
test('PromptGrid renders correctly', () => {
  render(<PromptGrid selectedPromptId="" onPromptSelect={jest.fn()} />);
  expect(screen.getByText('Parecer Jurídico')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
// Teste de fluxo completo
test('Complete generation flow', async () => {
  // Setup
  // Interaction
  // Assertion
});
```

## 📈 Monitoramento e Analytics

### Métricas Recomendadas
- Tempo de geração de documentos
- Taxa de sucesso de uploads
- Uso de agentes vs prompts
- Erros de OCR

### Logging
```typescript
// Estrutura de logs
console.log('Document generation started', {
  mode: 'agent',
  agentId: 'abc123',
  timestamp: new Date().toISOString()
});
```

## 🔮 Extensibilidade

### Plugin System (Futuro)
- Agentes externos
- Prompts customizados
- Integrações de terceiros

### API Integration Points
- Document generation service
- OCR service alternatives
- Export format extensions

---

**Mantido por**: Equipe de Desenvolvimento LexAI
**Última revisão**: Dezembro 2024
