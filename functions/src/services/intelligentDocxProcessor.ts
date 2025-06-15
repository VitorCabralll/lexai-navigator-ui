
import * as mammoth from 'mammoth';
import { Section } from '../types/agent';

export interface IntelligentProcessingResult {
  textoExtraido: string;
  variaveis: VariableDetection[];
  estruturas: Section[];
  classificacao: DocumentClassification;
  qualidade: QualityMetrics;
}

export interface VariableDetection {
  name: string;
  type: 'text' | 'date' | 'number' | 'currency' | 'email' | 'cpf' | 'cnpj';
  pattern: string;
  confidence: number;
  examples: string[];
  required: boolean;
}

export interface DocumentClassification {
  area: 'civil' | 'penal' | 'trabalhista' | 'tributario' | 'administrativo' | 'constitucional';
  subtype: string;
  confidence: number;
  keywords: string[];
}

export interface QualityMetrics {
  completeness: number; // 0-100
  clarity: number; // 0-100
  structure: number; // 0-100
  legalCompliance: number; // 0-100
  overall: number; // 0-100
}

export class IntelligentDocxProcessor {
  private legalKeywords = {
    civil: ['contrato', 'responsabilidade', 'indenização', 'danos', 'família', 'sucessões'],
    penal: ['crime', 'delito', 'prisão', 'denúncia', 'sentença', 'absolvição'],
    trabalhista: ['empregado', 'salário', 'jornada', 'rescisão', 'fgts', 'inss'],
    tributario: ['imposto', 'tributo', 'icms', 'ipi', 'irpf', 'contribuição'],
    administrativo: ['licitação', 'concurso', 'servidor', 'ato administrativo'],
    constitucional: ['direitos fundamentais', 'supremo', 'constituição', 'habeas corpus']
  };

  private variablePatterns = [
    // Texto genérico
    { pattern: /\{\{([A-Z_]+)\}\}/g, type: 'text' as const, confidence: 0.9 },
    { pattern: /\[([A-Z_]+)\]/g, type: 'text' as const, confidence: 0.8 },
    
    // Datas
    { pattern: /\{\{(DATA_[A-Z_]*|DT_[A-Z_]*)\}\}/g, type: 'date' as const, confidence: 0.95 },
    { pattern: /__\/__\/____|dd\/mm\/aaaa/g, type: 'date' as const, confidence: 0.7 },
    
    // Valores monetários
    { pattern: /\{\{(VALOR_[A-Z_]*|VL_[A-Z_]*|PRECO_[A-Z_]*)\}\}/g, type: 'currency' as const, confidence: 0.95 },
    { pattern: /R\$\s*[_]+/g, type: 'currency' as const, confidence: 0.8 },
    
    // Números
    { pattern: /\{\{(NUM_[A-Z_]*|QTD_[A-Z_]*)\}\}/g, type: 'number' as const, confidence: 0.9 },
    
    // Email
    { pattern: /\{\{(EMAIL_[A-Z_]*)\}\}/g, type: 'email' as const, confidence: 0.95 },
    
    // CPF/CNPJ
    { pattern: /\{\{(CPF_[A-Z_]*)\}\}/g, type: 'cpf' as const, confidence: 0.95 },
    { pattern: /\{\{(CNPJ_[A-Z_]*)\}\}/g, type: 'cnpj' as const, confidence: 0.95 },
    { pattern: /___\.___\.___-__|___\/__/__/g, type: 'cpf' as const, confidence: 0.8 }
  ];

  async processDocxIntelligently(buffer: Buffer): Promise<IntelligentProcessingResult> {
    try {
      // Extrair texto do DOCX
      const result = await mammoth.extractRawText({ buffer });
      const textoExtraido = result.value;

      if (textoExtraido.trim().length < 50) {
        throw new Error('Documento muito pequeno ou sem conteúdo válido');
      }

      // Detectar variáveis com IA
      const variaveis = this.detectVariablesIntelligently(textoExtraido);
      
      // Detectar estrutura
      const estruturas = this.detectStructureIntelligently(textoExtraido);
      
      // Classificar documento
      const classificacao = this.classifyDocument(textoExtraido);
      
      // Calcular métricas de qualidade
      const qualidade = this.calculateQualityMetrics(textoExtraido, estruturas, variaveis);

      return {
        textoExtraido,
        variaveis,
        estruturas,
        classificacao,
        qualidade
      };
    } catch (error) {
      console.error('Erro no processamento inteligente:', error);
      throw error;
    }
  }

