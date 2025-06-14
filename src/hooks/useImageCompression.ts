
import { useState } from 'react'

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false)

  const compressImage = async (
    file: File, 
    options: CompressionOptions = {}
  ): Promise<File> => {
    if (!file.type.startsWith('image/')) {
      return file
    }

    setIsCompressing(true)

    try {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        maxSizeKB = 500
      } = options

      return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const img = new Image()

        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })

                // Check if we need further compression
                if (compressedFile.size > maxSizeKB * 1024 && quality > 0.1) {
                  // Recursively compress with lower quality
                  compressImage(compressedFile, { ...options, quality: quality * 0.8 })
                    .then(resolve)
                } else {
                  resolve(compressedFile)
                }
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            quality
          )
        }

        img.src = URL.createObjectURL(file)
      })
    } finally {
      setIsCompressing(false)
    }
  }

  return {
    compressImage,
    isCompressing
  }
}
