"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FileText, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskUploadsProps {
  taskId: string
  businessId: string
}

interface UploadedFile {
  id: string
  filename: string
  file_url: string
  created_at: string
  status: string
}

export function TaskUploads({ taskId, businessId }: TaskUploadsProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchFiles()
  }, [taskId, businessId])

  const fetchFiles = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("uploaded_files")
        .select("id, filename, file_url, created_at, status")
        .eq("task_id", taskId)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[TaskUploads] Error fetching files:", error)
        return
      }

      setFiles(data || [])
    } catch (err) {
      console.error("[TaskUploads] Unexpected error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin mr-2" />
        Loading files...
      </div>
    )
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="mt-3">
      <h5 className="text-xs font-medium mb-2">Uploaded Files</h5>
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-xs">
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-2 text-blue-500" />
              <span className="truncate max-w-[150px]">{file.filename}</span>
            </div>
            {file.file_url && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => window.open(file.file_url, "_blank")}
                title="View file"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
