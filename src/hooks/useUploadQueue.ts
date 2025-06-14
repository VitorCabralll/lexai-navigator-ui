
import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/enhanced-toast'

export interface UploadTask {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  result?: any
}

const MAX_CONCURRENT_UPLOADS = 3
const UPLOAD_RATE_LIMIT = 5 // uploads per minute

export function useUploadQueue() {
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [recentUploads, setRecentUploads] = useState<number[]>([])

  const checkRateLimit = useCallback(() => {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentCount = recentUploads.filter(time => time > oneMinuteAgo).length
    
    if (recentCount >= UPLOAD_RATE_LIMIT) {
      toast.warning({
        title: 'Limite de uploads atingido',
        description: `Aguarde um momento antes de fazer mais uploads. Limite: ${UPLOAD_RATE_LIMIT} por minuto.`
      })
      return false
    }
    return true
  }, [recentUploads])

  const addToQueue = useCallback((files: File[]) => {
    if (!checkRateLimit()) return

    const newTasks: UploadTask[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }))

    setUploadQueue(prev => [...prev, ...newTasks])
    processQueue()
  }, [checkRateLimit])

  const processQueue = useCallback(async () => {
    if (isProcessing) return
    setIsProcessing(true)

    const pendingTasks = uploadQueue.filter(task => task.status === 'pending')
    const activeTasks = uploadQueue.filter(task => task.status === 'uploading')

    if (pendingTasks.length === 0 || activeTasks.length >= MAX_CONCURRENT_UPLOADS) {
      setIsProcessing(false)
      return
    }

    const tasksToProcess = pendingTasks.slice(0, MAX_CONCURRENT_UPLOADS - activeTasks.length)

    for (const task of tasksToProcess) {
      processUpload(task)
    }

    setIsProcessing(false)
  }, [uploadQueue, isProcessing])

  const processUpload = async (task: UploadTask) => {
    setUploadQueue(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'uploading' } : t
    ))

    try {
      // Simulate upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadQueue(prev => prev.map(t => 
          t.id === task.id ? { ...t, progress } : t
        ))
      }

      // Add to recent uploads for rate limiting
      setRecentUploads(prev => [...prev, Date.now()])

      setUploadQueue(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
      ))

      toast.success({
        title: 'Upload concluído',
        description: `${task.file.name} foi enviado com sucesso.`
      })

    } catch (error) {
      setUploadQueue(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        } : t
      ))

      toast.error({
        title: 'Erro no upload',
        description: `Falha ao enviar ${task.file.name}. Tente novamente.`
      })
    }
  }

  const removeFromQueue = useCallback((taskId: string) => {
    setUploadQueue(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const clearCompleted = useCallback(() => {
    setUploadQueue(prev => prev.filter(t => t.status !== 'completed'))
  }, [])

  return {
    uploadQueue,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    isProcessing
  }
}
