
# LexAI - Plataforma de Inteligência Artificial Jurídica

## 📋 Sobre o Projeto

LexAI é uma plataforma avançada de inteligência artificial especializada na geração de documentos jurídicos. A aplicação permite que advogados e profissionais do direito utilizem agentes inteligentes ou prompts predefinidos para criar documentos jurídicos personalizados, utilizando documentos de apoio e modelos de referência.

## ✨ Principais Funcionalidades

- **Geração Inteligente de Documentos**: Criação de documentos jurídicos usando IA
- **Agentes Personalizados**: Criação e uso de agentes especializados por área do direito
- **Prompts Predefinidos**: Templates prontos para diversos tipos de documentos
- **OCR Automático**: Extração de texto de imagens e documentos escaneados
- **Workspaces Colaborativos**: Organização por equipes e projetos
- **Exportação Múltipla**: Documentos em PDF e DOCX
- **Interface Responsiva**: Otimizada para desktop, tablet e mobile

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface pré-construídos
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado e cache
- **Tesseract.js** - OCR (Reconhecimento Óptico de Caracteres)

### Backend e Serviços
- **Firebase Authentication** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Firebase Functions** - Processamento serverless
- **OpenAI API** - Inteligência artificial para geração de texto

### Exportação
- **jsPDF** - Geração de arquivos PDF
- **docx** - Geração de arquivos Word

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base do shadcn/ui
│   ├── FileUpload.tsx  # Upload e processamento de arquivos
│   ├── PromptGrid.tsx  # Grid de seleção de prompts
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Generate.tsx    # Página principal de geração
│   ├── Dashboard.tsx   # Dashboard do usuário
│   ├── Agents.tsx      # Gerenciamento de agentes
│   └── ...
├── hooks/              # Hooks customizados
├── contexts/           # Contextos React
├── types/              # Definições de tipos TypeScript
└── lib/                # Utilitários e configurações

functions/              # Firebase Functions
├── src/
│   ├── functions/      # Cloud Functions
│   ├── services/       # Serviços de negócio
│   └── types/          # Tipos compartilhados
```

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18 ou superior
- npm ou yarn
- Conta Firebase
- Chave da API OpenAI

### Instalação

1. **Clone o repositório**:
```bash
git clone <url-do-repositorio>
cd lexai
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações do Firebase:
```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

4. **Configure as Firebase Functions**:
```bash
cd functions
cp .env.example .env
```

Edite o arquivo `functions/.env`:
```env
OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

5. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 🔥 Configuração do Firebase

Siga o guia detalhado em [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) para:
- Criar e configurar o projeto Firebase
- Configurar Authentication, Firestore e Storage
- Fazer deploy das regras de segurança
- Configurar e fazer deploy das Cloud Functions

## 📖 Documentação Adicional

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura técnica detalhada
- **[COMPONENTS.md](./COMPONENTS.md)** - Guia de componentes
- **[API.md](./API.md)** - Documentação de APIs e integrações
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guia de deploy
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Configuração Firebase
- **[FIREBASE_EMULATORS.md](./FIREBASE_EMULATORS.md)** - Executar Firebase Emulator Suite

## 🎯 Como Usar

### 1. Criação de Conta
- Registre-se usando email/senha ou Google
- Complete o processo de onboarding
- Crie seu primeiro workspace

### 2. Geração de Documentos
- Escolha entre usar um agente ou prompt predefinido
- Adicione instruções específicas
- Faça upload de documentos de apoio (opcional)
- Configure modelo de referência (opcional)
- Gere o documento

### 3. Edição e Exportação
- Edite o documento gerado
- Exporte para PDF ou DOCX
- Salve no workspace para uso futuro

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run preview      # Visualiza build de produção

# Firebase
npm run deploy       # Deploy completo para Firebase
firebase serve       # Testa functions localmente
```

## 🔒 Segurança

- Autenticação obrigatória para todas as funcionalidades
- Regras de segurança rigorosas no Firestore
- Validação de tipos de arquivo no upload
- Rate limiting nas Cloud Functions
- Dados isolados por workspace

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no repositório
- Consulte a documentação técnica
- Verifique o guia de troubleshooting em [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🏗️ Roadmap

- [ ] Integração com mais modelos de IA
- [ ] Templates de documentos avançados
- [ ] Colaboração em tempo real
- [ ] API pública
- [ ] Aplicativo mobile
- [ ] Integração com sistemas jurídicos

---

**Desenvolvido com ❤️ para a comunidade jurídica**
