"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react"
import ParsedCashflowTable from "@/components/parsed-cashflow-table"

type ProcessStatus = "idle" | "uploading" | "parsing" | "success" | "error"

export default function CashflowAnalyzerPage() {
  const [status, setStatus] = useState<ProcessStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [fileId, setFileId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parseStats, setParseStats] = useState<{ rows_inserted: number; rows_failed: number } | null>(null)

  const supabase = createClientComponentClient()

  const resetState = () => {
    setStatus("idle")
    setProgress(0)
    setFileName("")
    setFileId(null)
    setError(null)
    setParseStats(null)
  }

  const handleUpload = async (file: File) => {
    try {
      setStatus("uploading")
      setProgress(0)
      setFileName(file.name)
      setError(null)

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cash Flow Analyzer</h1>

        {/* File Upload Area */}
        {status === "idle" && (
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
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Select File
              </button>
            </div>
          </div>
        )}

        {/* Progress Indicators */}
        {(status === "uploading" || status === "parsing") && (
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

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full w-full flex-1 bg-primary transition-all"
                style={{ transform: `translateX(-${100 - progress}%)` }}
              />
            </div>

            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="border border-destructive/50 rounded-lg p-6 bg-destructive/10">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">Error Processing File</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={resetState}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State with Stats */}
        {status === "success" && parseStats && (
          <div className="space-y-6">
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-green-800">File Processed Successfully</p>
                  <p className="text-sm text-muted-foreground">{fileName}</p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium">{parseStats.rows_inserted}</span> records inserted
                    </div>
                    {parseStats.rows_failed > 0 && (
                      <div className="text-amber-600">
                        <span className="font-medium">{parseStats.rows_failed}</span> records failed
                      </div>
                    )}
                  </div>
                  <button
                    onClick={resetState}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-2"
                  >
                    Upload Another File
                  </button>
                </div>
              </div>
            </div>

            {/* Parsed Results Table */}
            {fileId && (
              <div className="border rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Parsed Financial Data</h2>
                <ParsedCashflowTable fileId={fileId} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
