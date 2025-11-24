'use client'

import { useState, useRef } from "react"
import { toast } from "sonner"
import DraggableFolder from "./draggable-folder"
import SampleAnalysis from "./sample-analysis"

type DemoState = 'idle' | 'dragging' | 'uploading' | 'complete'

export default function DemoDisplay() {
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showInternalToast, setShowInternalToast] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragStart = () => {
    setDemoState('dragging')
  }

  const handleDragEnd = () => {
    if (demoState === 'dragging') {
      setDemoState('idle')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Only set dragOver to false if we're actually leaving the drop zone
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const simulateUpload = async (): Promise<void> => {
    return new Promise((resolve) => {
      const uploadDuration = 3000 // 3 seconds total
      const steps = 60
      const stepDelay = uploadDuration / steps

      let currentProgress = 0
      const progressInterval = setInterval(() => {
        currentProgress += 100 / steps
        
        setUploadProgress(Math.min(currentProgress, 100))

        if (currentProgress >= 100) {
          clearInterval(progressInterval)
          resolve()
        }
      }, stepDelay)
    })
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setDemoState('uploading')

    // Reset progress and show internal toast
    setUploadProgress(0)
    setShowInternalToast(true)
    
    // Hide toast after a moment
    setTimeout(() => setShowInternalToast(false), 2000)

    try {
      // Simulate upload
      await simulateUpload()
      
      setDemoState('complete')

    } catch (error) {
      console.error('Upload simulation error:', error)
      setDemoState('idle')
    }
  }

  // Alternative click-based interaction for accessibility/mobile
  const handleFolderClick = () => {
    if (demoState === 'idle') {
      handleDrop(new DragEvent('drop') as any)
    }
  }

  // Reset demo function
  const resetDemo = () => {
    setDemoState('idle')
    setUploadProgress(0)
    setShowInternalToast(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Centered Layout */}
      <div className="space-y-8">
        
        {/* Centered Folder */}
        <div 
          className="flex flex-col items-center justify-center"
          onClick={handleFolderClick}
        >
          <DraggableFolder 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isDragging={demoState === 'dragging'}
            isProcessing={demoState === 'uploading'}
            isComplete={demoState === 'complete'}
            onReset={resetDemo}
          />
        </div>

        {/* Centered Sample Analysis Dashboard */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            transition-all duration-300 ease-out relative
            ${isDragOver ? 'scale-105 shadow-2xl' : ''}
          `}
        >
          {/* Internal toast notification */}
          {showInternalToast && (
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-20 animate-[fadeInUp_0.3s_ease-out] font-medium">
              📤 Processing tax returns...
            </div>
          )}
          
          {/* Drop zone indicator overlay */}
          {isDragOver && (
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl border-2 border-blue-400 border-dashed z-10 flex items-center justify-center">
                <div className="text-center animate-pulse">
                  <div className="text-blue-600 font-semibold text-xl mb-2">
                    📊 Drop here to generate analysis
                  </div>
                  <div className="text-blue-500">
                    Release to start processing
                  </div>
                </div>
              </div>
            </div>
          )}

          <SampleAnalysis 
            isProcessing={demoState === 'uploading'}
            isComplete={demoState === 'complete'}
            uploadProgress={uploadProgress}
          />
        </div>
      </div>
    </div>
  )
}