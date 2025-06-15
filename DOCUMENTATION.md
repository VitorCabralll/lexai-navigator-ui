
# LexAI - Documentação Técnica

## 📋 Visão Geral

LexAI é uma plataforma de inteligência artificial especializada na geração de documentos jurídicos. O sistema permite que usuários utilizem agentes inteligentes ou prompts predefinidos para criar documentos jurídicos personalizados com base em documentos de apoio e modelos de referência.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router DOM
- **Estado**: Context API + React Query
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **IA**: OpenAI API
- **OCR**: Tesseract.js
- **Exportação**: jsPDF + docx

### Arquitetura de Componentes
```
App
├── AuthProvider (Autenticação)
│   └── WorkspaceProvider (Contexto de workspace)
│       └── Layout (Layout principal)
│           ├── AppSidebar (Navegação lateral)
│           ├── Header (Cabeçalho)
│           └── Páginas
│               ├── Generate (Geração de documentos)
│               ├── Dashboard (Painel principal)
│               ├── Agents (Gerenciamento de agentes)
│               └── Settings (Configurações)
```

## 🔧 Componentes Principais

### FileUpload
**Localização**: `src/components/FileUpload.tsx`

Gerencia upload e processamento de arquivos com OCR automático:
- Drag & drop com feedback visual
- OCR para imagens usando Tesseract.js
- Validação de tipos de arquivo
- Separação entre documentos de apoio e modelos
- Progress indicators e toast notifications

### PromptGrid
**Localização**: `src/components/PromptGrid.tsx`

Exibe grid responsivo de prompts predefinidos:
- Layout responsivo (1-3 colunas)
- Sistema de busca integrado
- Filtros por categoria
- Estados de seleção visual
- Categorização automática

### GenerationProgress
**Localização**: `src/components/GenerationProgress.tsx`

Indicador de progresso da geração:
- 4 etapas animadas de processamento
- Barra de progresso suave
- Descrições contextuais
- Auto-complete com callback

### ExpandableDocument
**Localização**: `src/components/ExpandableDocument.tsx`

Visualizador e editor de documentos:
- Modo expandido/colapsado
- Edição inline do conteúdo
- Exportação para PDF/DOCX
- Preview em tempo real

## 🎯 Fluxo de Funcionamento

### 1. Autenticação
```typescript
// Contexto de autenticação
const { user, signIn, signOut } = useAuth();

// Providers suportados
- Email/Password
- Google OAuth
```

### 2. Seleção de Modo
```typescript
// Modos de geração
type GenerationMode = 'agent' | 'prompt';

// Agentes (oficiais ou personalizados)
interface Agent {
  id: string;
  name: string;
  theme: string;
  description: string;
  isOfficial: boolean;
}

// Prompts predefinidos
interface PredefinedPrompt {
  id: string;
  name: string;
  category: string;
  description: string;
}
```

### 3. Upload de Arquivos
```typescript
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  content?: string; // Texto extraído via OCR
}

// Tipos de arquivo
- Documentos de apoio (múltiplos)
- Modelo de referência (único)
- Modo rigoroso (seguir modelo exatamente)
```

### 4. Geração de Documento
```typescript
// Processo de geração
1. Leitura de documentos (OCR)
2. Aplicação de inteligência (IA)
3. Redação jurídica
4. Finalização do documento
```

## 🔥 Integração Firebase

### Configuração
```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
```

### Estrutura de Dados

#### Usuários
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}
```

#### Workspaces
```typescript
interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
}
```

#### Agentes
```typescript
interface Agent {
  id: string;
  name: string;
  theme: string;
  prompt: string;
  workspaceId?: string;
  isOfficial: boolean;
  createdBy: string;
}
```

#### Documentos
```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  type: 'agent' | 'prompt';
  agentId?: string;
  promptId?: string;
  supportFiles: UploadedFile[];
  templateFile?: UploadedFile;
  strictMode: boolean;
  createdBy: string;
  workspaceId: string;
  createdAt: Date;
}
```

## 🛡️ Segurança

### Regras Firestore
```javascript
// Acesso baseado em workspace
match /workspaces/{workspaceId} {
  allow read, write: if request.auth.uid in resource.data.members;
}

