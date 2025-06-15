
import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import * as logger from 'firebase-functions/v2/logger';

export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function authenticateUser(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação necessário'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', { error: error instanceof Error ? error.toString() : error });
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
}

export async function checkWorkspaceAccess(
  userId: string, 
  workspaceId: string
): Promise<boolean> {
  try {
    const workspaceRef = admin.firestore().collection('workspaces').doc(workspaceId);
    const workspaceDoc = await workspaceRef.get();
    
    if (!workspaceDoc.exists) {
      return false;
    }

    const workspace = workspaceDoc.data();
    return workspace?.ownerId === userId || workspace?.members?.includes(userId);
  } catch (error) {
    logger.error('Erro ao verificar acesso ao workspace:', { error: error instanceof Error ? error.toString() : error });
    return false;
  }
}
