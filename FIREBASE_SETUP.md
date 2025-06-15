
# Configuração Firebase - LexAI

## 🚀 Passos para configurar Firebase

### 1. Criar projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `lexai-production` (ou nome de sua escolha)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Authentication
1. No console Firebase, vá para **Authentication**
2. Clique em "Começar"
3. Na aba **Sign-in method**, habilite:
   - **Email/password**
   - **Google** (configure OAuth)

### 3. Configurar Firestore Database
1. Vá para **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha **Modo de produção**
4. Selecione localização (recomendado: southamerica-east1)

### 4. Configurar Storage
1. Vá para **Storage**
2. Clique em "Começar"
3. Escolha **Modo de produção**
4. Usar mesma localização do Firestore

### 5. Configurar Web App
1. No overview do projeto, clique no ícone **Web** (</>)
2. Nome do app: `LexAI Web`
3. **NÃO** marcar "Configure Firebase Hosting"
4. Copiar as configurações mostradas

### 6. Configurar variáveis de ambiente

#### Frontend (.env.local)
```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Backend (functions/.env)
```env
OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

### 7. Deploy das regras de segurança
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto (se necessário)
firebase init

# Selecionar projeto
firebase use --add

# Deploy das regras
firebase deploy --only firestore:rules,storage:rules
```

### 8. Deploy das Functions
```bash
# Navegar para pasta functions
cd functions

# Instalar dependências
npm install

# Voltar para raiz e fazer deploy
cd ..
firebase deploy --only functions
```

### 9. Deploy do Frontend
```bash
# Build do projeto
npm run build

# Deploy (se configurado hosting)
firebase deploy --only hosting
```

## 🔐 Segurança

### Regras Firestore
- ✅ Usuários só acessam seus dados
- ✅ Workspaces isolados por membro
- ✅ Validação de dados no servidor

### Regras Storage
- ✅ Upload limitado a 50MB
- ✅ Tipos de arquivo validados
- ✅ Acesso restrito por workspace

## 🧪 Testes

### Testar Authentication
1. Criar conta nova
2. Login com Google
3. Logout

### Testar Firestore
1. Criar workspace
2. Criar agente
3. Gerar documento

### Testar Storage
1. Upload de arquivo
2. Download de documento
3. Exclusão de arquivo

## 🚨 Troubleshooting

### Erro: Firebase not initialized
- Verificar variáveis de ambiente
- Verificar se todas as configurações estão corretas

### Erro: Permission denied
- Verificar regras Firestore/Storage
- Verificar se usuário está autenticado

### Erro: Function timeout
- Verificar configuração OPENAI_API_KEY
- Aumentar timeout das functions se necessário

## 📊 Monitoramento

### Métricas importantes
- Usuários ativos
- Documentos gerados
- Uploads realizados
- Erros de function

### Configurar alertas
1. Firebase Console > Monitoring
2. Configurar alertas para:
   - Erros de authentication
   - Falhas de function
   - Uso excessivo de quota

---

**⚠️ Importante**: Mantenha suas chaves API seguras e nunca as commite no código!
