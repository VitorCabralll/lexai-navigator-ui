
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as multer from 'multer';
import * as cors from 'cors';
import { DocxProcessor } from '../services/docxProcessor';
import { StorageService } from '../services/storageService';
import { validateRequest, processarModeloSchema } from '../utils/validation';
import { handleError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '../utils/errors';

const app = express();
app.use(cors({ origin: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Apenas arquivos .docx são permitidos'));
    }
  }
});

interface ProcessarModeloRequest {
  agentId: string;
  workspaceId: string;
}

// Middleware de autenticação
async function authenticateUser(req: express.Request): Promise<string> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Token de autenticação necessário');
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw new AuthenticationError('Token inválido ou expirado');
  }
}

// Middleware de autorização de workspace
async function authorizeWorkspace(workspaceId: string, userId: string): Promise<void> {
  const workspaceRef = admin.firestore().collection('workspaces').doc(workspaceId);
  const workspaceDoc = await workspaceRef.get();
  
  if (!workspaceDoc.exists) {
    throw new NotFoundError('Workspace não encontrado');
  }

  const workspace = workspaceDoc.data();
  if (workspace?.ownerId !== userId && !workspace?.members?.includes(userId)) {
    throw new AuthorizationError('Acesso negado ao workspace');
  }
}

app.post('/processar-modelo', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validar dados da requisição
    const requestData = validateRequest(processarModeloSchema, req.body);
    const { agentId, workspaceId } = requestData as ProcessarModeloRequest;
    
    const file = req.file;
    if (!file) {
      return res.status(400).json(handleError(new ValidationError('Arquivo .docx é obrigatório')));
    }

    console.log(`Iniciando processamento de modelo - WorkspaceId: ${workspaceId}, AgentId: ${agentId}, Arquivo: ${file.originalname}`);

    // Autenticar usuário
    const userId = await authenticateUser(req);
    
    // Autorizar acesso ao workspace
    await authorizeWorkspace(workspaceId, userId);

    // Verificar se o agente existe e pertence ao workspace
    const agentRef = admin.firestore().collection('agents').doc(agentId);
    const agentDoc = await agentRef.get();
    
    if (!agentDoc.exists) {
      return res.status(404).json(handleError(new NotFoundError('Agente não encontrado')));
    }

    const agentData = agentDoc.data();
    if (agentData?.workspaceId !== workspaceId) {
      return res.status(403).json(handleError(new AuthorizationError('Agente não pertence ao workspace')));
    }

    // Processar documento com retry
    const docxProcessor = new DocxProcessor();
    const storageService = new StorageService();

    console.log('Processando arquivo DOCX...');
    const { textoExtraido, estruturas, variaveis } = await docxProcessor.processWithRetry(file.buffer);
    
    console.log(`Processamento concluído - Seções: ${estruturas.length}, Variáveis: ${variaveis.length}`);

    // Gerar prompt mestre
    const masterPrompt = docxProcessor.generateMasterPrompt(estruturas, variaveis, textoExtraido);

    // Salvar arquivo no Storage
    console.log('Salvando arquivo no Firebase Storage...');
    const fileUrl = await storageService.uploadFile(
      file.buffer,
      file.originalname,
      workspaceId,
      'uploads'
    );

    // Criar prompt no Firestore
    const promptRef = admin.firestore().collection('prompts').doc();
    const promptData = {
      agentId,
      content: masterPrompt,
      variables: variaveis,
      structure: {
        sections: estruturas,
        style: {
          font: 'Times New Roman',
          fontSize: 12,
          spacing: 1.5,
          margins: { top: 2.5, bottom: 2.5, left: 3, right: 2 }
        }
      },
      version: 1,
      fileUrl,
      fileName: file.originalname,
      processing: {
        textLength: textoExtraido.length,
        sectionsFound: estruturas.length,
        variablesFound: variaveis.length,
        processingTime: Date.now() - startTime
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId
    };

    await promptRef.set(promptData);

    // Atualizar agente com referência ao template
    await agentRef.update({
      masterPrompt,
      documentTemplate: {
        fileUrl,
        fileName: file.originalname,
        structure: {
          sections: estruturas,
          style: {
            font: 'Times New Roman',
            fontSize: 12,
            spacing: 1.5,
            margins: { top: 2.5, bottom: 2.5, left: 3, right: 2 }
          }
        },
        variables: variaveis,
        metadata: {
          textLength: textoExtraido.length,
          sectionsFound: estruturas.length,
          variablesFound: variaveis.length
        }
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const processingTime = Date.now() - startTime;
    console.log(`Processamento completo em ${processingTime}ms`);

    res.json({
      success: true,
      promptId: promptRef.id,
      textoExtraido: textoExtraido.substring(0, 500) + '...', // Retornar apenas preview
      estruturas,
      variaveis,
      metadata: {
        textLength: textoExtraido.length,
        sectionsFound: estruturas.length,
        variablesFound: variaveis.length,
        processingTime,
        fileSize: file.size,
        fileName: file.originalname
      },
      message: 'Modelo processado e agente atualizado com sucesso'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Erro ao processar modelo (${processingTime}ms):`, error);
    
    const errorResponse = handleError(error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'processarModeloDocx',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

export const processarModeloDocx = onRequest({
  timeoutSeconds: 540,
  memory: "1GiB",
  maxInstances: 10
}, app);
