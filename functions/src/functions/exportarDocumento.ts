
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';

interface ExportRequest {
  formato: 'docx' | 'pdf';
}

async function exportarDocumentoHandler(req: Request, res: Response) {
  try {
    const documentoId = req.params.documentoId;
    const { formato } = req.body as ExportRequest;

    // Validar parâmetros
    if (!documentoId) {
      return res.status(400).json({
        success: false,
        error: 'documentoId é obrigatório'
      });
    }

    if (!formato || (formato !== 'docx' && formato !== 'pdf')) {
      return res.status(400).json({
        success: false,
        error: 'formato deve ser "docx" ou "pdf"'
      });
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
    console.error('Erro ao exportar documento:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          error: 'Documento não encontrado'
        });
      }
      
      if (error.message.includes('Acesso negado')) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado ao documento'
        });
      }
      
      if (error.message.includes('Formato deve ser')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
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
