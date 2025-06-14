
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as multer from 'multer';
import * as cors from 'cors';
import { DocxProcessor } from '../services/docxProcessor';
import { StorageService } from '../services/storageService';

const app = express();
app.use(cors({ origin: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .docx são permitidos'));
    }
  }
});

interface ProcessarModeloRequest {
  agentId: string;
  workspaceId: string;
}

app.post('/processar-modelo', upload.single('file'), async (req, res) => {
  try {
    const { agentId, workspaceId } = req.body as ProcessarModeloRequest;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo .docx é obrigatório'
      });
    }

    if (!agentId || !workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'agentId e workspaceId são obrigatórios'
      });
    }

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
    const workspaceRef = admin.firestore().collection('workspaces').doc(workspaceId);
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

    // Processar documento
    const docxProcessor = new DocxProcessor();
    const storageService = new StorageService();

    const { text, structure, variables } = await docxProcessor.processDocx(file.buffer);
    
    // Gerar prompt mestre
    const masterPrompt = docxProcessor.generateMasterPrompt(structure, variables, text);

    // Salvar arquivo no Storage
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
      variables,
      structure,
      version: 1,
      fileUrl,
      fileName: file.originalname,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId
    };

    await promptRef.set(promptData);

    // Atualizar agente com referência ao template
    const agentRef = admin.firestore().collection('agents').doc(agentId);
    await agentRef.update({
      masterPrompt,
      documentTemplate: {
        fileUrl,
        fileName: file.originalname,
        structure,
        variables
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      promptId: promptRef.id,
      structure,
      variables,
      message: 'Modelo processado e agente atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao processar modelo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export const processarModeloDocx = onRequest(app);
