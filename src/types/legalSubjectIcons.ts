
import { 
  Scale, 
  Shield, 
  Briefcase, 
  Calculator, 
  Building, 
  BookOpen, 
  ShoppingCart, 
  // Users, // Unused
  Heart, 
  PiggyBank,
  Leaf,
  Home,
  Monitor,
  Globe,
  FileText,
  Gavel,
  Vote,
  Copyright
} from "lucide-react";

export const LEGAL_SUBJECT_ICONS = {
  'Direito Civil': Scale,
  'Direito Penal': Shield,
  'Direito Trabalhista': Briefcase,
  'Direito Tributário': Calculator,
  'Direito Administrativo': Building,
  'Direito Constitucional': BookOpen,
  'Direito Empresarial': Briefcase,
  'Direito do Consumidor': ShoppingCart,
  'Direito de Família': Heart,
  'Direito Previdenciário': PiggyBank,
  'Direito Ambiental': Leaf,
  'Direito Imobiliário': Home,
  'Direito Digital': Monitor,
  'Direito Internacional': Globe,
  'Direito Processual Civil': FileText,
  'Direito Processual Penal': Gavel,
  'Direito Eleitoral': Vote,
  'Propriedade Intelectual': Copyright
} as const;

export const LEGAL_SUBJECT_COLORS = {
  'Direito Civil': 'text-blue-600',
  'Direito Penal': 'text-red-600',
  'Direito Trabalhista': 'text-green-600',
  'Direito Tributário': 'text-yellow-600',
  'Direito Administrativo': 'text-gray-600',
  'Direito Constitucional': 'text-purple-600',
  'Direito Empresarial': 'text-indigo-600',
  'Direito do Consumidor': 'text-pink-600',
  'Direito de Família': 'text-rose-600',
  'Direito Previdenciário': 'text-orange-600',
  'Direito Ambiental': 'text-emerald-600',
  'Direito Imobiliário': 'text-amber-600',
  'Direito Digital': 'text-cyan-600',
  'Direito Internacional': 'text-teal-600',
  'Direito Processual Civil': 'text-slate-600',
  'Direito Processual Penal': 'text-zinc-600',
  'Direito Eleitoral': 'text-violet-600',
  'Propriedade Intelectual': 'text-fuchsia-600'
} as const;
