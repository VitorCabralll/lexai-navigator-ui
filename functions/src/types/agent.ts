
export interface Agent {
  id: string;
  name: string;
  description: string;
  theme: string;
  workspaceId: string;
  masterPrompt?: string;
  documentTemplate?: DocumentTemplate;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy: string;
}

export interface DocumentTemplate {
  fileUrl: string;
  fileName: string;
  structure: DocumentStructure;
  variables: string[];
  metadata?: {
    textLength: number;
    sectionsFound: number;
    variablesFound: number;
  };
}

export interface DocumentStructure {
  sections: Section[];
  style: DocumentStyle;
}

export interface Section {
  name: string;
  type: 'header' | 'body' | 'conclusion';
  required: boolean;
  order: number;
  startLine?: number;
  content?: string;
}

export interface DocumentStyle {
  font: string;
  fontSize: number;
  spacing: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ProcessingMetadata {
  textLength: number;
  sectionsFound: number;
  variablesFound: number;
  processingTime: number;
  fileSize?: number;
  fileName?: string;
}
