
export interface AdvancedPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  visibility: 'private' | 'workspace' | 'public';
  author: string;
  authorName: string;
  workspaceId?: string;
  version: string;
  rating: number;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  internalPrompt: string;
  metadata: {
    legalArea: string;
    documentType: string;
    complexity: number;
    estimatedTime: number;
    requiredFields: string[];
    keywords: string[];
  };
  analytics: {
    successRate: number;
    averageRating: number;
    totalGenerations: number;
    averageGenerationTime: number;
    feedbackCount: number;
    lastMonthUsage: number;
  };
  isFavorite?: boolean;
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: PromptSubcategory[];
  promptCount: number;
}

export interface PromptSubcategory {
  id: string;
  name: string;
  description: string;
  promptCount: number;
}

export interface PromptAnalyticsData {
  totalPrompts: number;
  publicPrompts: number;
  workspacePrompts: number;
  privatePrompts: number;
  topCategories: { name: string; count: number; percentage: number }[];
  recentActivity: { date: string; generations: number; newPrompts: number }[];
  popularPrompts: AdvancedPrompt[];
  qualityTrends: { month: string; averageRating: number; totalUsage: number }[];
}

export const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export const VISIBILITY_ICONS = {
  private: 'lock',
  workspace: 'users',
  public: 'globe'
};
