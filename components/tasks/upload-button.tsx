"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { uploadTaskFile } from "@/utils/upload-task-file"
import { useToast } from "@/hooks/use-toast"

interface UploadButtonProps {
  taskId: string
  businessId: string
  disabled?: boolean
}

export function UploadButton({ taskId, businessId, disabled = false }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      console.warn("[UploadButton] No file selected")
      return
    }

    setIsUploading(true)

    try {
      console.log("[UploadButton] Selected file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      })

      await uploadTaskFile(file, taskId, businessId)

      toast({
        variant: "success",
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      })

      // Reset the file input
      if (event.target) {
        event.target.value = ""
      }
    } catch (error) {
      console.error("[UploadButton] Upload failed:", error)

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => document.getElementById(`file-upload-${taskId}`).click()}
        disabled={isUploading || disabled}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>
      <input
        id={`file-upload-${taskId}`}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      />
    </>
  )
}
