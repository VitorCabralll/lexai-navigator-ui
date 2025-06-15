
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/v2/logger';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as multer from 'multer';
import * as cors from 'cors';
import { IntelligentDocxProcessor } from '../services/intelligentDocxProcessor';
import { AIAgentCreator } from '../services/aiAgentCreator';
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
  agentId?: string;
  workspaceId: string;
  createAgent?: boolean;
  agentName?: string;
  userPreferences?: {
    complexity: 'simple' | 'intermediate' | 'advanced';
    focus: 'speed' | 'quality' | 'precision';
    style: 'formal' | 'didactic' | 'technical';
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
    logger.error('Erro ao verificar token:', { error: error instanceof Error ? error.toString() : error });
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

app.post('/processar-modelo-v2', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validar dados da requisição
    const requestData = validateRequest(processarModeloSchema, req.body);
    const { workspaceId, createAgent = false, agentName, userPreferences } = requestData as ProcessarModeloRequest;
    
    const file = req.file;
    if (!file) {
      return res.status(400).json(handleError(new ValidationError('Arquivo .docx é obrigatório')));
    }

    logger.info(`Iniciando processamento inteligente`, { workspaceId, fileName: file.originalname });

    // Autenticar usuário
    const userId = await authenticateUser(req);
    
    // Autorizar acesso ao workspace
    await authorizeWorkspace(workspaceId, userId);

    // Processar documento com análise inteligente
    const intelligentProcessor = new IntelligentDocxProcessor();
    logger.info('Processando arquivo com análise inteligente...');
    
    const {
      textoExtraido,
      variaveis,
      estruturas,
      classificacao,
      qualidade
    } = await intelligentProcessor.processDocxIntelligently(file.buffer);
    
    logger.info(`Processamento concluído`, { area: classificacao.area, quality: `${qualidade.overall}/100` });

    // Gerar prompt inteligente
    const masterPrompt = intelligentProcessor.generateIntelligentPrompt(
      estruturas,
      variaveis,
      classificacao,
      qualidade,
      textoExtraido
    );

    // Salvar arquivo no Storage
    logger.info('Salvando arquivo no Firebase Storage...');
    const storageService = new StorageService();
    const fileUrl = await storageService.uploadFile(
      file.buffer,
      file.originalname,
      workspaceId,
      'uploads'
    );

    let agentData = null;
    let agentId = null;

    // Criar agente automaticamente se solicitado
    if (createAgent) {
      try {
        logger.info('Criando agente com IA...');
        const aiCreator = new AIAgentCreator();
        
        const agentCreationResult = await aiCreator.createIntelligentAgent({
          documentClassification: classificacao,
          qualityMetrics: qualidade,
          variables: variaveis,
          structure: estruturas,
          extractedText: textoExtraido,
          userPreferences
        });

        // Criar agente no Firestore
        const agentRef = admin.firestore().collection('agents').doc();
        agentId = agentRef.id;

        agentData = {
          name: agentName || agentCreationResult.suggestedName,
          description: agentCreationResult.suggestedDescription,
          theme: `${classificacao.area} - ${classificacao.subtype}`,
          workspaceId,
          createdBy: userId,
          masterPrompt: agentCreationResult.optimizedPrompt,
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
              variablesFound: variaveis.length,
              classification: classificacao,
              qualityMetrics: qualidade
            }
          },
          specializations: agentCreationResult.specializations,
          confidenceScore: agentCreationResult.confidenceScore,
          recommendations: agentCreationResult.recommendations,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await agentRef.set(agentData);
        logger.info(`Agente criado automaticamente`, { agentId, confidence: agentCreationResult.confidenceScore });
      } catch (error) {
        logger.error('Erro na criação automática do agente:', { error: error instanceof Error ? error.toString() : error });
        // Continuar sem criar o agente se houver erro
      }
    }

    // Criar prompt no Firestore para histórico
    const promptRef = admin.firestore().collection('prompts').doc();
    const promptData = {
      agentId: agentId || null,
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
      classification: classificacao,
      qualityMetrics: qualidade,
      version: 2, // Versão 2 com análise inteligente
      fileUrl,
      fileName: file.originalname,
      processing: {
        textLength: textoExtraido.length,
        sectionsFound: estruturas.length,
        variablesFound: variaveis.length,
        processingTime: Date.now() - startTime,
        intelligentAnalysis: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId
    };

    await promptRef.set(promptData);

    const processingTime = Date.now() - startTime;
    logger.info(`Processamento inteligente completo`, { processingTime });

    // Resposta estruturada
    res.json({
      success: true,
      promptId: promptRef.id,
      agentId,
      
      // Análise inteligente
      classification: {
        area: classificacao.area,
        subtype: classificacao.subtype,
        confidence: classificacao.confidence,
        keywords: classificacao.keywords
      },
      
      // Métricas de qualidade
      qualityMetrics: qualidade,
      
      // Dados estruturados
      estruturas,
      variaveis: variaveis.map(v => ({
        name: v.name,
        type: v.type,
        required: v.required,
        confidence: v.confidence
      })),
      
      // Dados do agente (se criado)
      agent: agentData ? {
        id: agentId,
        name: agentData.name,
        description: agentData.description,
        specializations: agentData.specializations,
        confidenceScore: agentData.confidenceScore,
        recommendations: agentData.recommendations
      } : null,
      
      // Metadados de processamento
      metadata: {
        textLength: textoExtraido.length,
        sectionsFound: estruturas.length,
        variablesFound: variaveis.length,
        processingTime,
        fileSize: file.size,
        fileName: file.originalname,
        version: 2,
        intelligentAnalysis: true
      },
      
      message: createAgent && agentId ? 
        'Modelo processado e agente criado automaticamente com sucesso' :
        'Modelo processado com análise inteligente concluída'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(`Erro no processamento inteligente`, { error: error instanceof Error ? error.toString() : error, processingTime });
    
    const errorResponse = handleError(error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'processarModeloDocxV2',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['intelligent-analysis', 'auto-agent-creation', 'quality-metrics', 'classification']
  });
});

export const processarModeloDocxV2 = onRequest({
  timeoutSeconds: 540,
  memory: "1GiB",
  maxInstances: 10
}, app);
