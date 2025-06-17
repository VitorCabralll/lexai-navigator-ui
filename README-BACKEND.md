
# LexAI Backend - Firebase Functions

Backend do LexAI implementado com Firebase Functions, TypeScript e integração com OpenAI.

## 🚀 Funcionalidades

### 1. Processamento de Modelos DOCX (`processarModeloDocx`)
- Recebe arquivos .docx via upload
- Extrai estrutura e detecta variáveis
- Gera prompt mestre para o agente
- Salva no Firestore e Firebase Storage

### 2. Geração de Documentos com IA (`gerarDocumentoComIA`)
- Pipeline de 3 etapas com OpenAI
- Suporte a agentes e prompts predefinidos
- Modo rigoroso para seguir templates exatos
- Retorna documento completo com metadados

## 📋 Setup e Instalação

### Pré-requisitos
```bash
# Node.js 18+
node --version

# Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login
```

### Configuração do Projeto
```bash
# 1. Clonar e navegar para functions
cd functions

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas chaves

# 4. Configurar Firebase
firebase use --add
# Selecionar seu projeto
```

### Configurar OpenAI API Key
```bash
# Via Firebase CLI
firebase functions:config:set openai.api_key="sk-your-key-here"

# Ou via Environment Variables (recomendado)
firebase functions:config:set environment.openai_api_key="sk-your-key-here"
```

## 🔧 Desenvolvimento

### Executar Localmente
```bash
# Build e emuladores
npm run serve

# Apenas build
npm run build

# Deploy
npm run deploy
```

### Testar Functions
```bash
# Processar modelo DOCX
curl -X POST http://localhost:5001/your-project/us-central1/processarModeloDocx \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@modelo.docx" \
  -F "agentId=agent123" \
  -F "workspaceId=workspace123"

# Gerar documento
curl -X POST http://localhost:5001/your-project/us-central1/gerarDocumentoComIA \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "agent",
    "agentId": "agent123",
    "instructions": "Gerar parecer sobre o caso X",
    "workspaceId": "workspace123"
  }'
```

## 📡 Endpoints da API

### POST `/processarModeloDocx`
Processa arquivo .docx e cria agente.

**Parâmetros:**
- `file`: Arquivo .docx (multipart)
- `agentId`: ID do agente
- `workspaceId`: ID do workspace

**Response:**
```json
{
  "success": true,
  "promptId": "prompt123",
  "structure": { ... },
  "variables": ["NOME", "DATA"],
  "message": "Modelo processado com sucesso"
}
```

### POST `/gerarDocumentoComIA`
Gera documento usando IA.

**Body:**
```json
{
  "mode": "agent|prompt",
  "agentId": "agent123",
  "instructions": "Instruções específicas",
  "supportDocuments": ["url1", "url2"],
  "strictMode": false,
  "workspaceId": "workspace123"
}
```

**Response:**
```json
{
  "success": true,
  "documentId": "doc123",
  "content": "Conteúdo completo...",
  "metadata": {
    "tokensUsed": 1500,
    "processingTime": 45000,
    "steps": [...]
  },
  "sections": [...]
}
```

### POST `/ocr`
Realiza OCR no arquivo de imagem enviado e retorna o texto extraído.

**Parâmetros:**
- `file`: Imagem JPG, PNG, GIF, BMP ou TIFF (multipart)

**Response:**
```json
{
  "success": true,
  "text": "Conteúdo OCR",
  "confidence": 92.3
}
```

## 🔒 Segurança

### Autenticação
Todas as rotas exigem token Firebase Auth:
```
Authorization: Bearer <firebase-id-token>
```

### Autorização
- Usuários só acessam seus workspaces
- Verificação automática de membership
- Isolamento de dados por workspace

### Validação
- Arquivos: Tipo, tamanho, conteúdo
- Entrada: Joi schema validation
- Rate limiting: 10 req/min por usuário

## 📊 Estrutura do Firestore

```
workspaces/{id}
├── name, ownerId, members[]

agents/{id}
├── name, theme, workspaceId
├── masterPrompt, documentTemplate

prompts/{id}
├── agentId, content, variables[]
├── structure, version

documents/{id}
├── title, content, userId
├── metadata, status, createdAt
```

## 🔧 Configurações de Produção

### Environment Variables
```bash
# No Firebase Console > Functions > Configuration
OPENAI_API_KEY=sk-...
FIREBASE_STORAGE_BUCKET=project.appspot.com
```

### Resource Allocation
```javascript
// functions/src/index.ts
export const gerarDocumentoComIA = onRequest({
  timeoutSeconds: 540,
  memory: "1GiB",
  maxInstances: 10
}, app);
```

### Monitoring
- Logs: Firebase Console > Functions > Logs
- Metrics: Cloud Monitoring integration
- Alerts: Error rate, latency thresholds

## 🐛 Debug e Logs

### Ver Logs
```bash
# Logs em tempo real
firebase functions:log

# Logs específicos
firebase functions:log --only processarModeloDocx
```

### Debug Local
```bash
# Ativar debug
export FIREBASE_CONFIG='{"projectId":"your-project"}'
npm run serve
```

## 📈 Performance

### Otimizações Implementadas
- Cache de prompts mestres
- Compression de responses
- Connection pooling
- Timeout apropriados

### Limites
- Arquivo: 50MB máximo
- Timeout: 9 minutos
- Memory: 1GB por function
- Concorrência: 10 instâncias

## 🚀 Deploy

### Deploy Completo
```bash
# Deploy tudo
firebase deploy

# Apenas functions
firebase deploy --only functions

# Function específica
firebase deploy --only functions:gerarDocumentoComIA
```

### CI/CD com GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci --prefix functions
      - run: npm run build --prefix functions
      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

**Suporte**: Para dúvidas, verifique os logs ou abra issue no repositório.
