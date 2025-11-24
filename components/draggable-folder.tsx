'use client'

import { useState } from "react"
import Image from "next/image"

interface DraggableFolderProps {
  onDragStart?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
  isProcessing?: boolean
  isComplete?: boolean
  onReset?: () => void
}

export default function DraggableFolder({ 
  onDragStart, 
  onDragEnd, 
  isDragging = false,
  isProcessing = false,
  isComplete = false,
  onReset
}: DraggableFolderProps) {
  const [isHovering, setIsHovering] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'tax-returns-folder')
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.()
  }

  const handleDragEnd = () => {
    onDragEnd?.()
  }

  const handleClick = () => {
    // Alternative interaction for mobile/accessibility
    onDragStart?.()
    setTimeout(() => onDragEnd?.(), 100)
  }

  // Show different content based on demo state
  if (isProcessing || isComplete) {
    return (
      <div className="text-center">
        {isProcessing && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-lg text-gray-600">
              📊 Processing tax returns...
            </div>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {isComplete && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-lg text-green-600 font-medium">
              ✅ Analysis Complete!
            </div>
            <button
              onClick={onReset}
              className="text-blue-600 hover:text-blue-700 underline font-medium transition-colors"
            >
              ↻ Run demo again
            </button>
          </div>
        )}
      </div>
    )
  }

  // Default idle state with folder
  return (
    <div className="text-center">
      {/* Handwritten text and arrow above folder */}
      <div className="mb-6 relative flex items-center justify-center gap-2">
        <div className="text-2xl font-caveat text-gray-600 transform -rotate-2">
          3 Years Tax Returns
        </div>
        <Image 
          src="/arrow.svg" 
          alt="Arrow pointing to folder"
          width={32}
          height={32}
          className="transform rotate-12 opacity-70"
        />
      </div>
      
      {/* Slow pulsing ring around folder */}
      <div className="relative inline-block">
        <div 
          className={`
            absolute inset-0 rounded-2xl transition-all duration-1000
            ${!isDragging ? 'bg-blue-400 opacity-100' : 'opacity-0'}
          `} 
          style={{ 
            width: '120px', 
            height: '120px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) scale(0.8)',
            animation: !isDragging ? 'expandOut 2s ease-out infinite' : 'none'
          }} 
        />
        
        <div 
          className={`
            relative cursor-move select-none transition-all duration-300 ease-out
            ${isHovering && !isDragging ? 'transform scale-110' : ''}
            ${isDragging ? 'opacity-50 transform scale-95' : ''}
          `}
          draggable={true}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleClick}
          aria-label="Drag tax returns folder to dashboard or click to start demo"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          {/* macOS Folder */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <Image 
              src="/macos-folder.png" 
              alt="Tax returns folder"
              width={80}
              height={80}
              className={`
                transition-all duration-300 filter
                ${isHovering ? 'brightness-110 drop-shadow-lg' : ''}
                ${isDragging ? 'brightness-75' : ''}
              `}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}