// Documentos privados por workspace
match /documents/{documentId} {
  allow read, write: if request.auth != null &&
    request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members;
}
```

### Validação de Upload
```typescript
// Tipos permitidos
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

// Tamanho máximo: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;
```

## 🎨 Sistema de Design

### Paleta de Cores
```css
/* Cores principais */
--primary: blue-600
--success: green-600
--warning: yellow-600
--destructive: red-600

/* Contextos específicos */
--support-files: blue-50/blue-200
--template-file: green-50/green-200
```

### Componentes Responsivos
```css
/* Breakpoints */
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */

/* Grid padrão */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

## ⚡ Performance

### Otimizações Implementadas
- **Code Splitting**: Lazy loading de páginas
- **Memoização**: Componentes pesados memoizados
- **Tree Shaking**: Importação seletiva de ícones
- **Bundle Optimization**: Minificação automática
- **Image Optimization**: Compressão de uploads

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
    },
  },
});
```

## 🧪 Testes (Estrutura Recomendada)

### Componentes
```typescript
// Teste de renderização
test('FileUpload renders correctly', () => {
  render(<FileUpload {...defaultProps} />);
  expect(screen.getByText('Arrastar arquivos')).toBeInTheDocument();
});

// Teste de interação
test('handles file upload', async () => {
  const mockOnChange = jest.fn();
  render(<FileUpload onSupportFilesChange={mockOnChange} />);
  
  const input = screen.getByLabelText('upload');
  fireEvent.change(input, { target: { files: [mockFile] } });
  
  await waitFor(() => {
    expect(mockOnChange).toHaveBeenCalled();
  });
});
```

### Hooks
```typescript
test('useAuth provides user context', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider,
  });
  
  expect(result.current.user).toBeDefined();
  expect(result.current.signIn).toBeInstanceOf(Function);
});
```

## 🚀 Build e Deploy

### Build de Produção
```bash
# Instalar dependências
npm install

# Build otimizado
npm run build

# Preview local
npm run preview
```

### Deploy Firebase
```bash
# Autenticar
firebase login

# Configurar projeto
firebase use --add

# Deploy completo
firebase deploy

# Deploy específico
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## 🔄 CI/CD

### GitHub Actions (Exemplo)
```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 📊 Monitoramento

### Métricas Importantes
- Tempo de geração de documentos
- Taxa de sucesso de uploads
- Uso de agentes vs prompts
- Erros de OCR
- Performance de carregamento

### Logging
```typescript
// Estrutura de logs
console.log('Document generation started', {
  mode: 'agent',
  agentId: 'abc123',
  timestamp: new Date().toISOString(),
  userId: user.uid
});
```

## 🔮 Extensibilidade

### Novos Tipos de Prompt
```typescript
// Adicionar em src/types/prompts.ts
const NEW_PROMPT: PredefinedPrompt = {
  id: 'novo-tipo',
  name: 'Novo Tipo de Documento',
  category: 'Nova Categoria',
  description: 'Descrição do novo tipo'
};
```

### Novos Agentes Oficiais
```typescript
// Adicionar via Firestore
const officialAgent: Agent = {
  name: 'Especialista em Direito Digital',
  theme: 'Tecnologia e Direito',
  isOfficial: true,
  // ...
};
```

## 📚 Recursos de Desenvolvimento

### Ferramentas Recomendadas
- **VSCode** com extensões TypeScript e Tailwind
- **React DevTools** para debug
- **Firebase Emulator Suite** para desenvolvimento local
- **Chrome DevTools** para performance

### Convenções de Código
- **Naming**: camelCase para variáveis, PascalCase para componentes
- **Files**: kebab-case para arquivos, PascalCase para componentes
- **Imports**: Absolute imports com @ alias
- **Types**: Interfaces explícitas para props

---

**Última atualização**: Dezembro 2024  
**Versão do React**: 18.3.1  
**Versão do TypeScript**: 5.0+
