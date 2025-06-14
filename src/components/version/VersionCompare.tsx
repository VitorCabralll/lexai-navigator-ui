
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GitBranch, Plus, Minus, Edit } from 'lucide-react'
import { VersionCompare as VersionCompareType, DocumentVersion } from '@/types/version'

interface VersionCompareProps {
  comparison: VersionCompareType
  onClose: () => void
}

export function VersionCompare({ comparison }: VersionCompareProps) {
  const { originalVersion, comparedVersion, differences, summary } = comparison

  const renderDifferences = () => {
    return differences.map((diff, index) => (
      <div key={index} className={`p-3 rounded-lg border ${
        diff.type === 'addition' ? 'border-green-200 bg-green-50' :
        diff.type === 'deletion' ? 'border-red-200 bg-red-50' :
        'border-yellow-200 bg-yellow-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {diff.type === 'addition' && <Plus className="h-4 w-4 text-green-600" />}
          {diff.type === 'deletion' && <Minus className="h-4 w-4 text-red-600" />}
          {diff.type === 'modification' && <Edit className="h-4 w-4 text-yellow-600" />}
          <span className="text-sm font-medium capitalize">
            {diff.type === 'addition' ? 'Adição' :
             diff.type === 'deletion' ? 'Remoção' : 'Modificação'}
          </span>
        </div>
        <p className="text-sm font-mono bg-white p-2 rounded border">
          {diff.content}
        </p>
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Comparação de Versões
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Versão {originalVersion.versionNumber} → Versão {comparedVersion.versionNumber}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.additions}</div>
              <div className="text-sm text-muted-foreground">Adições</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.deletions}</div>
              <div className="text-sm text-muted-foreground">Remoções</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.modifications}</div>
              <div className="text-sm text-muted-foreground">Modificações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diferenças Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {differences.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma diferença encontrada entre as versões.
                </p>
              ) : (
                renderDifferences()
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Versão {originalVersion.versionNumber}</CardTitle>
              <Badge variant="outline">Original</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded">
                {originalVersion.content}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Versão {comparedVersion.versionNumber}</CardTitle>
              <Badge variant="outline">Comparada</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded">
                {comparedVersion.content}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
