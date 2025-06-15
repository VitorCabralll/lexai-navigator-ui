
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

interface AdvancedPromptResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  visibility: 'private' | 'workspace' | 'public';
  author: string;
  authorName: string;
  workspaceId?: string;
  version: string;
  rating: number;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    legalArea: string;
    documentType: string;
    complexity: number;
    estimatedTime: number;
    requiredFields: string[];
    keywords: string[];
  };
  analytics: {
    successRate: number;
    averageRating: number;
    totalGenerations: number;
    averageGenerationTime: number;
    feedbackCount: number;
    lastMonthUsage: number;
  };
}

interface PromptListAdvancedResponse {
  success: boolean;
  prompts: AdvancedPromptResponse[];
  total: number;
  categories: any[];
  analytics: {
    totalPrompts: number;
    publicPrompts: number;
    workspacePrompts: number;
    privatePrompts: number;
    topCategories: { name: string; count: number; percentage: number }[];
  };
}

async function listarPromptsAvancadosHandler(req: Request, res: Response) {
  try {
    const { 
      category,
      difficulty, 
      visibility,
      tags,
      workspaceId,
      userId,
      limit = 50,
      offset = 0,
      sortBy = 'rating',
      search
    } = req.query;

    // Base query
    let promptsQuery = admin.firestore()
      .collection('advancedPrompts')
      .where('isActive', '==', true);

    // Apply filters
    if (category) {
      promptsQuery = promptsQuery.where('category', '==', category);
    }

    if (difficulty) {
      promptsQuery = promptsQuery.where('difficulty', '==', difficulty);
    }

    if (visibility) {
      promptsQuery = promptsQuery.where('visibility', '==', visibility);
    }

    if (workspaceId) {
      promptsQuery = promptsQuery.where('workspaceId', '==', workspaceId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        promptsQuery = promptsQuery.orderBy('rating', 'desc');
        break;
      case 'usage':
        promptsQuery = promptsQuery.orderBy('usageCount', 'desc');
        break;
      case 'recent':
        promptsQuery = promptsQuery.orderBy('updatedAt', 'desc');
        break;
      case 'name':
        promptsQuery = promptsQuery.orderBy('title');
        break;
      default:
        promptsQuery = promptsQuery.orderBy('rating', 'desc');
    }

    // Apply pagination
    promptsQuery = promptsQuery.limit(Number(limit)).offset(Number(offset));

    const promptsSnapshot = await promptsQuery.get();
    
    // Map prompts to response format
    let prompts: AdvancedPromptResponse[] = promptsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Prompt sem título',
        description: data.description || 'Descrição não disponível',
        category: data.category || 'geral',
        subcategories: data.subcategories || [],
        tags: data.tags || [],
        difficulty: data.difficulty || 'beginner',
        visibility: data.visibility || 'private',
        author: data.author || data.userId || 'unknown',
        authorName: data.authorName || 'Usuário',
        workspaceId: data.workspaceId,
        version: data.version || '1.0',
        rating: data.rating || 0,
        usageCount: data.usageCount || 0,
        lastUsed: data.lastUsed?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        metadata: {
          legalArea: data.metadata?.legalArea || '',
          documentType: data.metadata?.documentType || '',
          complexity: data.metadata?.complexity || 1,
          estimatedTime: data.metadata?.estimatedTime || 5,
          requiredFields: data.metadata?.requiredFields || [],
          keywords: data.metadata?.keywords || []
        },
        analytics: {
          successRate: data.analytics?.successRate || 0,
          averageRating: data.analytics?.averageRating || 0,
          totalGenerations: data.analytics?.totalGenerations || 0,
          averageGenerationTime: data.analytics?.averageGenerationTime || 0,
          feedbackCount: data.analytics?.feedbackCount || 0,
          lastMonthUsage: data.analytics?.lastMonthUsage || 0
        }
      };
    });

    // Apply text search filter if provided
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      prompts = prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm) ||
        prompt.description.toLowerCase().includes(searchTerm) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        prompt.metadata.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }

    // Get categories
    const categoriesSnapshot = await admin.firestore()
      .collection('promptCategories')
      .where('isActive', '==', true)
      .get();

    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate analytics
    const totalPrompts = prompts.length;
    const publicPrompts = prompts.filter(p => p.visibility === 'public').length;
    const workspacePrompts = prompts.filter(p => p.visibility === 'workspace').length;
    const privatePrompts = prompts.filter(p => p.visibility === 'private').length;

    // Calculate top categories
    const categoryStats = prompts.reduce((acc, prompt) => {
      acc[prompt.category] = (acc[prompt.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryStats)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalPrompts > 0 ? count / totalPrompts : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const response: PromptListAdvancedResponse = {
      success: true,
      prompts,
      total: prompts.length,
      categories,
      analytics: {
        totalPrompts,
        publicPrompts,
        workspacePrompts,
        privatePrompts,
        topCategories
      }
    };

    console.log(`Prompts avançados listados:`, {
      total: prompts.length,
      filters: { category, difficulty, visibility, search },
      analytics: response.analytics
    });

    return res.json(response);

  } catch (error) {
    console.error('Erro ao listar prompts avançados:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

export const listarPromptsAvancados = onRequest(
  {
    timeoutSeconds: 30,
    memory: '512MiB'
  },
  async (req: Request, res: Response) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    return listarPromptsAvancadosHandler(req, res);
  }
);
