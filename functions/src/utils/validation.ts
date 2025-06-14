
import * as Joi from 'joi';

export const processarModeloSchema = Joi.object({
  agentId: Joi.string().required(),
  workspaceId: Joi.string().required()
});

export const gerarDocumentoSchema = Joi.object({
  mode: Joi.string().valid('agent', 'prompt').required(),
  agentId: Joi.string().when('mode', {
    is: 'agent',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  promptType: Joi.string().when('mode', {
    is: 'prompt',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  supportDocuments: Joi.array().items(Joi.string()).default([]),
  instructions: Joi.string().required(),
  templateFile: Joi.string().optional(),
  strictMode: Joi.boolean().default(false),
  workspaceId: Joi.string().required()
});

export const criarAgenteSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  theme: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(500).optional(),
  workspaceId: Joi.string().required(),
  variables: Joi.array().items(Joi.string()).required(),
  structure: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('header', 'body', 'conclusion').required(),
    required: Joi.boolean().required(),
    order: Joi.number().required(),
    startLine: Joi.number().optional(),
    content: Joi.string().optional()
  })).required(),
  extractedText: Joi.string().min(50).required(),
  documentTemplate: Joi.object({
    fileUrl: Joi.string().uri().required(),
    fileName: Joi.string().required()
  }).optional()
});

export function validateRequest(schema: Joi.ObjectSchema, data: any) {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(`Validação falhou: ${error.details[0].message}`);
  }
  return value;
}
