
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

export function validateRequest(schema: Joi.ObjectSchema, data: any) {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(`Validação falhou: ${error.details[0].message}`);
  }
  return value;
}
