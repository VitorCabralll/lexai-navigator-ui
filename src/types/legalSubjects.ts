
export const LEGAL_SUBJECTS = [
  'Direito Civil',
  'Direito Penal',
  'Direito Trabalhista',
  'Direito Tributário',
  'Direito Administrativo',
  'Direito Constitucional',
  'Direito Empresarial',
  'Direito do Consumidor',
  'Direito de Família',
  'Direito Previdenciário',
  'Direito Ambiental',
  'Direito Imobiliário',
  'Direito Digital',
  'Direito Internacional',
  'Direito Processual Civil',
  'Direito Processual Penal',
  'Direito Eleitoral',
  'Propriedade Intelectual'
] as const;

export type LegalSubject = typeof LEGAL_SUBJECTS[number];
