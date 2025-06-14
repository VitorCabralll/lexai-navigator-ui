
import * as admin from 'firebase-admin';

export class DocumentProcessor {
  async processarDocumentos(documentos: Array<{url: string, tipo: 'pdf' | 'docx' | 'texto', nome: string}>): Promise<string[]> {
    const resumos: string[] = [];
    
    for (const doc of documentos) {
      try {
        let conteudo = '';
        
        if (doc.tipo === 'texto') {
          // Se for texto, pode estar na URL ou já processado
          conteudo = await this.extrairTextoDeUrl(doc.url);
        } else if (doc.tipo === 'pdf') {
          conteudo = await this.extrairTextoDePdf(doc.url);
        } else if (doc.tipo === 'docx') {
          conteudo = await this.extrairTextoDeDocx(doc.url);
        }
        
        // Resumir documento para otimizar tokens
        const resumo = await this.resumirTexto(conteudo, doc.nome);
        resumos.push(resumo);
        
      } catch (error) {
        console.error(`Erro ao processar documento ${doc.nome}:`, error);
        resumos.push(`Erro ao processar: ${doc.nome}`);
      }
    }
    
    return resumos;
  }

  private async extrairTextoDeUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      throw new Error(`Erro ao baixar texto de ${url}`);
    }
  }

  private async extrairTextoDePdf(url: string): Promise<string> {
    // Placeholder - em produção, usar biblioteca como pdf-parse
    console.log('PDF processing não implementado ainda:', url);
    return 'Conteúdo PDF extraído (placeholder)';
  }

  private async extrairTextoDeDocx(url: string): Promise<string> {
    // Placeholder - reutilizar mammoth do DocxProcessor
    console.log('DOCX processing não implementado ainda:', url);
    return 'Conteúdo DOCX extraído (placeholder)';
  }

  private async resumirTexto(texto: string, nomeArquivo: string): Promise<string> {
    // Resumir para máximo 500 caracteres para otimizar tokens
    if (texto.length <= 500) {
      return `${nomeArquivo}: ${texto}`;
    }
    
    const resumo = texto.substring(0, 400) + '...';
    return `${nomeArquivo}: ${resumo}`;
  }
}
