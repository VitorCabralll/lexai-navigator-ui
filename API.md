
# API e Integrações - LexAI

## 🔌 Serviços Integrados

### Tesseract.js (OCR)
**Propósito**: Extração de texto de imagens

**Configuração**:
```javascript
import { createWorker } from 'tesseract.js';

const performOCR = async (file) => {
  const worker = await createWorker('por'); // Português
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();
  return text;
};
```

**Tipos de Arquivo Suportados**:
- JPG/JPEG
- PNG
- GIF
- BMP
- TIFF

### jsPDF (Export PDF)
**Propósito**: Geração de documentos PDF

**Uso**:
```javascript
import jsPDF from 'jspdf';

const exportAsPdf = (content, filename) => {
  const pdf = new jsPDF();
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    pdf.text(line, 10, 20 + (index * 7));
  });
  
  pdf.save(`${filename}.pdf`);
};
```

### DOCX Library (Export Word)
**Propósito**: Geração de documentos Word

**Uso**:
```javascript
import { Document, Packer, Paragraph, TextRun } from 'docx';

const exportAsDocx = async (content, filename) => {
  const doc = new Document({
    sections: [{
      children: content.split('\n').map(line => 
        new Paragraph({
          children: [new TextRun(line)],
        })
      ),
    }],
  });

  const blob = await Packer.toBlob(doc);
  // Download logic
};
```

## 🔥 Firebase Integration

### Configuração
```javascript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Configurações do projeto
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Autenticação
```javascript
// Login
import { signInWithEmailAndPassword } from 'firebase/auth';

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Logout
import { signOut } from 'firebase/auth';

const logout = async () => {
  await signOut(auth);
};
```

### Firestore (Banco de Dados)
```javascript
// Coleções principais
const collections = {
  users: 'users',
  workspaces: 'workspaces', 
  agents: 'agents',
  documents: 'documents'
};

// Operações CRUD
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs 
} from 'firebase/firestore';

// Criar documento
const createAgent = async (agentData) => {
  const docRef = doc(collection(db, 'agents'));
  await setDoc(docRef, {
    ...agentData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Buscar documentos
const getAgentsByWorkspace = async (workspaceId) => {
  const q = query(
    collection(db, 'agents'),
    where('workspaceId', '==', workspaceId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

## 📊 Estrutura de Dados

### User
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
}
```

### Workspace
```typescript
interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  theme: string;
  description: string;
  prompt: string;
  workspaceId?: string;
  isOfficial: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Document
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
  updatedAt: Date;
}
```

## 🔒 Segurança e Regras

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem acessar apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workspaces: acesso para membros
    match /workspaces/{workspaceId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // Agentes: acesso baseado no workspace
    match /agents/{agentId} {
      allow read, write: if request.auth != null &&
        (resource.data.isOfficial == true || 
         request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members);
    }
    
    // Documentos: acesso para criador e membros do workspace
    match /documents/{documentId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members);
    }
  }
}
```

## 🚀 Performance e Cache

### React Query Configuration
```javascript
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Queries Principais
```javascript
// Buscar agentes
const useAgents = (workspaceId) => {
  return useQuery({
    queryKey: ['agents', workspaceId],
    queryFn: () => getAgentsByWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
};

// Buscar documentos
const useDocuments = (workspaceId) => {
  return useQuery({
    queryKey: ['documents', workspaceId],
    queryFn: () => getDocumentsByWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
};
```

## 🔄 Mutations

### Criar Agente
```javascript
const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAgent,
    onSuccess: (data, variables) => {
      // Invalidar cache dos agentes
      queryClient.invalidateQueries(['agents', variables.workspaceId]);
      
      // Toast de sucesso
      toast({
        title: "Agente criado",
        description: `${variables.name} foi criado com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
```

## 📡 Endpoints Futuros (IA)

### Geração de Documentos
```typescript
interface GenerationRequest {
  mode: 'agent' | 'prompt';
  agentId?: string;
  promptId?: string;
  instructions: string;
  supportFiles: UploadedFile[];
  templateFile?: UploadedFile;
  strictMode: boolean;
}

interface GenerationResponse {
  content: string;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    model: string;
  };
}

// POST /api/generate
const generateDocument = async (request: GenerationRequest): Promise<GenerationResponse> => {
  // Implementação futura
};
```

### OCR Service
```typescript
// POST /ocr
const processOCR = async (file: File): Promise<{ text: string; confidence: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/ocr', {
    method: 'POST',
    body: formData
  });
  return res.json();
};
```

## 🔧 Variáveis de Ambiente

### Desenvolvimento
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Produção
```env
# Adicionar variáveis de API externa para IA
VITE_OPENAI_API_KEY=sk-...
VITE_API_BASE_URL=https://api.lexai.com
```

## 🎯 Rate Limiting

### Cliente (Implementação Futura)
```javascript
const rateLimiter = {
  ocr: { limit: 10, window: 60000 }, // 10 por minuto
  generation: { limit: 5, window: 300000 }, // 5 por 5 minutos
};

const checkRateLimit = (operation) => {
  // Verificar limites
  // Implementar backoff
};
```

---

**Nota**: Esta documentação cobre as integrações atuais e futuras planejadas
**Revisão**: Dezembro 2024
