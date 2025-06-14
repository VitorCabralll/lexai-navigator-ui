
# Guia de Deploy - LexAI

## 🚀 Deploy via Lovable (Recomendado)

### Deploy Simples
1. Acesse o painel do projeto no Lovable
2. Clique no botão "Publish" no canto superior direito
3. Escolha um subdomínio (`seuapp.lovable.app`)
4. Aguarde o processo de build e deploy

### Domínio Customizado
1. Vá para Project > Settings > Domains
2. Clique em "Connect Domain"
3. Configure seu DNS:
   - CNAME: `www` → `your-app.lovable.app`
   - A record: `@` → IP fornecido pelo Lovable
4. Aguarde propagação DNS (até 24h)

**Requisitos**: Plano pago do Lovable para domínio customizado

## 🔧 Deploy Manual

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta em serviço de hosting (Vercel, Netlify, etc.)

### Build de Produção
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Build para produção
npm run build

# Preview local do build
npm run preview
```

### Estrutura do Build
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [outros assets]
├── index.html
└── [outros arquivos estáticos]
```

## ☁️ Deploy em Vercel

### Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy de produção
vercel --prod
```

### Via Git Integration
1. Conecte repositório GitHub ao Vercel
2. Configure variáveis de ambiente no dashboard
3. Deploy automático a cada push

### Configuração (vercel.json)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🌐 Deploy em Netlify

### Via CLI
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Build e deploy
npm run build
netlify deploy --prod --dir=dist
```

### Via Git Integration
1. Conecte repositório ao Netlify
2. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy automático

### Redirects (_redirects)
```
/*    /index.html   200
```

## 🐳 Deploy com Docker

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Build e Run
```bash
# Build da imagem
docker build -t lexai .

# Run container
docker run -p 80:80 lexai
```

## ⚙️ Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
VITE_FIREBASE_API_KEY=dev_key
VITE_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dev-project
VITE_FIREBASE_STORAGE_BUCKET=dev-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Produção (.env.production)
```env
VITE_FIREBASE_API_KEY=prod_key
VITE_FIREBASE_AUTH_DOMAIN=lexai-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lexai-prod
VITE_FIREBASE_STORAGE_BUCKET=lexai-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:fedcba
```

### Configuração por Plataforma

#### Vercel
```bash
vercel env add VITE_FIREBASE_API_KEY production
```

#### Netlify
```bash
netlify env:set VITE_FIREBASE_API_KEY your_key
```

## 🔒 Segurança em Produção

### Headers de Segurança
```javascript
// _headers (Netlify)
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### Firebase Security Rules
```javascript
// Aplicar regras restritivas
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Monitoramento

### Analytics
```javascript
// Google Analytics 4
import { gtag } from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href,
});
```

### Error Tracking (Sentry)
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🚀 Otimizações de Performance

### Vite Configuration
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Lazy Loading
```javascript
// Lazy load de páginas
const Generate = lazy(() => import('./pages/Generate'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### Compressão
```javascript
// Gzip/Brotli automático (Vercel/Netlify)
// Para outros serviços, configurar no servidor
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Firebase configurado
- [ ] Domínio configurado (se aplicável)

### Pós-Deploy
- [ ] Site acessível
- [ ] Autenticação funcionando
- [ ] Upload de arquivos funcionando
- [ ] Geração de documentos funcionando
- [ ] Responsividade em dispositivos móveis
- [ ] Performance adequada (LCP < 2.5s)

### Rollback
```bash
# Vercel
vercel rollback [deployment-url]

# Netlify
netlify sites:list
netlify api createSiteDeployment --site-id=SITE_ID --body='{"restore_id":"DEPLOY_ID"}'
```

---

**Nota**: Sempre teste em ambiente de staging antes do deploy de produção
**Suporte**: Para problemas específicos do Lovable, consulte a documentação oficial
**Revisão**: Dezembro 2024
