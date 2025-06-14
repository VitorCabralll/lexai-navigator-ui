
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { History, GitBranch, Tag, Eye, RotateCcw, MessageSquare } from 'lucide-react'
import { DocumentVersion } from '@/types/version'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface VersionHistoryProps {
  documentId: string
  versions: DocumentVersion[]
  currentVersion: DocumentVersion
  onViewVersion: (version: DocumentVersion) => void
  onRestoreVersion: (version: DocumentVersion) => void
  onCompareVersions: (v1: DocumentVersion, v2: DocumentVersion) => void
}

export function VersionHistory({
  versions,
  currentVersion,
  onViewVersion,
  onRestoreVersion,
  onCompareVersions
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<DocumentVersion[]>([])

  const handleVersionSelect = (version: DocumentVersion) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(prev => prev.filter(v => v.id !== version.id))
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, version])
    } else {
      setSelectedVersions([version])
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompareVersions(selectedVersions[0], selectedVersions[1])
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Versões
        </CardTitle>
        {selectedVersions.length === 2 && (
          <Button onClick={handleCompare} size="sm" className="w-fit">
            <GitBranch className="h-4 w-4 mr-2" />
            Comparar Versões
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div key={version.id}>
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedVersions.includes(version)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handleVersionSelect(version)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        Versão {version.versionNumber}
                      </span>
                      {version.isCurrentVersion && (
                        <Badge variant="default" className="text-xs">
                          Atual
                        </Badge>
                      )}
                      {version.isMajorVersion && (
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                      {version.versionTag && (
                        <Badge variant="outline" className="text-xs">
                          {version.versionTag}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {format(new Date(version.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    
                    {version.comment && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {version.comment}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>{version.metadata.wordCount} palavras</span>
                      <span>{version.metadata.characterCount} caracteres</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewVersion(version)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {!version.isCurrentVersion && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRestoreVersion(version)
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {index < versions.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
