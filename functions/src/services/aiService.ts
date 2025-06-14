import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { GenerationRequest, ProcessingStep, DocumentSection } from '../types/document';
import { Agent } from '../types/agent';
import { PipelineRequest, PipelineResult, EtapaProcessamento, DocumentoApoio } from '../types/pipeline';
import { DocumentProcessor } from './documentProcessor';

export class AIService {
  private openai: OpenAI;
  private documentProcessor: DocumentProcessor;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.documentProcessor = new DocumentProcessor();
  }

  async executarPipelineIA(
    agentId: string,
    variaveis: Record<string, string>,
    documentos: DocumentoApoio[],
    instrucoes: string
  ): Promise<PipelineResult> {
    const inicioProcessamento = Date.now();
    const etapas: EtapaProcessamento[] = [];
    
    try {
      // 1. Buscar agente e prompt mestre
      const agent = await this.buscarAgente(agentId);
      if (!agent.masterPrompt) {
        throw new Error('Agente não possui prompt mestre configurado');
      }

      // 2. Processar documentos de apoio
      const documentosResumo = await this.documentProcessor.processarDocumentos(documentos);
      const contextoDocs = documentosResumo.join('\n\n');

      // 3. Executar pipeline de 3 etapas
      const etapa1 = await this.executarEtapa1(instrucoes, contextoDocs, etapas);
      const etapa2 = await this.executarEtapa2(etapa1, etapas);
      const textoFinal = await this.executarEtapa3(agent.masterPrompt, etapa2, instrucoes, variaveis, etapas);

      // 4. Calcular metadados
      const tempoTotal = Date.now() - inicioProcessamento;
      const tokensTotal = etapas.reduce((acc, etapa) => acc + etapa.tokensUsados, 0);
      
      return {
        textoFinal,
        metadata: {
          tokensUsados: {
            etapa1: etapas[0]?.tokensUsados || 0,
            etapa2: etapas[1]?.tokensUsados || 0,
            etapa3: etapas[2]?.tokensUsados || 0,
            total: tokensTotal
          },
          tempoProcessamento: tempoTotal,
          custoEstimado: this.calcularCusto(etapas)
        }
      };

    } catch (error) {
      console.error('Erro no pipeline de IA:', error);
      throw error;
    }
  }

  private async buscarAgente(agentId: string): Promise<Agent> {
    const agentDoc = await admin.firestore().collection('agents').doc(agentId).get();
    
    if (!agentDoc.exists) {
      throw new Error('Agente não encontrado');
    }
    
    return { id: agentDoc.id, ...agentDoc.data() } as Agent;
  }

  private async executarEtapa1(instrucoes: string, contextoDocs: string, etapas: EtapaProcessamento[]): Promise<string> {
    const inicio = Date.now();
    
    const prompt = `Analise a demanda jurídica e extraia as informações essenciais:

INSTRUÇÕES:
${instrucoes}

DOCUMENTOS DE APOIO:
${contextoDocs}

Tarefas:
1. Identifique o tipo de documento jurídico necessário
2. Extraia fatos relevantes
3. Identifique questões jurídicas centrais
4. Determine estratégia argumentativa

Responda de forma estruturada e objetiva (máximo 800 palavras).`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3
    });

    const resultado = response.choices[0].message.content || '';
    
    etapas.push({
      numero: 1,
      nome: 'Interpretação da Demanda',
      modelo: 'gpt-3.5-turbo',
      prompt,
      resultado,
      tokensUsados: response.usage?.total_tokens || 0,
      tempoInicio: inicio,
      tempoFim: Date.now()
    });

    return resultado;
  }

  private async executarEtapa2(interpretacao: string, etapas: EtapaProcessamento[]): Promise<string> {
    const inicio = Date.now();
    
    const prompt = `Com base na interpretação da demanda, desenvolva a fundamentação jurídica:

INTERPRETAÇÃO:
${interpretacao}

Tarefas:
1. Identifique normas jurídicas aplicáveis (leis, decretos, jurisprudência)
2. Desenvolva argumentação jurídica sólida
3. Cite precedentes relevantes quando apropriado
4. Estruture logicamente os argumentos

Foque em fundamentação consistente com o direito brasileiro (máximo 1500 palavras).`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.2
    });

    const resultado = response.choices[0].message.content || '';
    
    etapas.push({
      numero: 2,
      nome: 'Fundamentação Jurídica',
      modelo: 'gpt-3.5-turbo',
      prompt,
      resultado,
      tokensUsados: response.usage?.total_tokens || 0,
      tempoInicio: inicio,
      tempoFim: Date.now()
    });

    return resultado;
  }

  private async executarEtapa3(
    promptMestre: string,
    fundamentacao: string,
    instrucoes: string,
    variaveis: Record<string, string>,
    etapas: EtapaProcessamento[]
  ): Promise<string> {
    const inicio = Date.now();
    
    // Aplicar variáveis no prompt mestre
    let promptPersonalizado = promptMestre;
    Object.entries(variaveis).forEach(([chave, valor]) => {
      const regex = new RegExp(`\\{\\{${chave}\\}\\}`, 'g');
      promptPersonalizado = promptPersonalizado.replace(regex, valor);
    });

    const prompt = `${promptPersonalizado}

FUNDAMENTAÇÃO DESENVOLVIDA:
${fundamentacao}

INSTRUÇÕES ESPECÍFICAS:
${instrucoes}

Gere o documento jurídico final completo, profissional e tecnicamente correto. Use a estrutura e estilo definidos no prompt mestre, incorporando a fundamentação e atendendo às instruções específicas.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.1
    });

    const resultado = response.choices[0].message.content || '';
    
    etapas.push({
      numero: 3,
      nome: 'Redação Final',
      modelo: 'gpt-4',
      prompt,
      resultado,
      tokensUsados: response.usage?.total_tokens || 0,
      tempoInicio: inicio,
      tempoFim: Date.now()
    });

    return resultado;
  }

  private calcularCusto(etapas: EtapaProcessamento[]): number {
    // Preços aproximados por 1k tokens (valores de referência)
    const precos = {
      'gpt-3.5-turbo': 0.002, // $0.002/1k tokens
      'gpt-4': 0.03           // $0.03/1k tokens
    };
    
    return etapas.reduce((custo, etapa) => {
      const precoPor1k = precos[etapa.modelo as keyof typeof precos] || 0;
      return custo + (etapa.tokensUsados / 1000) * precoPor1k;
    }, 0);
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
