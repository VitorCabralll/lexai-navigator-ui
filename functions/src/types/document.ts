
export interface GenerationRequest {
  mode: 'agent' | 'prompt';
  agentId?: string;
  promptType?: string;
  supportDocuments: string[];
  instructions: string;
  templateFile?: string;
  strictMode: boolean;
  workspaceId: string;
}

export interface GenerationResponse {
  success: boolean;
  documentId: string;
  content: string;
  metadata: GenerationMetadata;
  sections: DocumentSection[];
}

export interface GenerationMetadata {
  generatedAt: FirebaseFirestore.Timestamp;
  tokensUsed: number;
  processingTime: number;
  steps: ProcessingStep[];
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  startTime: number;
  endTime?: number;
  result?: any;
}

export interface DocumentSection {
  title: string;
  content: string;
  type: string;
  order: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  agentId?: string;
  promptType?: string;
  workspaceId: string;
  userId: string;
  metadata: GenerationMetadata;
  status: 'draft' | 'final';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
