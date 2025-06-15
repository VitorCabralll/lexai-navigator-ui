
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/v2/logger';

export interface AuditLog {
  id?: string;
  userId: string;
  workspaceId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: admin.firestore.FieldValue;
  success: boolean;
  errorMessage?: string;
}

export interface SecurityMetrics {
  workspaceId: string;
  date: string;
  totalRequests: number;
  failedRequests: number;
  uniqueUsers: string[];
  actions: Record<string, number>;
  errors: Record<string, number>;
  averageResponseTime: number;
}

// Interfaces for detailed audit logging
interface AgentCreationAuditDetails {
  agentName?: string;
  agentTheme?: string;
  variablesCount?: number;
  sectionsCount?: number;
  classification?: unknown;
  qualityScore?: number;
}

interface DocumentGenerationAuditMetadata {
  mode?: string;
  agentId?: string;
  promptId?: string;
  tokensUsed?: number;
  processingTime?: number;
  contentLength?: number;
}

interface ModelProcessingAuditData {
  fileName?: string;
  fileSize?: number;
  variablesFound?: number;
  sectionsFound?: number;
  processingTime?: number;
  classification?: unknown;
  qualityMetrics?: { overall?: number };
}

export class AuditService {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  async logAction(
    userId: string,
    workspaceId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, unknown>,
    success: boolean = true,
    errorMessage?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditLog: AuditLog = {
        userId,
        workspaceId,
        action,
        resource,
        resourceId,
        details: this.sanitizeDetails(details),
        ipAddress,
        userAgent,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        success,
        errorMessage
      };

      await this.db.collection('audit_logs').add(auditLog);

      // Atualizar métricas em tempo real
      await this.updateMetrics(workspaceId, action, success);

    } catch (error) {
      logger.error('Erro ao registrar log de auditoria:', { error: error instanceof Error ? error.toString() : error, workspaceId, action, resource, resourceId });
      // Não falhar a operação principal por erro de auditoria
    }
  }

  async logAgentCreation(userId: string, workspaceId: string, agentId: string, agentData: Partial<AgentCreationAuditDetails>): Promise<void> {
    await this.logAction(
      userId,
      workspaceId,
      'CREATE_AGENT',
      'agent',
      agentId,
      {
        agentName: agentData.name,
        agentTheme: agentData.theme,
        variablesCount: agentData.documentTemplate?.variables?.length || 0,
        sectionsCount: agentData.documentTemplate?.structure?.sections?.length || 0,
        classification: agentData.documentTemplate?.metadata?.classification,
        qualityScore: agentData.confidenceScore
      }
    );
  }

  async logDocumentGeneration(
    userId: string, 
    workspaceId: string, 
    documentId: string, 
    metadata: Partial<DocumentGenerationAuditMetadata>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    await this.logAction(
      userId,
      workspaceId,
      'GENERATE_DOCUMENT',
      'document',
      documentId,
      {
        mode: metadata.mode,
        agentId: metadata.agentId,
        tokensUsed: metadata.tokensUsed,
        processingTime: metadata.processingTime,
        contentLength: metadata.contentLength
      },
      success,
      errorMessage
    );
  }

  async logModelProcessing(
    userId: string,
    workspaceId: string,
    promptId: string,
    processingData: Partial<ModelProcessingAuditData>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    await this.logAction(
      userId,
      workspaceId,
      'PROCESS_MODEL',
      'prompt',
      promptId,
      {
        fileName: processingData.fileName,
        fileSize: processingData.fileSize,
        variablesFound: processingData.variablesFound,
        sectionsFound: processingData.sectionsFound,
        processingTime: processingData.processingTime,
        classification: processingData.classification,
        qualityScore: processingData.qualityMetrics?.overall
      },
      success,
      errorMessage
    );
  }

  private async updateMetrics(workspaceId: string, action: string, success: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const metricsRef = this.db.collection('metrics').doc(`${workspaceId}_${today}`);

    await this.db.runTransaction(async (transaction) => {
      const metricsDoc = await transaction.get(metricsRef);
      
      if (metricsDoc.exists) {
        const data = metricsDoc.data() as SecurityMetrics;
        transaction.update(metricsRef, {
          totalRequests: admin.firestore.FieldValue.increment(1),
          failedRequests: success ? data.failedRequests : admin.firestore.FieldValue.increment(1),
          [`actions.${action}`]: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const newMetrics: Partial<SecurityMetrics> = {
          workspaceId,
          date: today,
          totalRequests: 1,
          failedRequests: success ? 0 : 1,
          actions: { [action]: 1 },
          errors: {},
          averageResponseTime: 0
        };
        transaction.set(metricsRef, {
          ...newMetrics,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });
  }

  private sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    // Remover informações sensíveis dos logs
    const sanitized: Record<string, unknown> = { ...details };
    
    // Remover campos sensíveis
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;
    
    // Truncar strings muito longas
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...';
      }
    });
    
    return sanitized;
  }

  async getWorkspaceMetrics(workspaceId: string, days: number = 30): Promise<SecurityMetrics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const snapshot = await this.db
      .collection('metrics')
      .where('workspaceId', '==', workspaceId)
      .where('date', '>=', startDateStr)
      .where('date', '<=', endDateStr)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as SecurityMetrics);
  }

  async getAuditLogs(
    workspaceId: string, 
    limit: number = 100,
    action?: string,
    userId?: string
  ): Promise<AuditLog[]> {
    let query = this.db
      .collection('audit_logs')
      .where('workspaceId', '==', workspaceId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (action) {
      query = query.where('action', '==', action);
    }

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  }
}
