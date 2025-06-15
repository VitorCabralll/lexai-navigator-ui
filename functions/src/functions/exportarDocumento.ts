
import { onRequest } from 'firebase-functions/v2/https';
// import * as logger from 'firebase-functions/v2/logger'; // logger is unused
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import { validateRequest, exportarDocumentoSchema } from '../utils/validation';
import { handleError } from '../utils/errors';


async function exportarDocumentoHandler(req: Request, res: Response) {
  try {
    const documentoId = req.params.documentoId;

    // Validar corpo da requisição
    const validatedBody = validateRequest(exportarDocumentoSchema, req.body);
    const { formato } = validatedBody;

    // Validar parâmetro de rota
    if (!documentoId) {
      // Este erro deveria ser pego por uma validação de schema de rota se existisse,
      // mas por enquanto manteremos uma verificação manual ou deixaremos o handleError pegar.
      // Para consistência, vamos usar handleError.
      throw new Error('documentoId é obrigatório');
    }

    // Verificar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação obrigatório'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Exportar documento
    const documentService = new DocumentService();
    const resultado = await documentService.exportarDocumento(documentoId, formato, uid);

    return res.json(resultado);

  } catch (error) {
    // O logger.error já está no handleError, então não precisamos duplicar aqui se handleError for chamado.
    // No entanto, se quisermos loggar especificamente neste ponto ANTES do handleError, podemos manter.
    // Por agora, vamos remover e confiar no log dentro do handleError.
    // logger.error('Erro ao exportar documento:', { error: error instanceof Error ? error.toString() : error });
    
    const errorResponse = handleError(error);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
}

export const exportarDocumento = onRequest(
  {
    timeoutSeconds: 60,
    memory: '512MiB'
  },
  async (req: Request, res: Response) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }

    return exportarDocumentoHandler(req, res);
  }
);
