
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/v2/logger';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import { AIService } from '../services/aiService';
// import { StorageService } from '../services/storageService'; // Unused
import { GenerationRequest, ProcessingStep } from '../types/document';
import { Agent } from '../types/agent';
import { validateRequest, gerarDocumentoSchema } from '../utils/validation';
import { handleError } from '../utils/errors';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.post('/gerar-documento', async (req, res) => {
  try {
    const validatedBody = validateRequest(gerarDocumentoSchema, req.body);
    const request: GenerationRequest = validatedBody;

    // Verificar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação necessário'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verificar acesso ao workspace
    const workspaceRef = admin.firestore().collection('workspaces').doc(request.workspaceId);
    const workspaceDoc = await workspaceRef.get();
    
    if (!workspaceDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Workspace não encontrado'
      });
    }

    const workspace = workspaceDoc.data();
    if (workspace?.ownerId !== userId && !workspace?.members?.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado ao workspace'
      });
    }

    // Buscar agente se necessário
    let agent: Agent | undefined;
    if (request.mode === 'agent') {
      const agentRef = admin.firestore().collection('agents').doc(request.agentId!);
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Agente não encontrado'
        });
      }
      
      agent = agentDoc.data() as Agent;
    }

    // Criar documento no Firestore
    const documentRef = admin.firestore().collection('documents').doc();
    const documentId = documentRef.id;

    const steps: ProcessingStep[] = [];
    const startTime = Date.now();

    // Inicializar documento
    await documentRef.set({
      id: documentId,
      title: `Documento - ${new Date().toLocaleDateString()}`,
      content: '',
      agentId: request.agentId || null,
      promptType: request.promptType || null,
      workspaceId: request.workspaceId,
      userId,
      metadata: {
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        tokensUsed: 0,
        processingTime: 0,
        steps: []
      },
      status: 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    try {
      // Gerar documento com IA
      const aiService = new AIService();
      const { content, sections, tokensUsed } = await aiService.generateDocument(
        request,
        agent,
        steps
      );

      const processingTime = Date.now() - startTime;

      // Atualizar documento com resultado
      await documentRef.update({
        title: extractTitle(content) || `Documento - ${new Date().toLocaleDateString()}`,
        content,
        metadata: {
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          tokensUsed,
          processingTime,
          steps
        },
        status: 'final',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({
        success: true,
        documentId,
        content,
        metadata: {
          generatedAt: new Date(),
          tokensUsed,
          processingTime,
          steps
        },
        sections
      });

    } catch (error) {
      logger.error('Erro na geração:', { error: error instanceof Error ? error.toString() : error });
      
      // Atualizar documento com erro
      await documentRef.update({
        status: 'error',
        metadata: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          steps
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      // Padronizar resposta de erro
      const errorResponse = handleError(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }

  } catch (error) {
    logger.error('Erro geral:', { error: error instanceof Error ? error.toString() : error });
    const errorResponse = handleError(error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

function extractTitle(content: string): string | null {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length > 5 && firstLine.length < 100) {
      return firstLine;
    }
  }
  return null;
}

export const gerarDocumentoComIA = onRequest(app);
