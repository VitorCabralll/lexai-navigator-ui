
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

interface PromptResponse {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  exemploUso: string;
}

interface PromptListResponse {
  success: boolean;
  prompts: PromptResponse[];
  total: number;
}

async function listarPromptsPublicosHandler(req: Request, res: Response) {
  try {
    // Buscar prompts predefinidos públicos no Firestore
    const promptsQuery = admin.firestore()
      .collection('predefinedPrompts')
      .where('isPublic', '==', true)
      .where('isActive', '==', true)
      .orderBy('tipo')
      .orderBy('titulo');

    const promptsSnapshot = await promptsQuery.get();
    
    // Mapear prompts para o formato de resposta
    const prompts: PromptResponse[] = promptsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo || data.name || 'Prompt sem título',
        descricao: data.descricao || data.description || 'Descrição não disponível',
        tipo: data.tipo || data.type || 'geral',
        exemploUso: data.exemploUso || data.exampleUsage || 'Exemplo não disponível'
      };
    });

    const response: PromptListResponse = {
      success: true,
      prompts,
      total: prompts.length
    };

    console.log(`Prompts públicos listados:`, {
      total: prompts.length,
      tipos: [...new Set(prompts.map(p => p.tipo))]
    });

    return res.json(response);

  } catch (error) {
    console.error('Erro ao listar prompts públicos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

export const listarPromptsPublicos = onRequest(
  {
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (req: Request, res: Response) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }

    return listarPromptsPublicosHandler(req, res);
  }
);