  private detectVariablesIntelligently(text: string): VariableDetection[] {
    const detectedVariables: Map<string, VariableDetection> = new Map();

    // Aplicar padrões de detecção
    this.variablePatterns.forEach(({ pattern, type, confidence }) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        const variableName = match[1] || this.generateVariableName(match[0], type);
        const cleanName = variableName.trim().toUpperCase();
        
        if (cleanName.length > 1) {
          const existing = detectedVariables.get(cleanName);
          if (!existing || confidence > existing.confidence) {
            detectedVariables.set(cleanName, {
              name: cleanName,
              type,
              pattern: match[0],
              confidence,
              examples: [match[0]],
              required: this.isRequiredVariable(cleanName, text)
            });
          } else {
            existing.examples.push(match[0]);
          }
        }
      }
    });

    // Detectar variáveis contextuais
    this.detectContextualVariables(text, detectedVariables);

    return Array.from(detectedVariables.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // Limitar a 20 variáveis mais relevantes
  }

  private detectContextualVariables(text: string, variables: Map<string, VariableDetection>): void {
    const contextPatterns = [
      { context: /nome\s+do\s+(?:requerente|autor|réu)/gi, variable: 'NOME_PARTE', type: 'text' as const },
      { context: /endereço\s+(?:completo|residencial)/gi, variable: 'ENDERECO', type: 'text' as const },
      { context: /telefone\s+(?:celular|fixo)?/gi, variable: 'TELEFONE', type: 'text' as const },
      { context: /processo\s+n[úo]?\s*[\.:]/gi, variable: 'NUMERO_PROCESSO', type: 'text' as const },
      { context: /comarca\s+de/gi, variable: 'COMARCA', type: 'text' as const },
      { context: /valor\s+da\s+(?:causa|condenação)/gi, variable: 'VALOR_CAUSA', type: 'currency' as const }
    ];

    contextPatterns.forEach(({ context, variable, type }) => {
      if (context.test(text) && !variables.has(variable)) {
        variables.set(variable, {
          name: variable,
          type,
          pattern: `{{${variable}}}`,
          confidence: 0.85,
          examples: [`{{${variable}}}`],
          required: true
        });
      }
    });
  }

  private generateVariableName(match: string, type: string): string {
    const cleanMatch = match.replace(/[{}[\]]/g, '');
    if (cleanMatch.length > 1) return cleanMatch;
    
    const typePrefix = {
      text: 'TEXTO',
      date: 'DATA',
      currency: 'VALOR',
      number: 'NUMERO',
      email: 'EMAIL',
      cpf: 'CPF',
      cnpj: 'CNPJ'
    };
    
    return `${typePrefix[type as keyof typeof typePrefix]}_${Date.now()}`;
  }

  private isRequiredVariable(variableName: string, text: string): boolean {
    const requiredKeywords = ['obrigatório', 'necessário', 'requerido', 'essencial'];
    const context = this.getVariableContext(variableName, text, 100);
    return requiredKeywords.some(keyword => context.toLowerCase().includes(keyword));
  }

  private getVariableContext(variableName: string, text: string, contextLength: number): string {
    const index = text.indexOf(variableName);
    if (index === -1) return '';
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + variableName.length + contextLength);
    return text.substring(start, end);
  }

  private detectStructureIntelligently(text: string): Section[] {
    const lines = text.split('\n').filter(line => line.trim());
    const sections: Section[] = [];
    let order = 0;

    // Padrões específicos para documentos jurídicos brasileiros
    const legalPatterns = [
      { pattern: /^(EXCELENTÍSSIMO|MERITÍSSIMO|ILUSTRÍSSIMO)/i, name: 'Vocativo', type: 'header' as const },
      { pattern: /^(REQUERENTE|AUTOR|REQUERIDO|RÉU)[:]/i, name: 'Partes', type: 'header' as const },
      { pattern: /^(DOS\s+FATOS|RELATÓRIO|HISTÓRICO)/i, name: 'Fatos', type: 'body' as const },
      { pattern: /^(DO\s+DIREITO|FUNDAMENTAÇÃO|MÉRITO)/i, name: 'Fundamentação Jurídica', type: 'body' as const },
      { pattern: /^(DOS\s+PEDIDOS|REQUERIMENTOS)/i, name: 'Pedidos', type: 'conclusion' as const },
      { pattern: /^(TERMOS|CONCLUSÃO)/i, name: 'Conclusão', type: 'conclusion' as const }
    ];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Verificar padrões jurídicos específicos
      legalPatterns.forEach(({ pattern, name, type }) => {
        if (pattern.test(trimmedLine)) {
          sections.push({
            name,
            type,
            required: true,
            order: order++,
            startLine: index,
            content: trimmedLine
          });
        }
      });

      // Detectar títulos em caixa alta (mínimo 3 palavras)
      if (trimmedLine.length > 10 && 
          trimmedLine === trimmedLine.toUpperCase() && 
          /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/.test(trimmedLine) &&
          trimmedLine.split(' ').length >= 3) {
        
        if (!sections.find(s => s.name === trimmedLine)) {
          sections.push({
            name: trimmedLine,
            type: this.inferSectionType(trimmedLine),
            required: false,
            order: order++,
            startLine: index,
            content: trimmedLine
          });
        }
      }
    });

    return sections.sort((a, b) => a.order - b.order);
  }

  private inferSectionType(title: string): 'header' | 'body' | 'conclusion' {
    const headerKeywords = ['identificação', 'qualificação', 'partes', 'processo'];
    const conclusionKeywords = ['pedidos', 'requerimentos', 'conclusão', 'termos'];
    
    const lowerTitle = title.toLowerCase();
    
    if (headerKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'header';
    }
    if (conclusionKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'conclusion';
    }
    return 'body';
  }

  private classifyDocument(text: string): DocumentClassification {
    const lowerText = text.toLowerCase();
    const classifications: Array<{ area: keyof typeof this.legalKeywords, score: number, keywords: string[] }> = [];

    Object.entries(this.legalKeywords).forEach(([area, keywords]) => {
      const foundKeywords = keywords.filter(keyword => lowerText.includes(keyword));
      const score = foundKeywords.length / keywords.length;
      
      if (score > 0) {
        classifications.push({
          area: area as keyof typeof this.legalKeywords,
          score,
          keywords: foundKeywords
        });
      }
    });

    classifications.sort((a, b) => b.score - a.score);
    
    const topClassification = classifications[0];
    if (!topClassification) {
      return {
        area: 'civil',
        subtype: 'genérico',
        confidence: 0.3,
        keywords: []
      };
    }

    return {
      area: topClassification.area,
      subtype: this.inferSubtype(topClassification.area, text),
      confidence: Math.min(topClassification.score * 100, 95),
      keywords: topClassification.keywords
    };
  }

  private inferSubtype(area: string, text: string): string {
    const subtypes = {
      civil: ['contrato', 'responsabilidade civil', 'família', 'sucessões', 'propriedade'],
      penal: ['homicídio', 'furto', 'roubo', 'estelionato', 'tráfico'],
      trabalhista: ['rescisão', 'horas extras', 'acidente trabalho', 'assédio'],
      tributario: ['icms', 'ipi', 'irpf', 'contribuições', 'elisão'],
      administrativo: ['licitação', 'servidor público', 'ato administrativo'],
      constitucional: ['habeas corpus', 'mandado segurança', 'adin']
    };

    const areaSubtypes = subtypes[area as keyof typeof subtypes] || [];
    const lowerText = text.toLowerCase();
    
    for (const subtype of areaSubtypes) {
      if (lowerText.includes(subtype)) {
        return subtype;
      }
    }
    
    return 'genérico';
  }

  private calculateQualityMetrics(text: string, sections: Section[], variables: VariableDetection[]): QualityMetrics {
    // Completeness: estrutura obrigatória presente
    const requiredSections = sections.filter(s => s.required).length;
    const completeness = Math.min((requiredSections / 4) * 100, 100); // Assumindo 4 seções obrigatórias ideais

    // Clarity: proporção de texto vs variáveis
    const textLength = text.length;
    const variableLength = variables.reduce((sum, v) => sum + v.examples.join('').length, 0);
    const clarity = Math.min(((textLength - variableLength) / textLength) * 100, 100);

    // Structure: seções bem organizadas
    const structure = sections.length > 0 ? Math.min(sections.length * 20, 100) : 50;

    // Legal compliance: palavras-chave jurídicas
    const legalWords = ['considerando', 'fundamentação', 'jurisprudência', 'doutrina'];
    const legalCount = legalWords.filter(word => text.toLowerCase().includes(word)).length;
    const legalCompliance = Math.min(legalCount * 25, 100);

    // Overall quality
    const overall = Math.round((completeness + clarity + structure + legalCompliance) / 4);

    return {
      completeness: Math.round(completeness),
      clarity: Math.round(clarity),
      structure: Math.round(structure),
      legalCompliance: Math.round(legalCompliance),
      overall
    };
  }

  generateIntelligentPrompt(
    estruturas: Section[], 
    variaveis: VariableDetection[], 
    classificacao: DocumentClassification,
    qualidade: QualityMetrics,
    textoExtraido: string
  ): string {
    const variablesDesc = variaveis
      .filter(v => v.confidence > 0.7)
      .map(v => `- ${v.name} (${v.type}): ${v.required ? 'obrigatório' : 'opcional'}`)
      .join('\n');

    const sectionsDesc = estruturas
      .map(s => `${s.order + 1}. ${s.name} (${s.type})${s.required ? ' - OBRIGATÓRIO' : ''}`)
      .join('\n');

    return `Você é um especialista jurídico brasileiro especializado em ${classificacao.area}, especificamente em ${classificacao.subtype}.

ANÁLISE DO DOCUMENTO MODELO:
- Área jurídica: ${classificacao.area.toUpperCase()} (${classificacao.confidence}% confiança)
- Subtipo: ${classificacao.subtype}
- Qualidade geral: ${qualidade.overall}/100
- Extensão: ${textoExtraido.length} caracteres
- Seções identificadas: ${estruturas.length}
- Variáveis detectadas: ${variaveis.length}

ESTRUTURA OBRIGATÓRIA:
${sectionsDesc}

VARIÁVEIS PARA SUBSTITUIÇÃO:
${variablesDesc}

MÉTRICAS DE QUALIDADE:
- Completeness: ${qualidade.completeness}/100
- Clareza: ${qualidade.clarity}/100  
- Estrutura: ${qualidade.structure}/100
- Conformidade legal: ${qualidade.legalCompliance}/100

INSTRUÇÕES ESPECÍFICAS PARA ${classificacao.area.toUpperCase()}:
${this.getAreaSpecificInstructions(classificacao.area)}

PALAVRAS-CHAVE IDENTIFICADAS: ${classificacao.keywords.join(', ')}

INSTRUÇÕES DE GERAÇÃO:
1. Mantenha RIGOROSAMENTE a estrutura identificada
2. Use linguagem jurídica formal brasileira específica para ${classificacao.area}
3. Substitua TODAS as variáveis pelos valores fornecidos
4. Preserve formatação, numeração e hierarquia
5. Mantenha coerência com o subtipo "${classificacao.subtype}"
6. Use fundamentação legal sólida e atualizada
7. Aplique as melhores práticas de ${classificacao.area}

MODELO ORIGINAL (para referência de estilo):
${textoExtraido.substring(0, 2000)}${textoExtraido.length > 2000 ? '...' : ''}

IMPORTANTE: Gere um documento juridicamente correto, tecnicamente preciso e formalmente adequado para ${classificacao.area} brasileiro.`;
  }

  private getAreaSpecificInstructions(area: string): string {
    const instructions = {
      civil: '- Use fundamentação no Código Civil e legislação específica\n- Cite jurisprudência do STJ quando relevante\n- Observe prazos prescricionais e decadenciais',
      penal: '- Aplique o Código Penal e legislação especial\n- Observe princípios constitucionais penais\n- Use jurisprudência do STF e STJ',
      trabalhista: '- Fundamente na CLT e legislação trabalhista\n- Cite súmulas do TST\n- Observe princípios protetivos',
      tributario: '- Use CTN e legislação tributária específica\n- Cite jurisprudência administrativa\n- Observe princípios tributários constitucionais',
      administrativo: '- Aplique a Lei 9.784/99 e legislação administrativa\n- Use precedentes administrativos\n- Observe princípios da administração pública',
      constitucional: '- Fundamente na Constituição Federal\n- Cite jurisprudência do STF\n- Observe direitos fundamentais'
    };

    return instructions[area as keyof typeof instructions] || 'Use a legislação brasileira aplicável e jurisprudência pertinente';
  }
}
