
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import { DocxProcessor } from '../services/docxProcessor';
import { validateRequest, criarAgenteSchema } from '../utils/validation';
import { handleError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '../utils/errors';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

interface CriarAgenteRequest {
  name: string;
  theme: string;
  description?: string;
  workspaceId: string;
  variables: string[];
  structure: any[];
  extractedText: string;
  documentTemplate?: {
    fileUrl: string;
    fileName: string;
  };
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

// Verificar se agente com mesmo nome já existe no workspace
async function checkAgentNameUnique(name: string, workspaceId: string): Promise<void> {
  const agentsRef = admin.firestore().collection('agents');
  const existingAgent = await agentsRef
    .where('name', '==', name)
    .where('workspaceId', '==', workspaceId)
    .limit(1)
    .get();

  if (!existingAgent.empty) {
    throw new ValidationError('Já existe um agente com este nome no workspace');
  }
}

app.post('/criar-agente', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validar dados da requisição
    const requestData = validateRequest(criarAgenteSchema, req.body);
    const {
      name,
      theme,
      description = '',
      workspaceId,
      variables,
      structure,
      extractedText,
      documentTemplate
    } = requestData as CriarAgenteRequest;

    console.log(`Iniciando criação de agente - Nome: ${name}, Workspace: ${workspaceId}`);

    // Autenticar usuário
    const userId = await authenticateUser(req);
    
    // Autorizar acesso ao workspace
    await authorizeWorkspace(workspaceId, userId);

    // Verificar se nome do agente é único no workspace
    await checkAgentNameUnique(name, workspaceId);

    // Gerar prompt mestre
    const docxProcessor = new DocxProcessor();
    const masterPrompt = docxProcessor.generateMasterPrompt(structure, variables, extractedText);

    // Preparar dados do agente
    const agentData = {
      name,
      description,
      theme,
      workspaceId,
      createdBy: userId,
      masterPrompt,
      documentTemplate: {
        fileUrl: documentTemplate?.fileUrl || '',
        fileName: documentTemplate?.fileName || '',
        structure: {
          sections: structure,
          style: {
            font: 'Times New Roman',
            fontSize: 12,
            spacing: 1.5,
            margins: { top: 2.5, bottom: 2.5, left: 3, right: 2 }
          }
        },
        variables,
        metadata: {
          textLength: extractedText.length,
          sectionsFound: structure.length,
          variablesFound: variables.length
        }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Salvar agente no Firestore
    const agentRef = admin.firestore().collection('agents').doc();
    await agentRef.set(agentData);

    const processingTime = Date.now() - startTime;
    console.log(`Agente criado com sucesso em ${processingTime}ms - ID: ${agentRef.id}`);

    // Retornar resposta
    res.json({
      success: true,
      agentId: agentRef.id,
      agent: {
        id: agentRef.id,
        ...agentData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      message: 'Agente criado com sucesso',
      metadata: {
        variablesDetected: variables.length,
        sectionsFound: structure.length,
        promptLength: masterPrompt.length,
        processingTime
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Erro ao criar agente (${processingTime}ms):`, error);
    
    const errorResponse = handleError(error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'criarAgenteComPrompt',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export const criarAgenteComPrompt = onRequest({
  timeoutSeconds: 60,
  memory: "512MiB",
  maxInstances: 10
}, app);
