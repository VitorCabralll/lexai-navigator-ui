
export interface PipelineRequest {
  agentId: string;
  variaveis: Record<string, string>;
  documentos: DocumentoApoio[];
  instrucoes: string;
}

export interface DocumentoApoio {
  url: string;
  tipo: 'pdf' | 'docx' | 'texto';
  conteudo?: string;
  nome: string;
}

export interface PipelineResult {
  textoFinal: string;
  metadata: {
    tokensUsados: {
      etapa1: number;
      etapa2: number;
      etapa3: number;
      total: number;
    };
    tempoProcessamento: number;
    custoEstimado: number;
  };
}

export interface EtapaProcessamento {
  numero: number;
  nome: string;
  modelo: string;
  prompt: string;
  resultado: string;
  tokensUsados: number;
  tempoInicio: number;
  tempoFim: number;
}
