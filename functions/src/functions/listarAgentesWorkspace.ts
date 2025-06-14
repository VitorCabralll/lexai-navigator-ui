
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { authenticateUser, checkWorkspaceAccess, AuthenticatedRequest } from './auth';

interface AgentResponse {
  id: string;
  title: string;
  theme: string;
  type: 'personalizado' | 'oficial';
  isActive: boolean;
}

interface AgentListResponse {
  success: boolean;
  agents: AgentResponse[];
  total: number;
  workspaceId: string;
}

// Agentes oficiais da plataforma
const OFFICIAL_AGENTS: AgentResponse[] = [
  {
    id: 'official-contador',
    title: 'Contador',
    theme: 'Análises contábeis e financeiras',
    type: 'oficial',
    isActive: true
  },
  {
    id: 'official-engenheiro',
    title: 'Engenheiro',
    theme: 'Laudos técnicos e perícias',
    type: 'oficial',
    isActive: true
  },
  {
    id: 'official-medico',
    title: 'Médico',
    theme: 'Pareceres médicos e análises clínicas',
    type: 'oficial',
    isActive: true
  }
];

async function listarAgentesWorkspaceHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user!.uid;

    // Validar parâmetros
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'workspaceId é obrigatório'
      });
    }

    // Verificar acesso ao workspace
    const hasAccess = await checkWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado ao workspace'
      });
    }

    // Buscar agentes personalizados do workspace
    const agentsQuery = admin.firestore()
      .collection('agents')
      .where('workspaceId', '==', workspaceId);

    const agentsSnapshot = await agentsQuery.get();
    
    // Mapear agentes personalizados
    const customAgents: AgentResponse[] = agentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.name || 'Agente sem nome',
        theme: data.theme || 'Tema não definido',
        type: 'personalizado' as const,
        isActive: true // Assumindo que todos os agentes são ativos
      };
    });

    // Combinar agentes personalizados com oficiais
    const allAgents = [...customAgents, ...OFFICIAL_AGENTS];

    const response: AgentListResponse = {
      success: true,
      agents: allAgents,
      total: allAgents.length,
      workspaceId
    };

    console.log(`Agentes listados para workspace ${workspaceId}:`, {
      customAgents: customAgents.length,
      officialAgents: OFFICIAL_AGENTS.length,
      total: allAgents.length
    });

    return res.json(response);

  } catch (error) {
    console.error('Erro ao listar agentes do workspace:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

export const listarAgentesWorkspace = onRequest(
  {
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req: Request, res: Response) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }

    // Aplicar middleware de autenticação
    return authenticateUser(req as AuthenticatedRequest, res, () => {
      return listarAgentesWorkspaceHandler(req as AuthenticatedRequest, res);
    });
  }
);
