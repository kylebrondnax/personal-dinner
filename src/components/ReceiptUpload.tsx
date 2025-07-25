'use client'

import { useState, useRef } from 'react'
import { Receipt } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/Toast'

// Dynamic import for heic2any (browser-only)
const convertHeicToJpeg = async (file: File): Promise<Blob> => {
  const heic2any = (await import('heic2any')).default
  return heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.8
  }) as Promise<Blob>
}

interface ReceiptUploadProps {
  onReceiptUpload: (receipt: Receipt) => void
  onReceiptParsed?: (ingredients: { name: string; cost: number }[]) => void
  className?: string
}

export function ReceiptUpload({
  onReceiptUpload,
  onReceiptParsed,
  className
}: ReceiptUploadProps) {
  const { showToast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Supported file types
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/heic',
      'image/heif'
    ]
    
    const isSupported = supportedTypes.includes(file.type) || 
                       file.name.toLowerCase().endsWith('.heic') || 
                       file.name.toLowerCase().endsWith('.heif')
    
    if (!isSupported) {
      showToast('Please upload a PDF, JPEG, PNG, or HEIC file', 'error')
      return
    }

    setIsUploading(true)
    setCurrentFile(file)
    
    try {
      let processedFile = file
      let processedFilename = file.name

      // Convert HEIC to JPEG if needed
      if (file.type === 'image/heic' || file.type === 'image/heif' || 
          file.name.toLowerCase().endsWith('.heic') || 
          file.name.toLowerCase().endsWith('.heif')) {
        
        const convertedBlob = await convertHeicToJpeg(file)
        processedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg'
        })
        processedFilename = file.name.replace(/\.heic$/i, '.jpg')
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string
          const receipt: Receipt = {
            filename: processedFilename,
            data: base64Data,
            uploadedAt: new Date()
          }

          onReceiptUpload(receipt)

          // TODO: Implement actual OCR parsing for images and PDF parsing
          // For now, we'll simulate parsing with a timeout
          setTimeout(() => {
            // Mock parsed data - in real implementation, this would come from OCR/PDF parsing
            const mockParsedIngredients = [
              { name: 'Parsed ingredient 1', cost: 12.99 },
              { name: 'Parsed ingredient 2', cost: 8.50 },
              { name: 'Parsed ingredient 3', cost: 15.25 }
            ]
            
            if (onReceiptParsed) {
              onReceiptParsed(mockParsedIngredients)
            }
            
            setIsUploading(false)
            setCurrentFile(null)
          }, 2000)

        } catch (error) {
          console.error('Error processing receipt:', error)
          setIsUploading(false)
          showToast('Error processing receipt. Please try again.', 'error')
        }
      }

      reader.readAsDataURL(processedFile)

    } catch (error) {
      console.error('Error converting HEIC file:', error)
      setIsUploading(false)
      showToast('Error converting HEIC file. Please try again or use a different format.', 'error')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900">Receipt Upload</h3>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-white',
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Processing Receipt...</h4>
              <p className="text-gray-600">
                {currentFile?.name.toLowerCase().includes('.heic') 
                  ? 'Converting HEIC and extracting cost information...'
                  : 'Extracting cost information from your receipt'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Upload Receipt</h4>
              <p className="text-gray-600">Drag and drop your receipt here, or click to browse</p>
              <p className="text-sm text-gray-500">Supports PDF, JPEG, PNG, and HEIC files</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <h4 className="font-medium mb-2">What happens after upload:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>HEIC images are automatically converted to JPEG</li>
          <li>Receipt is parsed for ingredient costs using OCR</li>
          <li>Extracted items are added to your actual costs</li>
          <li>You can review and edit the parsed information</li>
          <li>Payment amounts are updated based on actual costs</li>
        </ul>
      </div>
    </div>
  )
}