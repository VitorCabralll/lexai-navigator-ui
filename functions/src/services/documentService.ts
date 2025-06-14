
import * as admin from 'firebase-admin';
import { Document } from '../types/document';

export interface SalvarDocumentoRequest {
  uid: string;
  workspaceId: string;
  textoGerado: string;
  tipo: 'agent' | 'prompt';
  metadata?: {
    agentId?: string;
    promptId?: string;
    tokensUsados?: number;
    tempoProcessamento?: number;
    instrucoes?: string;
  };
}

export interface SalvarDocumentoResponse {
  documentId: string;
  document: Document;
}

export class DocumentService {
  
  async salvarDocumentoFinal(
    uid: string,
    workspaceId: string,
    textoGerado: string,
    tipo: 'agent' | 'prompt',
    metadata?: {
      agentId?: string;
      promptId?: string;
      tokensUsados?: number;
      tempoProcessamento?: number;
      instrucoes?: string;
    }
  ): Promise<SalvarDocumentoResponse> {
    
    try {
      // 1. Validações básicas
      if (!uid || !workspaceId || !textoGerado.trim()) {
        throw new Error('Parâmetros obrigatórios não fornecidos');
      }

      if (tipo !== 'agent' && tipo !== 'prompt') {
        throw new Error('Tipo deve ser "agent" ou "prompt"');
      }

      // 2. Verificar se workspace existe e usuário tem acesso
      await this.validarAcessoWorkspace(uid, workspaceId);

      // 3. Validar metadados baseado no tipo
      this.validarMetadados(tipo, metadata);

      // 4. Gerar ID único para o documento
      const documentRef = admin.firestore().collection('documents').doc();
      const documentId = documentRef.id;

      // 5. Extrair título do texto gerado
      const titulo = this.extrairTitulo(textoGerado);

      // 6. Estruturar documento
      const documento: Document = {
        id: documentId,
        title: titulo,
        content: textoGerado,
        agentId: metadata?.agentId || null,
        promptType: metadata?.promptId || null,
        workspaceId,
        userId: uid,
        metadata: {
          generatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
          tokensUsed: metadata?.tokensUsados || 0,
          processingTime: metadata?.tempoProcessamento || 0,
          steps: []
        },
        status: 'final',
        createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
      };

      // 7. Salvar no Firestore
      await documentRef.set(documento);

      // 8. Log de auditoria
      console.log(`Documento salvo: ${documentId}`, {
        userId: uid,
        workspaceId,
        tipo,
        tokensUsados: metadata?.tokensUsados || 0,
        tempoProcessamento: metadata?.tempoProcessamento || 0
      });

      return {
        documentId,
        document: documento
      };

    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      throw error;
    }
  }

  private async validarAcessoWorkspace(uid: string, workspaceId: string): Promise<void> {
    const workspaceRef = admin.firestore().collection('workspaces').doc(workspaceId);
    const workspaceDoc = await workspaceRef.get();
    
    if (!workspaceDoc.exists) {
      throw new Error('Workspace não encontrado');
    }

    const workspace = workspaceDoc.data();
    const temAcesso = workspace?.ownerId === uid || workspace?.members?.includes(uid);
    
    if (!temAcesso) {
      throw new Error('Acesso negado ao workspace');
    }
  }

  private validarMetadados(
    tipo: 'agent' | 'prompt', 
    metadata?: { agentId?: string; promptId?: string; }
  ): void {
    if (tipo === 'agent' && !metadata?.agentId) {
      throw new Error('agentId é obrigatório para tipo "agent"');
    }
    
    if (tipo === 'prompt' && !metadata?.promptId) {
      throw new Error('promptId é obrigatório para tipo "prompt"');
    }
  }

  private extrairTitulo(textoGerado: string): string {
    const linhas = textoGerado.split('\n').filter(linha => linha.trim());
    
    if (linhas.length > 0) {
      const primeiraLinha = linhas[0].trim();
      
      // Verificar se é uma linha significativa para título
      if (primeiraLinha.length > 5 && primeiraLinha.length < 100) {
        // Remover formatação Markdown se houver
        return primeiraLinha.replace(/^#+\s*/, '').replace(/^\*+\s*/, '');
      }
    }
    
    // Título padrão baseado na data
    return `Documento - ${new Date().toLocaleDateString('pt-BR')}`;
  }

  async buscarDocumentoPorId(documentId: string, uid: string): Promise<Document | null> {
    try {
      const docRef = admin.firestore().collection('documents').doc(documentId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        return null;
      }
      
      const documento = docSnap.data() as Document;
      
      // Verificar se usuário tem acesso
      if (documento.userId !== uid) {
        // Verificar acesso via workspace
        await this.validarAcessoWorkspace(uid, documento.workspaceId);
      }
      
      return documento;
      
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      throw error;
    }
  }

  async listarDocumentosUsuario(
    uid: string, 
    workspaceId?: string,
    limite: number = 50
  ): Promise<Document[]> {
    try {
      let query = admin.firestore()
        .collection('documents')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limite);

      if (workspaceId) {
        query = query.where('workspaceId', '==', workspaceId);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => doc.data() as Document);
      
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      throw error;
    }
  }
}
