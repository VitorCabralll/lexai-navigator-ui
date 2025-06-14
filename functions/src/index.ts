
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

// Exportar todas as functions
export { processarModeloDocx } from './functions/processarModeloDocx';
export { gerarDocumentoComIA } from './functions/gerarDocumentoComIA';
export { criarAgenteComPrompt } from './functions/criarAgenteComPrompt';
export { listarAgentesWorkspace } from './functions/listarAgentesWorkspace';

// Função de teste para verificar se o backend está funcionando
export { onRequest } from 'firebase-functions/v2/https';

const healthCheck = onRequest(async (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'LexAI Backend'
  });
});

export { healthCheck };
