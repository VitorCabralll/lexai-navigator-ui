
import * as Joi from 'joi';

// Schema para processamento de modelo V2
export const processarModeloSchema = Joi.object({
  workspaceId: Joi.string().uuid().required(),
  createAgent: Joi.boolean().default(false),
  agentName: Joi.string().min(2).max(100).when('createAgent', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  userPreferences: Joi.object({
    complexity: Joi.string().valid('simple', 'intermediate', 'advanced').default('intermediate'),
    focus: Joi.string().valid('speed', 'quality', 'precision').default('quality'),
    style: Joi.string().valid('formal', 'didactic', 'technical').default('formal')
  }).optional()
});

export const gerarDocumentoSchema = Joi.object({
  mode: Joi.string().valid('agent', 'prompt').required(),
  agentId: Joi.string().uuid().when('mode', {
    is: 'agent',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  promptType: Joi.string().when('mode', {
    is: 'prompt',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  supportDocuments: Joi.array().items(Joi.string().uri()).max(10).default([]),
  instructions: Joi.string().min(10).max(5000).required(),
  templateFile: Joi.string().uri().optional(),
  strictMode: Joi.boolean().default(false),
  workspaceId: Joi.string().uuid().required()
});

export const criarAgenteSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  theme: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(500).optional(),
  workspaceId: Joi.string().uuid().required(),
  variables: Joi.array().items(Joi.string()).min(1).required(),
  structure: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('header', 'body', 'conclusion', 'section').required(),
    required: Joi.boolean().required(),
    order: Joi.number().integer().min(0).required(),
    startLine: Joi.number().integer().min(0).optional(),
    content: Joi.string().optional()
  })).min(1).required(),
  extractedText: Joi.string().min(50).max(500000).required(),
  documentTemplate: Joi.object({
    fileUrl: Joi.string().uri().required(),
    fileName: Joi.string().min(1).max(255).required()
  }).optional()
});

// Schema para workspace
export const workspaceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  members: Joi.array().items(Joi.string().email()).max(50).default([])
});

export const exportarDocumentoSchema = Joi.object({
  formato: Joi.string().valid('docx', 'pdf').required()
});

// Função de validação com sanitização
// ATENÇÃO: Esta função realiza uma sanitização básica.
// É crucial complementar com outras práticas de segurança,
// como output encoding para prevenir XSS e queries parametrizadas para evitar SQL/NoSQL Injection.
export function validateRequest(schema: Joi.ObjectSchema, data: any) {
  // Sanitizar dados primeiro
  const sanitizedData = sanitizeInput(data);
  
  const { error, value } = schema.validate(sanitizedData, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    throw new ValidationError(`Validação falhou: ${details.map(d => d.message).join(', ')}`, details);
  }
  
  return value;
}

// Sanitização de entrada
// Esta função aplica várias regras de sanitização para mitigar riscos comuns.
// No entanto, é fundamental entender suas limitações e combiná-la com outras medidas de segurança.
function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    let sanitizedString = data.trim();

    // Remover caracteres < e > para mitigar XSS básico.
    // IMPORTANTE: Isso não é uma proteção completa contra XSS.
    // Output encoding adequado é essencial no frontend/template engine.
    sanitizedString = sanitizedString.replace(/[<>]/g, '');

    // Remover "javascript:" para prevenir XSS via URLs.
    sanitizedString = sanitizedString.replace(/javascript:/gi, '');

    // Remover atributos "on<event>=" para desarmar handlers de eventos inline.
    sanitizedString = sanitizedString.replace(/on\w+=/gi, '');

    // Remover caracteres comuns de injeção NoSQL ($, {, }).
    // ATENÇÃO: Isso pode ser restritivo demais se esses caracteres forem esperados em algum campo.
    // Avalie o impacto e considere abordagens mais específicas se necessário.
    // O ideal é usar queries parametrizadas/preparadas no banco de dados.
    sanitizedString = sanitizedString.replace(/[\$\{\}]/g, '');

    // Limitar o tamanho da string para prevenir ataques de negação de serviço (DoS) ou sobrecarga.
    // O limite de 10000 caracteres deve ser ajustado conforme a necessidade da aplicação.
    return sanitizedString.substring(0, 10000);
  }
  
  if (Array.isArray(data)) {
    // Limitar o número de elementos em arrays para prevenir DoS.
    // O limite de 100 elementos deve ser ajustado conforme a necessidade.
    return data.slice(0, 100).map(sanitizeInput);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof key === 'string' && key.length <= 100) { // Limitar tamanho da chave
        // Sanitizar chaves de objeto para permitir apenas caracteres alfanuméricos, underscores e hífens.
        // Isso ajuda a prevenir ataques como prototype pollution e outros baseados em chaves maliciosas.
        // ATENÇÃO: Se chaves com outros caracteres são esperadas, esta regra pode ser muito restritiva.
        // Considere logar um aviso se chaves forem significativamente alteradas.
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
        sanitized[sanitizedKey] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  // Retornar o dado como está se não for string, array ou objeto.
  return data;
}

// Validação de arquivo
export function validateFile(file: Express.Multer.File, allowedTypes: string[], maxSize: number = 50 * 1024 * 1024) {
  if (!file) {
    throw new ValidationError('Arquivo é obrigatório');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ValidationError(`Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new ValidationError(`Arquivo muito grande. Máximo: ${Math.floor(maxSize / 1024 / 1024)}MB`);
  }
  
  // Verificar extensão do arquivo
  const allowedExtensions = allowedTypes.map(type => {
    switch (type) {
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      case 'application/pdf':
        return '.pdf';
      case 'text/plain':
        return '.txt';
      default:
        return '';
    }
  }).filter(Boolean);
  
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    throw new ValidationError(`Extensão de arquivo não permitida. Permitidas: ${allowedExtensions.join(', ')}`);
  }
  
  return true;
}

// Classe de erro de validação personalizada
export class ValidationError extends Error {
  public details?: any[];
  
  constructor(message: string, details?: any[]) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}
