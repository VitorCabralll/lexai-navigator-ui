
import OpenAI from 'openai';
import { GenerationRequest, ProcessingStep, DocumentSection } from '../types/document';
import { Agent } from '../types/agent';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateDocument(
    request: GenerationRequest,
    agent?: Agent,
    steps: ProcessingStep[] = []
  ): Promise<{ content: string; sections: DocumentSection[]; tokensUsed: number }> {
    
    // Etapa 1: Interpretação da Demanda
    const interpretationStep = this.createStep('Interpretação da Demanda', steps);
    const interpretation = await this.interpretDemand(request, interpretationStep);
    
    // Etapa 2: Fundamentação Legal
    const fundamentationStep = this.createStep('Fundamentação Legal', steps);
    const fundamentation = await this.legalFundamentation(request, interpretation, fundamentationStep);
    
    // Etapa 3: Redação Final
    const writingStep = this.createStep('Redação Final', steps);
    const finalDocument = await this.finalWriting(request, agent, interpretation, fundamentation, writingStep);

    return finalDocument;
  }

  private createStep(name: string, steps: ProcessingStep[]): ProcessingStep {
    const step: ProcessingStep = {
      name,
      status: 'processing',
      startTime: Date.now()
    };
    steps.push(step);
    return step;
  }

  private completeStep(step: ProcessingStep, result: any) {
    step.status = 'completed';
    step.endTime = Date.now();
    step.result = result;
  }

  private async interpretDemand(request: GenerationRequest, step: ProcessingStep) {
    try {
      const prompt = `Analise a demanda jurídica e extraia as informações essenciais:

INSTRUÇÕES DO USUÁRIO:
${request.instructions}

DOCUMENTOS DE APOIO: ${request.supportDocuments.length} arquivo(s) anexado(s)

Tarefas:
1. Identifique o tipo de documento jurídico necessário
2. Extraia fatos relevantes
3. Identifique questões jurídicas centrais
4. Determine o público-alvo (juiz, cliente, etc.)

Responda em formato estruturado.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3
      });

      const interpretation = response.choices[0].message.content || '';
      this.completeStep(step, interpretation);
      return interpretation;
    } catch (error) {
      step.status = 'error';
      step.endTime = Date.now();
      throw error;
    }
  }

  private async legalFundamentation(
    request: GenerationRequest, 
    interpretation: string, 
    step: ProcessingStep
  ) {
    try {
      const prompt = `Com base na interpretação da demanda, desenvolva a fundamentação jurídica:

INTERPRETAÇÃO:
${interpretation}

Tarefas:
1. Identifique normas jurídicas aplicáveis
2. Cite jurisprudência relevante quando apropriado
3. Desenvolva argumentação jurídica sólida
4. Estruture logicamente os argumentos

Foque em fundamentação consistente com o direito brasileiro.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.2
      });

      const fundamentation = response.choices[0].message.content || '';
      this.completeStep(step, fundamentation);
      return fundamentation;
    } catch (error) {
      step.status = 'error';
      step.endTime = Date.now();
      throw error;
    }
  }

  private async finalWriting(
    request: GenerationRequest,
    agent: Agent | undefined,
    interpretation: string,
    fundamentation: string,
    step: ProcessingStep
  ) {
    try {
      let masterPrompt = '';
      
      if (request.mode === 'agent' && agent?.masterPrompt) {
        masterPrompt = agent.masterPrompt;
      } else {
        masterPrompt = this.getDefaultPromptForType(request.promptType || 'generic');
      }

      const prompt = `${masterPrompt}

INTERPRETAÇÃO DA DEMANDA:
${interpretation}

FUNDAMENTAÇÃO JURÍDICA:
${fundamentation}

INSTRUÇÕES ESPECÍFICAS:
${request.instructions}

MODO: ${request.strictMode ? 'RIGOROSO - Siga exatamente o modelo fornecido' : 'FLEXÍVEL - Adapte conforme necessário'}

Gere o documento jurídico final completo, profissional e tecnicamente correto.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.1
      });

      const content = response.choices[0].message.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;
      
      // Dividir em seções
      const sections = this.extractSections(content);
      
      this.completeStep(step, { content, sections, tokensUsed });
      
      return { content, sections, tokensUsed };
    } catch (error) {
      step.status = 'error';
      step.endTime = Date.now();
      throw error;
    }
  }

  private getDefaultPromptForType(promptType: string): string {
    const prompts: Record<string, string> = {
      'parecer': 'Você é um advogado especialista. Redija um parecer jurídico técnico e fundamentado.',
      'peticao': 'Você é um advogado peticionário. Redija uma petição inicial clara e bem fundamentada.',
      'contrato': 'Você é um advogado especialista em direito contratual. Redija um contrato completo e equilibrado.',
      'recurso': 'Você é um advogado especialista em recursos. Redija um recurso bem fundamentado.',
      'generic': 'Você é um advogado experiente. Redija um documento jurídico profissional.'
    };

    return prompts[promptType] || prompts['generic'];
  }

  private extractSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let currentSection: DocumentSection | null = null;
    let order = 0;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Detectar títulos de seção (linhas em maiúsculo ou com numeração)
      if (this.isSectionTitle(trimmedLine)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          title: trimmedLine,
          content: '',
          type: this.determineSectionType(trimmedLine),
          order: order++
        };
      } else if (currentSection && trimmedLine) {
        currentSection.content += line + '\n';
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private isSectionTitle(line: string): boolean {
    return /^[A-ZÁÊÇÕ\s]+$/.test(line) && line.length > 3 && line.length < 100;
  }

  private determineSectionType(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('ementa') || titleLower.includes('súmula')) return 'header';
    if (titleLower.includes('relatório') || titleLower.includes('fatos')) return 'body';
    if (titleLower.includes('fundament') || titleLower.includes('mérito')) return 'body';
    if (titleLower.includes('dispositivo') || titleLower.includes('conclusão')) return 'conclusion';
    
    return 'body';
  }
}
