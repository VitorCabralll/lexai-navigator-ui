
export interface Agent {
  id: string;
  name: string;
  type: string;
  theme: string;
  workspaceId: string;
  masterPrompt?: string;
  isOfficial: boolean;
  documentTemplate?: TemplateRef;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface TemplateRef {
  fileUrl: string;
  fileName: string;
  structure: DocumentStructure;
  variables: string[];
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
