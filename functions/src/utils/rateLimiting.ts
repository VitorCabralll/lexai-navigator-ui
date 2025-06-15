
import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRule {
  requests: number;
  window: number; // em segundos
  blockDuration: number; // em segundos
}

interface RateLimitConfig {
  global: RateLimitRule;
  perUser: RateLimitRule;
  perWorkspace: RateLimitRule;
  perIP: RateLimitRule;
}

// Configuração padrão de rate limiting
const DEFAULT_CONFIG: RateLimitConfig = {
  global: { requests: 1000, window: 60, blockDuration: 300 },
  perUser: { requests: 50, window: 60, blockDuration: 60 },
  perWorkspace: { requests: 200, window: 60, blockDuration: 120 },
  perIP: { requests: 100, window: 60, blockDuration: 180 }
};

export class RateLimitService {
  private db: admin.firestore.Firestore;
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.db = admin.firestore();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async checkRateLimit(
    userId?: string,
    workspaceId?: string,
    ipAddress?: string
  ): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
    const now = Date.now();
    const checks = [];

    // Verificar limite global
    checks.push(this.checkLimit('global', 'global', this.config.global, now));

    // Verificar limite por usuário
    if (userId) {
      checks.push(this.checkLimit('user', userId, this.config.perUser, now));
    }

    // Verificar limite por workspace
    if (workspaceId) {
      checks.push(this.checkLimit('workspace', workspaceId, this.config.perWorkspace, now));
    }

    // Verificar limite por IP
    if (ipAddress) {
      checks.push(this.checkLimit('ip', ipAddress, this.config.perIP, now));
    }

    const results = await Promise.all(checks);
    const blocked = results.find(result => !result.allowed);

    if (blocked) {
      return blocked;
    }

    // Se passou em todos os checks, incrementar contadores
    const increments = [];
    
    if (userId) {
      increments.push(this.incrementCounter('user', userId, now));
    }
    if (workspaceId) {
      increments.push(this.incrementCounter('workspace', workspaceId, now));
    }
    if (ipAddress) {
      increments.push(this.incrementCounter('ip', ipAddress, now));
    }
    increments.push(this.incrementCounter('global', 'global', now));

    await Promise.all(increments);

    return { allowed: true };
  }

  private async checkLimit(
    type: string,
    identifier: string,
    rule: RateLimitRule,
    now: number
  ): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
    const key = `${type}_${identifier}`;
    const windowStart = now - (rule.window * 1000);

    try {
      const doc = await this.db.collection('rate_limits').doc(key).get();
      
      if (!doc.exists) {
        return { allowed: true };
      }

      const data = doc.data();
      
      // Verificar se está bloqueado
      if (data?.blockedUntil && data.blockedUntil > now) {
        return {
          allowed: false,
          retryAfter: Math.ceil((data.blockedUntil - now) / 1000),
          reason: `Rate limited: ${type}`
        };
      }

      // Contar requests na janela atual
      const requests = data?.requests?.filter((timestamp: number) => timestamp > windowStart) || [];
      
      if (requests.length >= rule.requests) {
        // Bloquear por blockDuration
        const blockedUntil = now + (rule.blockDuration * 1000);
        await this.db.collection('rate_limits').doc(key).update({
          blockedUntil,
          lastViolation: now
        });

        return {
          allowed: false,
          retryAfter: rule.blockDuration,
          reason: `Rate limit exceeded: ${type}`
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error(`Erro ao verificar rate limit para ${key}:`, error);
      // Em caso de erro, permitir a requisição (fail-open)
      return { allowed: true };
    }
  }

  private async incrementCounter(type: string, identifier: string, now: number): Promise<void> {
    const key = `${type}_${identifier}`;
    const rule = this.config[`per${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof RateLimitConfig] || this.config.global;
    const windowStart = now - (rule.window * 1000);

    try {
      await this.db.runTransaction(async (transaction) => {
        const docRef = this.db.collection('rate_limits').doc(key);
        const doc = await transaction.get(docRef);
        
        if (doc.exists) {
          const data = doc.data();
          const requests = data?.requests?.filter((timestamp: number) => timestamp > windowStart) || [];
          requests.push(now);
          
          transaction.update(docRef, {
            requests,
            lastRequest: now,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          transaction.set(docRef, {
            requests: [now],
            lastRequest: now,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    } catch (error) {
      console.error(`Erro ao incrementar contador para ${key}:`, error);
    }
  }

  // Middleware Express para rate limiting
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.uid;
        const workspaceId = req.body?.workspaceId || req.query?.workspaceId;
        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await this.checkRateLimit(userId, workspaceId, ipAddress);

        if (!result.allowed) {
          return res.status(429).json({
            success: false,
            error: result.reason || 'Rate limit exceeded',
            retryAfter: result.retryAfter
          });
        }

        next();
      } catch (error) {
        console.error('Erro no middleware de rate limiting:', error);
        // Em caso de erro, permitir a requisição
        next();
      }
    };
  }

  // Limpar dados antigos (para ser executado periodicamente)
  async cleanup(): Promise<void> {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 horas atrás
    
    try {
      const batch = this.db.batch();
      const snapshot = await this.db
        .collection('rate_limits')
        .where('updatedAt', '<', new Date(cutoff))
        .limit(500)
        .get();

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Limpeza do rate limiting: ${snapshot.size} registros removidos`);
    } catch (error) {
      console.error('Erro na limpeza do rate limiting:', error);
    }
  }
}

// Instância global do serviço
export const rateLimitService = new RateLimitService();
