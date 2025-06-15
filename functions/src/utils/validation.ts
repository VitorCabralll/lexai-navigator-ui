
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

// Função de validação com sanitização
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
function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/[<>]/g, '') // Remover < e >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .substring(0, 10000); // Limitar tamanho
  }
  
  if (Array.isArray(data)) {
    return data.slice(0, 100).map(sanitizeInput); // Limitar arrays
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof key === 'string' && key.length <= 100) {
        sanitized[key.replace(/[^a-zA-Z0-9_-]/g, '')] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
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
