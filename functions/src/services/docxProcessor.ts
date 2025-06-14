
import * as mammoth from 'mammoth';
import { DocumentStructure, Section } from '../types/agent';

export interface ProcessingResult {
  textoExtraido: string;
  variaveis: string[];
  estruturas: Section[];
}

export class DocxProcessor {
  private sectionPatterns = [
    { pattern: /^(EMENTA|SÚMULA|SUMÁRIO)/i, name: 'Ementa', type: 'header' as const },
    { pattern: /^(RELATÓRIO|RELATORIO|FATOS|HISTÓRICO)/i, name: 'Relatório', type: 'body' as const },
    { pattern: /^(FUNDAMENT|VOTO|MÉRITO|RAZÕES|ANÁLISE)/i, name: 'Fundamentação', type: 'body' as const },
    { pattern: /^(DISPOSITIVO|DECISÃO|CONCLUSÃO|SENTENÇA)/i, name: 'Dispositivo', type: 'conclusion' as const },
    { pattern: /^(PEDIDO|REQUERIMENTO|PLEITO)/i, name: 'Pedido', type: 'body' as const },
    { pattern: /^(QUALIFICAÇÃO|PARTES|IDENTIFICAÇÃO)/i, name: 'Qualificação', type: 'header' as const },
    { pattern: /^(ANEXOS|DOCUMENTOS|PROVAS)/i, name: 'Anexos', type: 'conclusion' as const },
  ];

