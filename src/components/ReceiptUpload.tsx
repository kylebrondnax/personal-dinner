'use client'

import { useState, useRef } from 'react'
import { Receipt } from '@/types'
import { cn } from '@/lib/utils'

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
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setIsUploading(true)
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result as string
        const receipt: Receipt = {
          filename: file.name,
          data: base64Data,
          uploadedAt: new Date()
        }

        onReceiptUpload(receipt)

        // TODO: Implement actual PDF parsing
        // For now, we'll simulate parsing with a timeout
        setTimeout(() => {
          // Mock parsed data - in real implementation, this would come from PDF parsing
          const mockParsedIngredients = [
            { name: 'Parsed ingredient 1', cost: 12.99 },
            { name: 'Parsed ingredient 2', cost: 8.50 },
            { name: 'Parsed ingredient 3', cost: 15.25 }
          ]
          
          if (onReceiptParsed) {
            onReceiptParsed(mockParsedIngredients)
          }
          
          setIsUploading(false)
        }, 2000)

      } catch (error) {
        console.error('Error processing receipt:', error)
        setIsUploading(false)
        alert('Error processing receipt. Please try again.')
      }
    }

    reader.readAsDataURL(file)
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
          accept=".pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Processing Receipt...</h4>
              <p className="text-gray-600">Extracting cost information from your receipt</p>
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
              <p className="text-gray-600">Drag and drop your PDF receipt here, or click to browse</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <h4 className="font-medium mb-2">What happens after upload:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Receipt is automatically parsed for ingredient costs</li>
          <li>Extracted items are added to your actual costs</li>
          <li>You can review and edit the parsed information</li>
          <li>Payment amounts are updated based on actual costs</li>
        </ul>
      </div>
    </div>
  )
}