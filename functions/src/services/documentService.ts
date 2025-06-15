import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/v2/logger';
import { Document } from '../types/document';
import { StorageService } from './storageService';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface SalvarDocumentoRequest {
  uid: string;
  workspaceId: string;
  textoGerado: string;
  tipo: 'agent' | 'prompt';
  metadata?: {
    agentId?: string;
    promptId?: string;
    tokensUsados?: number;
    tempoProcessamento?: number;
    instrucoes?: string;
  };
}

export interface SalvarDocumentoResponse {
  documentId: string;
  document: Document;
}

export interface ExportarDocumentoResponse {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  formato: 'docx' | 'pdf';
  expiresAt: string;
  fileSize: number;
}

export class DocumentService {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
  }

  async exportarDocumento(
    documentoId: string,
    formato: 'docx' | 'pdf',
    uid: string
  ): Promise<ExportarDocumentoResponse> {
    try {
      // 1. Validar formato
      if (formato !== 'docx' && formato !== 'pdf') {
        throw new Error('Formato deve ser "docx" ou "pdf"');
      }

      // 2. Buscar documento e validar acesso
      const documento = await this.buscarDocumentoPorId(documentoId, uid);
      if (!documento) {
        throw new Error('Documento não encontrado');
      }

      // 3. Gerar nome do arquivo
      const timestamp = Date.now();
      const nomeArquivo = this.sanitizeFileName(`${documento.title}_${timestamp}.${formato}`);

      // 4. Gerar arquivo baseado no formato
      let buffer: Buffer;
      if (formato === 'docx') {
        buffer = await this.gerarDocx(documento.content, documento.title);
      } else {
        buffer = await this.gerarPdf(documento.content, documento.title);
      }

      // 5. Salvar no Firebase Storage
      const filePath = await this.storageService.uploadFile(
        buffer,
        nomeArquivo,
        documento.workspaceId,
        'generated'
      );

      // 6. Gerar URL temporária (1 hora)
      const downloadUrl = await this.storageService.getSignedUrl(
        filePath.replace(`gs://${process.env.FIREBASE_STORAGE_BUCKET || 'lexai-default.appspot.com'}/`, ''),
        3600 // 1 hora
      );

      // 7. Calcular data de expiração
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

      logger.info(`Documento exportado:`, {
        documentoId,
        formato,
        fileName: nomeArquivo,
        fileSize: buffer.length,
        userId: uid
      });

      return {
        success: true,
        downloadUrl,
        fileName: nomeArquivo,
        formato,
        expiresAt,
        fileSize: buffer.length
      };

    } catch (error) {
      logger.error('Erro ao exportar documento:', { error: error instanceof Error ? error.toString() : error, documentoId, formato, userId: uid });
      throw error;
    }
  }

  private async gerarDocx(content: string, title: string): Promise<Buffer> {
    try {
      // Dividir conteúdo em parágrafos
      const paragrafos = content.split('\n').filter(linha => linha.trim());

      // Criar documento DOCX
      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: [
            // Título
            new Paragraph({
              children: [new TextRun({
                text: title,
                bold: true,
                size: 28
              })],
              spacing: { after: 400 }
            }),
            // Conteúdo
            ...paragrafos.map(paragrafo => 
              new Paragraph({
                children: [new TextRun({
                  text: paragrafo || ' ',
                  size: 24
                })],
                spacing: { after: 200 }
              })
            )
          ]
        }]
      });

      return await Packer.toBuffer(doc);
    } catch (error) {
      logger.error('Erro ao gerar DOCX:', { error: error instanceof Error ? error.toString() : error, title });
      throw new Error('Falha ao gerar arquivo DOCX');
    }
  }

  private async gerarPdf(content: string, title: string): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      const fontSize = 12;
      const titleFontSize = 16;
      const lineHeight = fontSize + 4;
      const margin = 50;
      let yPosition = height - margin;

      // Adicionar título
      page.drawText(title, {
        x: margin,
        y: yPosition,
        size: titleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= titleFontSize + 20;

      // Dividir conteúdo em linhas
      const linhas = content.split('\n');
      const maxWidth = width - (margin * 2);
      const maxCharsPerLine = Math.floor(maxWidth / (fontSize * 0.6));

      for (const linha of linhas) {
        if (!linha.trim()) {
          yPosition -= lineHeight / 2;
          continue;
        }

        // Quebrar linha longa em múltiplas linhas
        const palavras = linha.split(' ');
        let linhaAtual = '';

        for (const palavra of palavras) {
          const linhaComPalavra = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;
          
          if (linhaComPalavra.length <= maxCharsPerLine) {
            linhaAtual = linhaComPalavra;
          } else {
            // Desenhar linha atual e começar nova linha
            if (yPosition < margin + lineHeight) {
              page = pdfDoc.addPage();
              yPosition = height - margin;
            }

            page.drawText(linhaAtual, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0)
            });
            yPosition -= lineHeight;
          }
        }

        // Desenhar última linha
        if (linhaAtual) {
          if (yPosition < margin + lineHeight) {
            page = pdfDoc.addPage();
            yPosition = height - margin;
          }

          page.drawText(linhaAtual, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
          yPosition -= lineHeight;
        }
      }

      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      logger.error('Erro ao gerar PDF:', { error: error instanceof Error ? error.toString() : error, title });
      throw new Error('Falha ao gerar arquivo PDF');
    }
  }

  private sanitizeFileName(fileName: string): string {
    // Remover caracteres especiais e substituir espaços
    return fileName
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  async salvarDocumentoFinal(
    uid: string,
    workspaceId: string,
    textoGerado: string,
    tipo: 'agent' | 'prompt',
    metadata?: {
      agentId?: string;
      promptId?: string;
      tokensUsados?: number;
      tempoProcessamento?: number;
      instrucoes?: string;
    }
  ): Promise<SalvarDocumentoResponse> {
    
    try {
      // 1. Validações básicas
      if (!uid || !workspaceId || !textoGerado.trim()) {
        throw new Error('Parâmetros obrigatórios não fornecidos');
      }

      if (tipo !== 'agent' && tipo !== 'prompt') {
        throw new Error('Tipo deve ser "agent" ou "prompt"');
      }

      // 2. Verificar se workspace existe e usuário tem acesso
      await this.validarAcessoWorkspace(uid, workspaceId);

      // 3. Validar metadados baseado no tipo
      this.validarMetadados(tipo, metadata);

      // 4. Gerar ID único para o documento
      const documentRef = admin.firestore().collection('documents').doc();
      const documentId = documentRef.id;

      // 5. Extrair título do texto gerado
      const titulo = this.extrairTitulo(textoGerado);

      // 6. Estruturar documento
      const documento: Document = {
        id: documentId,
        title: titulo,
        content: textoGerado,
        agentId: metadata?.agentId || null,
        promptType: metadata?.promptId || null,
        workspaceId,
        userId: uid,
        metadata: {
          generatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
          tokensUsed: metadata?.tokensUsados || 0,
          processingTime: metadata?.tempoProcessamento || 0,
          steps: []
        },
        status: 'final',
        createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
      };

      // 7. Salvar no Firestore
      await documentRef.set(documento);

      // 8. Log de auditoria
      logger.info(`Documento salvo: ${documentId}`, {
        userId: uid,
        workspaceId,
        tipo,
        tokensUsados: metadata?.tokensUsados || 0,
        tempoProcessamento: metadata?.tempoProcessamento || 0
      });

      return {
        documentId,
        document: documento
      };

    } catch (error) {
      logger.error('Erro ao salvar documento:', { error: error instanceof Error ? error.toString() : error, userId: uid, workspaceId, tipo });
      throw error;
    }
  }

  private async validarAcessoWorkspace(uid: string, workspaceId: string): Promise<void> {
    const workspaceRef = admin.firestore().collection('workspaces').doc(workspaceId);
    const workspaceDoc = await workspaceRef.get();
    
    if (!workspaceDoc.exists) {
      throw new Error('Workspace não encontrado');
    }

    const workspace = workspaceDoc.data();
    const temAcesso = workspace?.ownerId === uid || workspace?.members?.includes(uid);
    
    if (!temAcesso) {
      throw new Error('Acesso negado ao workspace');
    }
  }

  private validarMetadados(
    tipo: 'agent' | 'prompt', 
    metadata?: { agentId?: string; promptId?: string; }
  ): void {
    if (tipo === 'agent' && !metadata?.agentId) {
      throw new Error('agentId é obrigatório para tipo "agent"');
    }
    
    if (tipo === 'prompt' && !metadata?.promptId) {
      throw new Error('promptId é obrigatório para tipo "prompt"');
    }
  }

  private extrairTitulo(textoGerado: string): string {
    const linhas = textoGerado.split('\n').filter(linha => linha.trim());
    
    if (linhas.length > 0) {
      const primeiraLinha = linhas[0].trim();
      
      // Verificar se é uma linha significativa para título
      if (primeiraLinha.length > 5 && primeiraLinha.length < 100) {
        // Remover formatação Markdown se houver
        return primeiraLinha.replace(/^#+\s*/, '').replace(/^\*+\s*/, '');
      }
    }
    
    // Título padrão baseado na data
    return `Documento - ${new Date().toLocaleDateString('pt-BR')}`;
  }

  async buscarDocumentoPorId(documentId: string, uid: string): Promise<Document | null> {
    try {
      const docRef = admin.firestore().collection('documents').doc(documentId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        return null;
      }
      
      const documento = docSnap.data() as Document;
      
      // Verificar se usuário tem acesso
      if (documento.userId !== uid) {
        // Verificar acesso via workspace
        await this.validarAcessoWorkspace(uid, documento.workspaceId);
      }
      
      return documento;
      
    } catch (error) {
      logger.error('Erro ao buscar documento:', { error: error instanceof Error ? error.toString() : error, documentId, userId: uid });
      throw error;
    }
  }

  async listarDocumentosUsuario(
    uid: string, 
    workspaceId?: string,
    limite: number = 50
  ): Promise<Document[]> {
    try {
      let query = admin.firestore()
        .collection('documents')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limite);

      if (workspaceId) {
        query = query.where('workspaceId', '==', workspaceId);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => doc.data() as Document);
      
    } catch (error) {
      logger.error('Erro ao listar documentos:', { error: error instanceof Error ? error.toString() : error, userId: uid, workspaceId });
      throw error;
    }
  }
}
