"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FileText, ExternalLink, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskUploadsProps {
  taskId: string
  businessId: string
  refreshTrigger?: number // Optional prop to trigger refresh
}

interface UploadedFile {
  id: string
  filename: string
  file_url?: string | null
  file_path?: string | null
  created_at: string
  status: string
}

export function TaskUploads({ taskId, businessId, refreshTrigger = 0 }: TaskUploadsProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Function to regenerate URLs if needed
  const regenerateFileUrl = useCallback(
    (filePath: string | null): string | null => {
      if (!filePath) return null
      try {
        const { data } = supabase.storage.from("task-documents").getPublicUrl(filePath)
        return data?.publicUrl || null
      } catch (err) {
        console.error("[TaskUploads] Error generating URL:", err)
        return null
      }
    },
    [supabase],
  )

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  // Fetch files with proper cleanup, delay and retry logic
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null
    let retryCount = 0
    const maxRetries = 3

    const fetchFiles = async () => {
      try {
        if (!isMounted) return

        setIsLoading(true)
        setFetchError(null)

        console.log("[TaskUploads] Fetching files for task:", taskId, "business:", businessId)

        const { data, error } = await supabase
          .from("uploaded_files")
          .select("id, filename, file_url, file_path, created_at, status")
          .eq("task_id", taskId)
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[TaskUploads] Error fetching files:", error)
          setFetchError(error.message)

          // Retry logic with exponential backoff
          if (retryCount < maxRetries) {
            retryCount++
            const delay = Math.pow(2, retryCount) * 500 // 1s, 2s, 4s
            console.log(`[TaskUploads] Retrying fetch (${retryCount}/${maxRetries}) in ${delay}ms`)
            timeoutId = setTimeout(fetchFiles, delay)
            return
          }

          if (isMounted) {
            setIsLoading(false)
          }
          return
        }

        console.log("[TaskUploads] Fetched files:", data?.length || 0, data)

        // Process files to ensure URLs are valid
        const processedFiles =
          data?.map((file) => {
            // If file_url is missing but file_path exists, regenerate the URL
            if (!file.file_url && file.file_path) {
              const regeneratedUrl = regenerateFileUrl(file.file_path)
              console.log("[TaskUploads] Regenerated URL for file:", file.filename, regeneratedUrl)
              return { ...file, file_url: regeneratedUrl }
            }
            return file
          }) || []

        if (isMounted) {
          setFiles(processedFiles)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("[TaskUploads] Unexpected error:", err)
        if (isMounted) {
          setFetchError(err instanceof Error ? err.message : "Failed to load files")
          setIsLoading(false)
        }
      }
    }

    // Add a small delay before fetching to allow for database consistency
    timeoutId = setTimeout(fetchFiles, 300)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [taskId, businessId, supabase, refreshTrigger, regenerateFileUrl])

  // Log the files being rendered
  useEffect(() => {
    console.log("[TaskUploads] Rendering files:", files)
  }, [files])

  if (isLoading) {
    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1.5">
        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
        Loading files...
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex items-center text-xs text-red-500 mt-1.5">
        <AlertCircle className="h-3 w-3 mr-1.5" />
        Error loading files
      </div>
    )
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center text-xs bg-muted/40 hover:bg-muted/60 transition-colors rounded-md px-2 py-1 max-w-full"
        >
          {file.status === "processed" ? (
            <CheckCircle className="h-3 w-3 mr-1.5 text-green-500 flex-shrink-0" />
          ) : (
            <FileText className="h-3 w-3 mr-1.5 text-blue-500 flex-shrink-0" />
          )}

          <span className="truncate max-w-[120px]" title={file.filename}>
            {file.filename}
          </span>

          <span className="mx-1.5 text-muted-foreground text-[10px]">{formatDate(file.created_at)}</span>

          <TooltipProvider>
            {file.file_url ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-auto flex-shrink-0"
                    onClick={() => window.open(file.file_url!, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>View file</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-4 w-4 flex items-center justify-center ml-auto flex-shrink-0">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>Processing file...</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      ))}
    </div>
  )
}
