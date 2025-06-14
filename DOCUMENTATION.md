
# LexAI - Documentação do Projeto

## 📋 Visão Geral

LexAI é uma plataforma de inteligência artificial especializada na geração de documentos jurídicos. O sistema permite que usuários utilizem agentes inteligentes ou prompts predefinidos para criar documentos jurídicos personalizados com base em documentos de apoio e modelos de referência.

## 🏗️ Arquitetura do Projeto

### Tecnologias Utilizadas
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router DOM
- **Estado**: Context API + React Query
- **Upload/OCR**: Tesseract.js
- **Exportação**: jsPDF + docx
- **Ícones**: Lucide React

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base do shadcn/ui
│   ├── Layout.tsx      # Layout principal da aplicação
│   ├── PromptGrid.tsx  # Grid de seleção de prompts
│   ├── PromptSearch.tsx # Busca e filtros de prompts
│   ├── FileUpload.tsx  # Upload e processamento de arquivos
│   ├── GenerationProgress.tsx # Indicador de progresso
│   ├── DocumentEditor.tsx # Editor de documentos
│   ├── ExpandableDocument.tsx # Visualizador/editor expandível
│   └── ExportButtons.tsx # Botões de exportação
├── contexts/           # Contextos React
│   └── WorkspaceContext.tsx # Gerenciamento de workspaces
├── hooks/              # Hooks customizados
│   ├── useAuth.tsx     # Autenticação
│   ├── use-toast.ts    # Sistema de notificações
│   └── useTheme.tsx    # Gerenciamento de tema
├── pages/              # Páginas da aplicação
│   ├── onboarding/     # Fluxo de onboarding
│   ├── Generate.tsx    # Página principal de geração
│   ├── Dashboard.tsx   # Dashboard do usuário
│   ├── Agents.tsx      # Gerenciamento de agentes
│   └── ...
├── types/              # Definições de tipos
│   └── prompts.ts      # Tipos dos prompts predefinidos
└── lib/                # Utilitários e configurações
    ├── firebase.ts     # Configuração Firebase
    └── utils.ts        # Funções utilitárias
```

## 🎯 Funcionalidades Principais

### 1. Geração de Documentos
- **Modos de Geração**:
  - Agentes Inteligentes: Utilizando agentes customizados ou oficiais
  - Prompts Predefinidos: Templates para tipos específicos de documentos

### 2. Upload e Processamento de Arquivos
- **Documentos de Apoio**: Múltiplos arquivos com OCR automático
- **Modelos de Referência**: Templates .docx para formatação
- **Modo Rigoroso**: Seguir exatamente o modelo fornecido

### 3. Sistema de Agentes
- **Agentes Oficiais**: Pré-configurados pela plataforma
- **Agentes Personalizados**: Criados pelos usuários
- **Workspaces**: Organização por ambiente de trabalho

## 🔧 Componentes Principais

### FileUpload
**Localização**: `src/components/FileUpload.tsx`
**Funcionalidades**:
- Drag & drop para upload
- OCR automático para imagens
- Validação de tipos de arquivo
- Feedback visual de progresso
- Separação entre documentos de apoio e modelos

### PromptGrid
**Localização**: `src/components/PromptGrid.tsx`
**Funcionalidades**:
- Grid responsivo de prompts
- Sistema de busca integrado
- Filtros por categoria
- Seleção visual com feedback

### GenerationProgress
**Localização**: `src/components/GenerationProgress.tsx`
**Funcionalidades**:
- Progresso detalhado da geração
- Animações suaves
- Feedback contextual por etapa

### ExpandableDocument
**Localização**: `src/components/ExpandableDocument.tsx`
**Funcionalidades**:
- Visualização e edição do documento
- Modo expandido/colapsado
- Exportação para PDF/DOCX

## 📝 Fluxo de Uso

### 1. Configuração
1. Usuário seleciona modo de geração (Agente ou Prompt)
2. Escolhe agente/prompt específico
3. Adiciona instruções personalizadas

### 2. Upload de Arquivos
1. Anexa documentos de apoio (opcional)
2. Faz upload de modelo de referência (opcional)
3. Configura modo rigoroso se necessário

### 3. Geração
1. Sistema processa documentos com OCR
2. Aplica inteligência do agente/prompt
3. Gera conteúdo jurídico baseado no contexto
4. Finaliza com formatação adequada

### 4. Edição e Exportação
1. Usuário pode editar o documento gerado
2. Exporta para PDF ou DOCX
3. Salva para uso futuro

## 🎨 Sistema de Design

### Cores Principais
- **Primary**: Azul para elementos interativos
- **Success**: Verde para feedback positivo
- **Warning**: Amarelo para alertas
- **Destructive**: Vermelho para ações perigosas

### Componentes UI
Baseados no shadcn/ui com customizações:
- Cards para agrupamento
- Badges para categorização
- Progress bars para feedback
- Toast notifications para alertas

## 🔄 Estado da Aplicação

### Contextos Principais
1. **WorkspaceContext**: Gerencia workspaces e agentes
2. **AuthContext**: Autenticação do usuário
3. **ToastContext**: Sistema de notificações

### Estados Locais
- Upload de arquivos com feedback
- Progresso de geração
- Conteúdo do documento
- Filtros e busca

## 🚀 Performance

### Otimizações Implementadas
- Tree-shaking de ícones Lucide
- Lazy loading de componentes
- Memoização de componentes pesados
- Debounce em campos de busca

### Considerações Futuras
- Virtualização para listas grandes
- Cache de resultados de OCR
- Compressão de uploads
- Service Worker para offline

## 🧪 Testes e Qualidade

### Estrutura de Testes (Recomendada)
```
tests/
├── components/     # Testes de componentes
├── hooks/         # Testes de hooks
├── pages/         # Testes de páginas
└── utils/         # Testes de utilitários
```

### Ferramentas Recomendadas
- Jest + Testing Library para testes
- ESLint + Prettier para qualidade de código
- TypeScript para tipagem estática

## 📦 Deploy e CI/CD

### Build de Produção
```bash
npm run build
```

### Variáveis de Ambiente
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

## 🔧 Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
npm install
npm run dev
```

### Scripts Disponíveis
- `dev`: Servidor de desenvolvimento
- `build`: Build de produção
- `preview`: Preview do build
- `lint`: Verificação de código

## 📚 Recursos Adicionais

### Documentação Externa
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Tesseract.js](https://tesseract.projectnaptha.com/)

### Contribuição
1. Fork do projeto
2. Criar branch para feature
3. Commit das mudanças
4. Push para branch
5. Abrir Pull Request

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
