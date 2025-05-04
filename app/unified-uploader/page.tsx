"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function UnifiedUploader() {
  const [fileStatus, setFileStatus] = useState<"idle" | "uploading" | "parsing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [fileName, setFileName] = useState<string>("")
  const [fileId, setFileId] = useState<string | null>(null)
  const [parseStats, setParseStats] = useState<{ rows_inserted: number; rows_failed: number } | null>(null)

  // State for records and categories
  const [records, setRecords] = useState<any[]>([])
  const [categories, setCategories] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const supabase = createClientComponentClient()

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("cashflow_categories").select("*")
        if (error) throw error

        const categoryMap: Record<string, any> = {}
        data?.forEach((cat) => {
          categoryMap[cat.id] = cat
        })

        setCategories(categoryMap)
        console.log("✅ Fetched categories:", Object.keys(categoryMap).length)
      } catch (err) {
        console.error("❌ Error fetching categories:", err)
      }
    }

    fetchCategories()
  }, [supabase])

  // Fetch records when fileId changes
  useEffect(() => {
    const fetchRecords = async () => {
      if (!fileId) return

      setLoading(true)
      try {
        console.log("🔍 Fetching records for file:", fileId)

        const { data, error } = await supabase.from("cashflow_records").select("*").eq("source_file_id", fileId)

        if (error) throw error

        console.log("📊 Found records:", data?.length || 0)
        setRecords(data || [])
      } catch (err) {
        console.error("❌ Error fetching records:", err)
      } finally {
        setLoading(false)
      }
    }

    if (fileId && fileStatus === "success") {
      fetchRecords()
    }
  }, [fileId, fileStatus, supabase])

  const handleUploadAndParse = useCallback(
    async (file: File) => {
      if (!file) return

      setFileName(file.name)
      setFileStatus("uploading")
      setUploadProgress(0)
      setErrorMessage("")
      setParseStats(null)
      setRecords([])

      try {
        // Check authentication
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          throw new Error("You must be logged in to upload files")
        }

        // Generate file path
        const fileExt = file.name.split(".").pop()
        const generatedName = `${uuidv4()}-${Date.now()}.${fileExt}`
        const filePath = `${userData.user.id}/${generatedName}`

        console.log("📤 Uploading file:", file.name)

        // Upload to storage
        const { error: uploadError } = await supabase.storage.from("cashflow-files").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`)
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 5, 95))
        }, 100)

        // Create database record
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
        setUploadProgress(100)

        // Store file ID
        const newFileId = fileRecord.id
        setFileId(newFileId)
        console.log("✅ File uploaded with ID:", newFileId)

        // Parse the file
        setFileStatus("parsing")
        setUploadProgress(0)

        const parseProgressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 5, 95))
        }, 100)

        // Call parse API
        const response = await fetch(`/api/parse-file/${newFileId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to parse file")
        }

        const parseData = await response.json()
        clearInterval(parseProgressInterval)
        setUploadProgress(100)

        console.log("✅ Parse complete:", parseData)
        setParseStats({
          rows_inserted: parseData.rows_inserted || 0,
          rows_failed: parseData.rows_failed || 0,
        })

        setFileStatus("success")

        // Directly fetch records after parsing
        const { data: records, error: recordsError } = await supabase
          .from("cashflow_records")
          .select("*")
          .eq("source_file_id", newFileId)

        if (recordsError) {
          console.error("❌ Error fetching records after parse:", recordsError)
        } else {
          console.log("📊 Fetched records after parse:", records?.length || 0)
          setRecords(records || [])
        }
      } catch (error) {
        setFileStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
        console.error("❌ Upload/parse error:", error)
      }
    },
    [supabase],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: useCallback(
      (acceptedFiles) => {
        const file = acceptedFiles[0]
        if (file) {
          handleUploadAndParse(file)
        }
      },
      [handleUploadAndParse],
    ),
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: fileStatus === "uploading" || fileStatus === "parsing",
  })

  const resetUploader = () => {
    setFileStatus("idle")
    setUploadProgress(0)
    setFileId(null)
    setParseStats(null)
    setRecords([])
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Unified Cash Flow Analyzer</h1>

        {fileStatus === "idle" && (
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

        {(fileStatus === "uploading" || fileStatus === "parsing") && (
          <div className="space-y-4 border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {fileStatus === "uploading" ? "Uploading file..." : "Parsing financial data..."}
                </p>
              </div>
              <div className="text-sm font-medium">{uploadProgress}%</div>
            </div>

            <Progress value={uploadProgress} className="h-2" />

            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        {fileStatus === "success" && (
          <div className="space-y-6">
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                File uploaded and parsed successfully.
                {parseStats && (
                  <div className="mt-2 text-sm">
                    <div>Records inserted: {parseStats.rows_inserted}</div>
                    {parseStats.rows_failed > 0 && (
                      <div className="text-amber-600">Records failed: {parseStats.rows_failed}</div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h2 className="text-lg font-medium">Parsed Results</h2>
              {fileId && <div className="text-xs text-gray-500 mb-2">File ID: {fileId}</div>}

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading records...</p>
                </div>
              ) : records.length > 0 ? (
                <div className="border rounded-lg overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-left font-medium">
                      <tr>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Year</th>
                        <th className="px-4 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="border-t">
                          <td className="px-4 py-2">{categories[record.category_id]?.name || "—"}</td>
                          <td className="px-4 py-2 capitalize">{categories[record.category_id]?.type || "—"}</td>
                          <td className="px-4 py-2">{record.year}</td>
                          <td className="px-4 py-2">${record.amount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center border rounded-lg">
                  No records found for this file.
                </p>
              )}
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

        {/* Debug Information */}
        {fileId && (
          <div className="mt-8 pt-4 border-t">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium">Debug Information</summary>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p>
                  <strong>File ID:</strong> {fileId}
                </p>
                <p>
                  <strong>Status:</strong> {fileStatus}
                </p>
                <p>
                  <strong>Records Count:</strong> {records.length}
                </p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
