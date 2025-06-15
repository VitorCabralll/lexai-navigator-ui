
import { OpenAI } from 'openai';
import * as logger from 'firebase-functions/v2/logger';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentClassification, QualityMetrics, VariableDetection } from './intelligentDocxProcessor';
import { Section } from '../types/agent';

// Helper to convert error to string
const errorToString = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export interface AgentCreationRequest {
  documentClassification: DocumentClassification;
  qualityMetrics: QualityMetrics;
  variables: VariableDetection[];
  structure: Section[];
  extractedText: string;
  userPreferences?: {
    complexity: 'simple' | 'intermediate' | 'advanced';
    focus: 'speed' | 'quality' | 'precision';
    style: 'formal' | 'didactic' | 'technical';
  };
}

export interface AgentCreationResult {
  suggestedName: string;
  suggestedDescription: string;
  optimizedPrompt: string;
  specializations: string[];
  confidenceScore: number;
  recommendations: string[];
}

export class AIAgentCreator {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey
    });
  }

  async createIntelligentAgent(request: AgentCreationRequest): Promise<AgentCreationResult> {
    try {
      logger.info('Iniciando criação inteligente de agente...');

      // Gerar nome e descrição do agente
      const agentIdentity = await this.generateAgentIdentity(request);
      
      // Otimizar prompt com IA
      const optimizedPrompt = await this.optimizePromptWithAI(request, agentIdentity);
      
      // Gerar especializações
      const specializations = this.generateSpecializations(request);
      
      // Calcular score de confiança
      const confidenceScore = this.calculateConfidenceScore(request);
      
      // Gerar recomendações
      const recommendations = await this.generateRecommendations(request);

      logger.info(`Agente criado com ${confidenceScore}% de confiança`);

      return {
        suggestedName: agentIdentity.name,
        suggestedDescription: agentIdentity.description,
        optimizedPrompt,
        specializations,
        confidenceScore,
        recommendations
      };

    } catch (error) {
      logger.error('Erro na criação inteligente do agente:', { error: error instanceof Error ? error.toString() : error });
      throw error;
    }
  }

  private loadPromptTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, '../prompt_templates/', templateName);
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      logger.error(`Erro ao carregar template de prompt: ${templateName}`, { error: errorToString(error) });
      // Fallback or re-throw, for now, re-throw to indicate a critical issue
      throw new Error(`Falha ao carregar template ${templateName}`);
    }
  }

  private async generateAgentIdentity(request: AgentCreationRequest): Promise<{name: string, description: string}> {
    const { documentClassification, qualityMetrics, variables } = request;
    
    const template = this.loadPromptTemplate('agent_identity_prompt.txt');
    const prompt = template
      .replace(/\$\{documentClassification.area\}/g, documentClassification.area)
      .replace(/\$\{documentClassification.subtype\}/g, documentClassification.subtype)
      .replace(/\$\{qualityMetrics.overall\}/g, String(qualityMetrics.overall))
      .replace(/\$\{variables.length\}/g, String(variables.length))
      .replace(/\$\{documentClassification.keywords\}/g, documentClassification.keywords.join(', '));

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Resposta vazia da OpenAI');

      const parsed = JSON.parse(content);
      return {
        name: parsed.name.substring(0, 50),
        description: parsed.description.substring(0, 200)
      };

    } catch (error) {
      logger.warn('Erro ao gerar identidade com IA, usando fallback:', { error: error instanceof Error ? error.toString() : error });
      return this.generateFallbackIdentity(request);
    }
  }

  private generateFallbackIdentity(request: AgentCreationRequest): {name: string, description: string} {
    const { documentClassification } = request;
    
    const areaNames = {
      civil: 'Especialista Civil',
      penal: 'Redator Penal', 
      trabalhista: 'Assistente Trabalhista',
      tributario: 'Consultor Tributário',
      administrativo: 'Especialista Administrativo',
      constitucional: 'Analista Constitucional'
    };

    const name = areaNames[documentClassification.area] || 'Especialista Jurídico';
    const description = `Especialista em ${documentClassification.area} focado em ${documentClassification.subtype}`;

    return { name, description };
  }

  private async optimizePromptWithAI(request: AgentCreationRequest, identity: {name: string, description: string}): Promise<string> {
    const { documentClassification, userPreferences } = request;
    
    const basePrompt = this.generateBasePrompt(request);
    const template = this.loadPromptTemplate('optimization_prompt_template.txt');

    const optimizationPrompt = template
      .replace(/\$\{basePrompt\}/g, basePrompt)
      .replace(/\$\{identity.name\}/g, identity.name)
      .replace(/\$\{identity.description\}/g, identity.description)
      .replace(/\$\{userPreferences.complexity\}/g, userPreferences?.complexity || 'intermediate')
      .replace(/\$\{userPreferences.focus\}/g, userPreferences?.focus || 'quality')
      .replace(/\$\{userPreferences.style\}/g, userPreferences?.style || 'formal')
      .replace(/\$\{documentClassification.area\}/g, documentClassification.area)
      // The second occurrence of userPreferences.focus for "Otimizar para ${userPreferences.focus}"
      .replace(/\$\{userPreferences.focus\}/g, userPreferences?.focus || 'quality');


    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: optimizationPrompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      const optimizedPrompt = response.choices[0]?.message?.content;
      return optimizedPrompt || basePrompt;

    } catch (error) {
      logger.warn('Erro na otimização com IA, usando prompt base:', { error: error instanceof Error ? error.toString() : error });
      return basePrompt;
    }
  }

  private generateBasePrompt(request: AgentCreationRequest): string {
    const { documentClassification, variables, structure, extractedText } = request;

    const variablesDesc = variables
      .filter(v => v.confidence > 0.7)
      .map(v => `- ${v.name} (${v.type}): ${v.required ? 'obrigatório' : 'opcional'}`)
      .join('\n');

    const sectionsDesc = structure
      .map(s => `${s.order + 1}. ${s.name} (${s.type})${s.required ? ' - OBRIGATÓRIO' : ''}`)
      .join('\n');

    const extractedTextPreview = extractedText.substring(0, 1500) + (extractedText.length > 1500 ? '...' : '');

    const template = this.loadPromptTemplate('base_prompt_template.txt');
    return template
      .replace(/\$\{documentClassification.area\}/g, documentClassification.area)
      .replace(/\$\{documentClassification.subtype\}/g, documentClassification.subtype)
      .replace(/\$\{sectionsDesc\}/g, sectionsDesc)
      .replace(/\$\{variablesDesc\}/g, variablesDesc)
      .replace(/\$\{documentClassification.area.toUpperCase\(\)\}/g, documentClassification.area.toUpperCase())
      .replace(/\$\{extractedTextPreview\}/g, extractedTextPreview);
  }

  private generateSpecializations(request: AgentCreationRequest): string[] {
    const { documentClassification, variables } = request;
    const specializations: string[] = [];

    // Especialização por área
    specializations.push(`${documentClassification.area.charAt(0).toUpperCase() + documentClassification.area.slice(1)}`);
    
    // Especialização por subtipo
    if (documentClassification.subtype !== 'genérico') {
      specializations.push(documentClassification.subtype);
    }

    // Especialização por tipos de variáveis
    const variableTypes = [...new Set(variables.map(v => v.type))];
    if (variableTypes.includes('currency')) {
      specializations.push('Cálculos monetários');
    }
    if (variableTypes.includes('date')) {
      specializations.push('Gestão de prazos');
    }
    if (variableTypes.includes('cpf') || variableTypes.includes('cnpj')) {
      specializations.push('Identificação de partes');
    }

    // Especialização por palavras-chave
    if (documentClassification.keywords.includes('contrato')) {
      specializations.push('Contratos');
    }
    if (documentClassification.keywords.includes('petição')) {
      specializations.push('Peças processuais');
    }

    return specializations.slice(0, 5); // Limitar a 5 especializações
  }

  private calculateConfidenceScore(request: AgentCreationRequest): number {
    const { documentClassification, qualityMetrics, variables, structure } = request;
    
    // Fatores de confiança
    const classificationConfidence = documentClassification.confidence / 100;
    const qualityScore = qualityMetrics.overall / 100;
    const variableScore = Math.min(variables.length / 10, 1); // Máximo de 10 variáveis
    const structureScore = Math.min(structure.length / 6, 1); // Máximo de 6 seções
    
    // Peso dos fatores
    const weights = {
      classification: 0.3,
      quality: 0.3,
      variables: 0.2,
      structure: 0.2
    };
    
    const totalScore = 
      (classificationConfidence * weights.classification) +
      (qualityScore * weights.quality) +
      (variableScore * weights.variables) +
      (structureScore * weights.structure);
    
    return Math.round(totalScore * 100);
  }

  private async generateRecommendations(request: AgentCreationRequest): Promise<string[]> {
    const { qualityMetrics, variables, documentClassification } = request;
    const recommendations: string[] = [];

    // Recomendações baseadas na qualidade
    if (qualityMetrics.completeness < 70) {
      recommendations.push('Considere adicionar seções obrigatórias ao template');
    }
    if (qualityMetrics.clarity < 70) {
      recommendations.push('Revise variáveis para melhor clareza do documento');
    }
    if (qualityMetrics.structure < 70) {
      recommendations.push('Melhore a organização das seções do documento');
    }
    if (qualityMetrics.legalCompliance < 70) {
      recommendations.push('Adicione mais fundamentação legal ao template');
    }

    // Recomendações baseadas nas variáveis
    const requiredVars = variables.filter(v => v.required).length;
    const optionalVars = variables.filter(v => !v.required).length;
    
    if (requiredVars < 3) {
      recommendations.push('Considere adicionar mais campos obrigatórios');
    }
    if (optionalVars > requiredVars * 2) {
      recommendations.push('Muitas variáveis opcionais podem confundir o usuário');
    }

    // Recomendações por área jurídica
    if (documentClassification.area === 'civil' && !variables.some(v => v.type === 'currency')) {
      recommendations.push('Documentos civis geralmente incluem valores monetários');
    }
    if (documentClassification.area === 'trabalhista' && !variables.some(v => v.type === 'date')) {
      recommendations.push('Documentos trabalhistas precisam de controle de datas');
    }

    return recommendations.slice(0, 4); // Limitar a 4 recomendações
  }
}
