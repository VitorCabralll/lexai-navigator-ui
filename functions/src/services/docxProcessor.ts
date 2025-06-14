
import * as mammoth from 'mammoth';
import { DocumentStructure, Section } from '../types/agent';

export class DocxProcessor {
  async processDocx(buffer: Buffer): Promise<{
    text: string;
    structure: DocumentStructure;
    variables: string[];
  }> {
    try {
      // Extrair texto do DOCX
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      // Detectar estrutura do documento
      const structure = this.detectStructure(text);
      
      // Detectar variáveis {{VARIAVEL}}
      const variables = this.detectVariables(text);

      return {
        text,
        structure,
        variables
      };
    } catch (error) {
      console.error('Erro ao processar DOCX:', error);
      throw new Error('Falha ao processar arquivo DOCX');
    }
  }

  private detectStructure(text: string): DocumentStructure {
    const lines = text.split('\n').filter(line => line.trim());
    const sections: Section[] = [];
    let order = 0;

    // Padrões comuns de estrutura jurídica
    const sectionPatterns = [
      { pattern: /^(EMENTA|SÚMULA)/i, name: 'Ementa', type: 'header' as const },
      { pattern: /^(RELATÓRIO|RELATORIO|FATOS)/i, name: 'Relatório', type: 'body' as const },
      { pattern: /^(FUNDAMENT|VOTO|MÉRITO)/i, name: 'Fundamentação', type: 'body' as const },
      { pattern: /^(DISPOSITIVO|DECISÃO|CONCLUSÃO)/i, name: 'Dispositivo', type: 'conclusion' as const },
    ];

    lines.forEach(line => {
      sectionPatterns.forEach(({ pattern, name, type }) => {
        if (pattern.test(line.trim())) {
          sections.push({
            name,
            type,
            required: true,
            order: order++
          });
        }
      });
    });

    // Se não encontrou seções específicas, criar estrutura padrão
    if (sections.length === 0) {
      sections.push(
        { name: 'Introdução', type: 'header', required: true, order: 0 },
        { name: 'Desenvolvimento', type: 'body', required: true, order: 1 },
        { name: 'Conclusão', type: 'conclusion', required: true, order: 2 }
      );
    }

    return {
      sections,
      style: {
        font: 'Times New Roman',
        fontSize: 12,
        spacing: 1.5,
        margins: { top: 2.5, bottom: 2.5, left: 3, right: 2 }
      }
    };
  }

  private detectVariables(text: string): string[] {
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variablePattern.exec(text)) !== null) {
      const variable = match[1].trim().toUpperCase();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }

  generateMasterPrompt(structure: DocumentStructure, variables: string[], originalText: string): string {
    const sectionsDescription = structure.sections
      .map(s => `${s.order + 1}. ${s.name} (${s.type})`)
      .join('\n');

    const variablesDescription = variables.length > 0 
      ? `\nVariáveis identificadas: ${variables.join(', ')}`
      : '';

    return `Você é um especialista jurídico brasileiro. Gere documentos seguindo esta estrutura:

ESTRUTURA DO DOCUMENTO:
${sectionsDescription}

ESTILO:
- Fonte: ${structure.style.font}
- Tamanho: ${structure.style.fontSize}pt
- Espaçamento: ${structure.style.spacing}

${variablesDescription}

MODELO ORIGINAL (para referência de estilo e estrutura):
${originalText.substring(0, 2000)}...

Instruções:
1. Mantenha a estrutura exata identificada
2. Use linguagem jurídica formal e técnica
3. Substitua variáveis conforme fornecido
4. Adapte o conteúdo ao caso específico fornecido
5. Mantenha consistência com o estilo do modelo original`;
  }
}