  private variablePatterns = [
    /\{\{([^}]+)\}\}/g,  // {{VARIAVEL}}
    /\{([^}]+)\}/g,      // {VARIAVEL}
    /\[([^\]]+)\]/g,     // [VARIAVEL]
  ];

  async processDocx(buffer: Buffer): Promise<ProcessingResult> {
    try {
      // Validar arquivo
      this.validateDocx(buffer);

      // Extrair texto do DOCX
      const result = await mammoth.extractRawText({ buffer });
      const textoExtraido = result.value;

      // Validar se o documento contém texto suficiente
      if (textoExtraido.trim().length < 50) {
        throw new Error('Documento muito pequeno ou sem conteúdo textual válido');
      }

      // Detectar estrutura do documento
      const estruturas = this.detectStructure(textoExtraido);
      
      // Detectar variáveis
      const variaveis = this.detectVariables(textoExtraido);

      return {
        textoExtraido,
        variaveis,
        estruturas
      };
    } catch (error) {
      console.error('Erro ao processar DOCX:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha ao processar arquivo DOCX');
    }
  }

  private validateDocx(buffer: Buffer): void {
    // Verificar tamanho do arquivo (máximo 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new Error('Arquivo muito grande. Máximo permitido: 50MB');
    }

    // Verificar se é um arquivo ZIP válido (DOCX é baseado em ZIP)
    const zipSignature = buffer.slice(0, 4);
    const validSignatures = [
      Buffer.from([0x50, 0x4B, 0x03, 0x04]), // PK..
      Buffer.from([0x50, 0x4B, 0x05, 0x06]), // PK..
      Buffer.from([0x50, 0x4B, 0x07, 0x08])  // PK..
    ];

    const isValidZip = validSignatures.some(sig => zipSignature.equals(sig));
    if (!isValidZip) {
      throw new Error('Arquivo não é um DOCX válido');
    }
  }

  private detectStructure(text: string): Section[] {
    const lines = text.split('\n').filter(line => line.trim());
    const sections: Section[] = [];
    let order = 0;

    // Detectar seções por padrões conhecidos
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Verificar padrões de seções jurídicas
      this.sectionPatterns.forEach(({ pattern, name, type }) => {
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

      // Detectar seções numeradas (1., 2., I., II., etc.)
      const numberedPattern = /^((\d+\.)|([IVX]+\.)|([a-z]\)))\s*(.+)$/i;
      const numberedMatch = trimmedLine.match(numberedPattern);
      if (numberedMatch && trimmedLine.length > 10) {
        const sectionTitle = numberedMatch[5] || trimmedLine;
        sections.push({
          name: sectionTitle,
          type: 'body' as const,
          required: false,
          order: order++,
          startLine: index,
          content: trimmedLine
        });
      }

      // Detectar títulos em caixa alta
      if (trimmedLine.length > 5 && 
          trimmedLine === trimmedLine.toUpperCase() && 
          /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/.test(trimmedLine)) {
        sections.push({
          name: trimmedLine,
          type: 'header' as const,
          required: false,
          order: order++,
          startLine: index,
          content: trimmedLine
        });
      }
    });

    // Se não encontrou seções específicas, criar estrutura padrão
    if (sections.length === 0) {
      return [
        { name: 'Introdução', type: 'header', required: true, order: 0 },
        { name: 'Desenvolvimento', type: 'body', required: true, order: 1 },
        { name: 'Conclusão', type: 'conclusion', required: true, order: 2 }
      ];
    }

    // Remover duplicatas e ordenar
    const uniqueSections = this.removeDuplicateSections(sections);
    return uniqueSections.sort((a, b) => a.order - b.order);
  }

  private removeDuplicateSections(sections: Section[]): Section[] {
    const seen = new Set<string>();
    return sections.filter(section => {
      const key = `${section.name.toLowerCase()}_${section.type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private detectVariables(text: string): string[] {
    const variables = new Set<string>();
    
    // Aplicar todos os padrões de variáveis
    this.variablePatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        const variable = match[1].trim().toUpperCase();
        
        // Filtrar variáveis válidas (apenas letras, números e underscore)
        if (/^[A-Z0-9_\s]+$/.test(variable) && variable.length > 1) {
          variables.add(variable);
        }
      }
    });

    // Categorizar variáveis por tipo
    const categorizedVariables = Array.from(variables).map(variable => {
      if (/DATA|DT_/.test(variable)) {
        return `${variable} (data)`;
      }
      if (/NOME|NM_/.test(variable)) {
        return `${variable} (nome)`;
      }
      if (/VALOR|VL_|PRECO/.test(variable)) {
        return `${variable} (valor)`;
      }
      return variable;
    });

    return categorizedVariables.sort();
  }

  generateMasterPrompt(estruturas: Section[], variaveis: string[], textoExtraido: string): string {
    const sectionsDescription = estruturas
      .map(s => `${s.order + 1}. ${s.name} (${s.type})`)
      .join('\n');

    const variablesDescription = variaveis.length > 0 
      ? `\nVariáveis identificadas: ${variaveis.join(', ')}`
      : '';

    const documentLength = textoExtraido.length;
    const estimatedPages = Math.ceil(documentLength / 2000);

    return `Você é um especialista jurídico brasileiro especializado na criação de documentos técnicos e precisos.

ANÁLISE DO DOCUMENTO MODELO:
- Extensão: ${documentLength} caracteres (aprox. ${estimatedPages} páginas)
- Seções identificadas: ${estruturas.length}
- Variáveis detectadas: ${variaveis.length}

ESTRUTURA OBRIGATÓRIA:
${sectionsDescription}

VARIÁVEIS PARA SUBSTITUIÇÃO:
${variablesDescription}

INSTRUÇÕES DE GERAÇÃO:
1. Mantenha EXATAMENTE a estrutura identificada
2. Use linguagem jurídica formal e técnica brasileira
3. Substitua todas as variáveis pelos valores fornecidos
4. Mantenha a formatação e estilo do documento original
5. Preserve numerações, marcadores e hierarquia de títulos
6. Adapte o conteúdo ao caso específico fornecido
7. Use fundamentação legal sólida e atualizada

MODELO ORIGINAL (para referência de estilo):
${textoExtraido.substring(0, 3000)}${textoExtraido.length > 3000 ? '...' : ''}

IMPORTANTE: O documento gerado deve seguir rigorosamente esta estrutura e manter a qualidade técnica do modelo original.`;
  }

  async processWithRetry(buffer: Buffer, maxRetries: number = 3): Promise<ProcessingResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentativa ${attempt} de ${maxRetries} para processar DOCX`);
        return await this.processDocx(buffer);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${attempt} falhou:`, error);
        
        // Não tentar novamente em erros de validação
        if (error instanceof Error && 
            (error.message.includes('muito grande') || 
             error.message.includes('não é um DOCX válido'))) {
          throw error;
        }
        
        // Aguardar antes da próxima tentativa
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError || new Error('Falha após múltiplas tentativas');
  }
}
