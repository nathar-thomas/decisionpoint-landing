"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

type ProcessStatus = "idle" | "uploading" | "parsing" | "success" | "error"

interface CashflowAnalyzerProps {
  onFileProcessed?: (fileId: string) => void
}

export function CashflowAnalyzer({ onFileProcessed }: CashflowAnalyzerProps) {
  // Process state
  const [status, setStatus] = useState<ProcessStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [fileId, setFileId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parseStats, setParseStats] = useState<{ rows_inserted: number; rows_failed: number } | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    try {
      // Reset state
      setStatus("uploading")
      setProgress(0)
      setFileName(file.name)
      setError(null)
      setParseStats(null)

      // Check if user is authenticated
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError || !userData.user) {
        throw new Error("You must be logged in to upload files")
      }

      // Create a unique file path
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`
      const filePath = `${userData.user.id}/${fileName}`

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("cashflow-files").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`)
      }

      // Insert record into uploaded_files table
      const { data: fileRecord, error: dbError } = await supabase
        .from("uploaded_files")
        .insert({
          user_id: userData.user.id,
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          status: "uploaded",
        })
        .select()
        .single()

      if (dbError) {
        throw new Error(`Error recording file: ${dbError.message}`)
      }

      clearInterval(progressInterval)
      setProgress(100)
      setFileId(fileRecord.id)

      // Proceed to parsing
      await handleParse(fileRecord.id)
    } catch (error) {
      setStatus("error")
      setError(error instanceof Error ? error.message : "An unknown error occurred during upload")
    }
  }

  const handleParse = async (id: string) => {
    try {
      setStatus("parsing")
      setProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 5
        })
      }, 200)

      // Call parse API
      const response = await fetch(`/api/parse-file/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to parse file")
      }

      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)
      setStatus("success")
      setParseStats({
        rows_inserted: data.rows_inserted,
        rows_failed: data.rows_failed,
      })

      // Show success toast
      toast({
        variant: "success",
        title: "File processed successfully",
        description: (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="font-medium">{fileName}</span>
            </div>
            <div className="text-xs">
              {data.rows_inserted} records processed
              {data.rows_failed > 0 ? `, ${data.rows_failed} failed` : ""}
            </div>
          </div>
        ),
      })

      // Call the callback if provided
      if (onFileProcessed) {
        onFileProcessed(id)
      }

      // Reset to idle state after a short delay
      setTimeout(() => {
        setStatus("idle")
        setProgress(0)
        setFileName("")
      }, 1000)
    } catch (error) {
      setStatus("error")
      setError(error instanceof Error ? error.message : "An unknown error occurred during parsing")
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      handleUpload(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: status === "uploading" || status === "parsing",
  })

  // Render file drop zone
  if (status === "idle") {
    return (
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"}
          ${isDragReject ? "border-destructive bg-destructive/10" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="font-medium">
              {isDragActive ? "Drop the file here..." : "Drag and drop your financial data file here"}
            </p>
            <p className="text-sm text-muted-foreground">
              Upload CSV or Excel files (.csv, .xlsx, .xls) containing your financial data
            </p>
          </div>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Select File
          </Button>
        </div>
      </div>
    )
  }

  // Render progress indicators
  if (status === "uploading" || status === "parsing") {
    return (
      <div className="space-y-4 border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-muted-foreground">
              {status === "uploading" ? "Uploading file..." : "Parsing financial data..."}
            </p>
          </div>
          <div className="text-sm font-medium">{progress}%</div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Render error state
  if (status === "error") {
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Processing File</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>{error}</p>
            <Button
              onClick={() => setStatus("idle")}
              variant="outline"
              size="sm"
              className="mt-2 bg-background hover:bg-background/80"
            >
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // This should never be reached as we reset to idle after success
  return null
}
