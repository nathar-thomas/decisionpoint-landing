"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CashflowRecordsTable } from "@/components/cashflow-records-table"

// Prevent V0 from deleting route handler: /api/cashflow-records/[fileId]

type FileStatus = "idle" | "uploading" | "success" | "error"

export function FileUploader() {
  const [fileStatus, setFileStatus] = useState<FileStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [fileName, setFileName] = useState<string>("")
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const handleParse = async (fileId: string) => {
    try {
      const response = await fetch(`/api/parse-file/${fileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse file")
      }

      console.log("✅ Parse complete:", data)
    } catch (error) {
      console.error("❌ Error during parsing:", error)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setFileName(file.name)
      setFileStatus("uploading")
      setUploadProgress(0)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error("You must be logged in to upload files")

        const fileExt = file.name.split(".").pop()
        const generatedName = `${uuidv4()}-${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${generatedName}`

        const { error: uploadError } = await supabase.storage
          .from("cashflow-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`)
        }

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval)
              return 95
            }
            return prev + 5
          })
        }, 100)

        const { data: fileRecord, error: dbError } = await supabase
          .from("uploaded_files")
          .insert({
            user_id: user.id,
            filename: file.name,
            file_path: filePath,
            file_type: file.type,
            status: "uploaded",
          })
          .select()
          .single()

        if (dbError) throw new Error(`Error recording file: ${dbError.message}`)

        clearInterval(progressInterval)
        setUploadProgress(100)
        setFileStatus("success")
        setUploadedFileId(fileRecord.id)

        // 🔁 Auto-trigger file parsing
        await handleParse(fileRecord.id)
      } catch (error) {
        setFileStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
      }
    },
    [supabase]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const resetUploader = () => {
    setFileStatus("idle")
    setUploadProgress(0)
    setUploadedFileId(null)
  }

  return (
    <div className="space-y-4">
      {fileStatus !== "success" && (
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
                {isDragActive ? "Drop the file here..." : "Drag and drop your file here or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground">Only CSV and Excel files (.csv, .xlsx) are supported</p>
            </div>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Select File
            </Button>
          </div>
        </div>
      )}

      {fileStatus === "uploading" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{fileName}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {fileStatus === "success" && uploadedFileId && (
      <div className="space-y-4">
      <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>File uploaded and parsed successfully.</AlertDescription>
      </Alert>

      <div>
        <p className="text-sm text-muted-foreground">Parsed Results</p>
        <CashflowRecordsTable fileId={uploadedFileId} />
      </div>

    <div className="flex justify-end">
      <Button variant="outline" size="sm" onClick={resetUploader}>
        Upload Another File
      </Button>
    </div>
  </div>
)}

      {fileStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
