
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
})

export const documentSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .refine(val => val.trim().length > 0, 'Título não pode estar vazio'),
  content: z.string()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(50000, 'Conteúdo muito longo')
})

export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB')
    .refine(
      file => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain'].includes(file.type),
      'Tipo de arquivo não suportado'
    )
})

export const agentSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  prompt: z.string()
    .min(20, 'Prompt deve ter pelo menos 20 caracteres')
    .max(2000, 'Prompt deve ter no máximo 2000 caracteres')
})

export type LoginFormData = z.infer<typeof loginSchema>
export type DocumentFormData = z.infer<typeof documentSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema>
export type AgentFormData = z.infer<typeof agentSchema>
