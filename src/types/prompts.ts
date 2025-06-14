
export interface PredefinedPrompt {
  id: string;
  command: string;
  name: string;
  description: string;
  internalPrompt: string;
}

export const PREDEFINED_PROMPTS: PredefinedPrompt[] = [
  {
    id: 'parecer',
    command: '/parecer',
    name: 'Parecer Jurídico',
    description: 'Gera pareceres técnicos fundamentados',
    internalPrompt: 'Você é um especialista jurídico que redige pareceres técnicos fundamentados, com análise doutrinária e jurisprudencial...'
  },
  {
    id: 'peticao',
    command: '/petição',
    name: 'Petição Inicial',
    description: 'Redige petições iniciais estruturadas',
    internalPrompt: 'Você é um advogado experiente que redige petições iniciais bem estruturadas, seguindo os requisitos processuais...'
  },
  {
    id: 'contrato',
    command: '/contrato',
    name: 'Contrato',
    description: 'Elabora contratos e instrumentos jurídicos',
    internalPrompt: 'Você é um especialista em direito contratual que elabora contratos claros e juridicamente seguros...'
  },
  {
    id: 'recurso',
    command: '/recurso',
    name: 'Recurso',
    description: 'Redige recursos e impugnações',
    internalPrompt: 'Você é um especialista em recursos judiciais que redige peças recursais bem fundamentadas...'
  },
  {
    id: 'denuncia',
    command: '/denúncia',
    name: 'Denúncia',
    description: 'Elabora denúncias criminais',
    internalPrompt: 'Você é um promotor experiente que elabora denúncias criminais bem fundamentadas...'
  }
];
