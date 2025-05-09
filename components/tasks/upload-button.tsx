"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { uploadTaskFile } from "@/utils/upload-task-file"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface UploadButtonProps {
  taskId: string
  businessId: string
  disabled?: boolean
  onSuccess?: (fileId: string) => void
}

export function UploadButton({ taskId, businessId, disabled = false, onSuccess }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const uploadLockRef = useRef(false) // Use ref for upload locking to prevent race conditions
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      console.warn("[UploadButton] No file selected")
      return
    }

    // Prevent multiple simultaneous uploads
    if (uploadLockRef.current) {
      console.log("[UploadButton] Upload already in progress, ignoring")
      return
    }

    uploadLockRef.current = true
    setIsUploading(true)
    setUploadStatus("uploading")

    try {
      console.log("[UploadButton] Selected file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      })

      const result = await uploadTaskFile(file, taskId, businessId)

      setUploadStatus("success")
      toast({
        variant: "success",
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      })

      // Call the onSuccess callback if provided
      if (onSuccess && result.fileRecord?.id) {
        onSuccess(result.fileRecord.id)
      }

      // Reset the file input
      if (event.target) {
        event.target.value = ""
      }
    } catch (error) {
      console.error("[UploadButton] Upload failed:", error)
      setUploadStatus("error")

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsUploading(false)
      uploadLockRef.current = false // Release the upload lock

      // Reset status after a delay
      setTimeout(() => {
        setUploadStatus("idle")
      }, 3000)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => document.getElementById(`file-upload-${taskId}`).click()}
        disabled={isUploading || disabled || uploadLockRef.current}
        className={cn(
          "h-8 transition-colors",
          uploadStatus === "success" &&
            "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800",
          uploadStatus === "error" && "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800",
        )}
      >
        {uploadStatus === "uploading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : uploadStatus === "success" ? (
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
        ) : uploadStatus === "error" ? (
          <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
        ) : (
          <Upload className="h-3.5 w-3.5 mr-1.5" />
        )}
        {uploadStatus === "uploading"
          ? "Uploading..."
          : uploadStatus === "success"
            ? "Uploaded"
            : uploadStatus === "error"
              ? "Failed"
              : "Upload File"}
      </Button>
      <input
        id={`file-upload-${taskId}`}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        disabled={isUploading || uploadLockRef.current}
      />
    </>
  )
}
