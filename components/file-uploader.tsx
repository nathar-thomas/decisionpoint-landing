"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

type FileStatus = "idle" | "uploading" | "success" | "error"

export function FileUploader() {
  const [fileStatus, setFileStatus] = useState<FileStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [fileName, setFileName] = useState<string>("")

  const supabase = createClientComponentClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setFileName(file.name)
      setFileStatus("uploading")
      setUploadProgress(0)

      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("You must be logged in to upload files")
        }

        // Create a unique file path
        const fileExt = file.name.split(".").pop()
        const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage.from("cashflow-files").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`)
        }

        // Simulate progress (in a real app, you might use an upload progress event)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval)
              return 95
            }
            return prev + 5
          })
        }, 100)

        // Insert record into uploaded_files table
        const { error: dbError } = await supabase.from("uploaded_files").insert({
          user_id: user.id,
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          status: "uploaded",
        })

        if (dbError) {
          throw new Error(`Error recording file: ${dbError.message}`)
        }

        // Complete the progress bar
        clearInterval(progressInterval)
        setUploadProgress(100)
        setFileStatus("success")

        // Reset after 3 seconds
        setTimeout(() => {
          setFileStatus("idle")
          setUploadProgress(0)
        }, 3000)
      } catch (error) {
        setFileStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
      }
    },
    [supabase],
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

  return (
    <div className="space-y-4">
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

      {fileStatus === "uploading" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{fileName}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {fileStatus === "success" && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>File uploaded successfully. Your data is being processed.</AlertDescription>
        </Alert>
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
