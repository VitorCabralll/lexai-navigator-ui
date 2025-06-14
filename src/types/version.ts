
export interface DocumentVersion {
  id: string
  documentId: string
  versionNumber: number
  title: string
  content: string
  isCurrentVersion: boolean
  isMajorVersion: boolean
  versionTag?: string
  comment?: string
  createdAt: string
  createdBy: string
  changes?: VersionChange[]
  metadata: {
    wordCount: number
    characterCount: number
    lastModified: string
  }
}

export interface VersionChange {
  type: 'addition' | 'deletion' | 'modification'
  content: string
  position: {
    start: number
    end: number
  }
}

export interface VersionCompare {
  originalVersion: DocumentVersion
  comparedVersion: DocumentVersion
  differences: VersionChange[]
  summary: {
    additions: number
    deletions: number
    modifications: number
  }
}
