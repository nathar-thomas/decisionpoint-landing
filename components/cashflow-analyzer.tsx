"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  FileText,
  BarChart2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ProcessStatus = "idle" | "uploading" | "parsing" | "success" | "error"
type CashflowRecord = {
  id: string
  year: number
  amount: number
  category_id: string
  is_recurring: boolean
  source_file_id: string
}

type Category = {
  id: string
  name: string
  type: string
}

export function CashflowAnalyzer() {
  // Process state
  const [status, setStatus] = useState<ProcessStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [fileId, setFileId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parseStats, setParseStats] = useState<{ rows_inserted: number; rows_failed: number } | null>(null)

  // Data state
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [categories, setCategories] = useState<Record<string, Category>>({})
  const [pivotedData, setPivotedData] = useState<Record<string, Record<number, number>>>({})
  const [years, setYears] = useState<number[]>([])
  const [categoryNames, setCategoryNames] = useState<string[]>([])

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("cashflow_categories").select("*")
        if (error) throw error

        const categoryMap: Record<string, Category> = {}
        data?.forEach((cat) => {
          categoryMap[cat.id] = {
            id: cat.id,
            name: cat.name || "Unknown",
            type: cat.type || "unknown",
          }
        })

        setCategories(categoryMap)
        console.log("✅ Fetched categories:", Object.keys(categoryMap).length)
      } catch (err) {
        console.error("❌ Error fetching categories:", err)
      }
    }

    fetchCategories()
  }, [supabase])

  // Process records into pivoted format when records or categories change
  useEffect(() => {
    if (records.length === 0 || Object.keys(categories).length === 0) return

    // Extract unique years
    const uniqueYears = [...new Set(records.map((r) => r.year))].sort()
    setYears(uniqueYears)

    // Create pivoted data structure
    const pivoted: Record<string, Record<number, number>> = {}
    const categorySet = new Set<string>()

    records.forEach((record) => {
      const category = categories[record.category_id]
      if (!category) return

      const categoryName = category.name
      categorySet.add(categoryName)

      if (!pivoted[categoryName]) {
        pivoted[categoryName] = {}
      }

      // Sum amounts for the same category and year
      if (pivoted[categoryName][record.year]) {
        pivoted[categoryName][record.year] += record.amount
      } else {
        pivoted[categoryName][record.year] = record.amount
      }
    })

    setPivotedData(pivoted)
    setCategoryNames([...categorySet].sort())
  }, [records, categories])

  // Fetch records when fileId changes and status is success
  useEffect(() => {
    const fetchRecords = async () => {
      if (!fileId) return

      try {
        console.log("🔍 Fetching records for file:", fileId)

        const { data, error } = await supabase
          .from("cashflow_records")
          .select("*")
          .eq("source_file_id", fileId)
          .order("year", { ascending: true })

        if (error) throw error

        console.log("📊 Found records:", data?.length || 0)
        setRecords(data || [])
      } catch (err) {
        console.error("❌ Error fetching records:", err)
        setError("Failed to load records. Please try again.")
      }
    }

    if (fileId && status === "success") {
      fetchRecords()
    }
  }, [fileId, status, supabase])

  const handleUpload = async (file: File) => {
    try {
      // Reset state
      setStatus("uploading")
      setProgress(0)
      setFileName(file.name)
      setError(null)
      setParseStats(null)
      setRecords([])
      setPivotedData({})

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

  const resetAnalyzer = () => {
    setStatus("idle")
    setProgress(0)
    setFileId(null)
    setParseStats(null)
    setRecords([])
    setPivotedData({})
    setYears([])
    setCategoryNames([])
    setError(null)
  }

  // Navigate to analysis page
  const handleViewAnalysis = () => {
    console.log("🔍 Navigating to analysis page for file:", fileId)
    if (fileId) {
      // Extract the businessId from the current URL
      const urlPath = window.location.pathname
      const businessIdMatch = urlPath.match(/\/business\/([^/]+)/)
      const businessId = businessIdMatch ? businessIdMatch[1] : "mock-business-1"

      router.push(`/business/${businessId}/analysis/${fileId}`)
    }
  }

  // Calculate totals for each year
  const calculateYearTotals = () => {
    const totals: Record<number, number> = {}

    years.forEach((year) => {
      totals[year] = 0
      categoryNames.forEach((category) => {
        if (pivotedData[category] && pivotedData[category][year]) {
          totals[year] += pivotedData[category][year]
        }
      })
    })

    return totals
  }

  const yearTotals = calculateYearTotals()

  return (
    <div>
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
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Select File
            </Button>
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
              <Button onClick={resetAnalyzer} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success State with Results */}
      {status === "success" && (
        <div className="space-y-6">
          {/* Success Message */}
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{fileName}</span>
              </div>
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

          {/* Pivoted Results Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetAnalyzer}>
                  Upload Another File
                </Button>
                {fileId && (
                  <Button size="sm" onClick={handleViewAnalysis}>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Detailed Analysis
                  </Button>
                )}
              </div>
            </div>

            {records.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                        Category
                      </th>
                      {years.map((year) => (
                        <th
                          key={year}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {year}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryNames.map((categoryName) => {
                      // Calculate row total
                      const rowTotal = years.reduce((sum, year) => {
                        return sum + (pivotedData[categoryName]?.[year] || 0)
                      }, 0)

                      // Get category type for styling
                      const categoryId = Object.keys(categories).find((id) => categories[id].name === categoryName)
                      const categoryType = categoryId ? categories[categoryId].type : "unknown"

                      // Determine text color based on category type
                      const textColorClass =
                        categoryType === "income"
                          ? "text-green-600"
                          : categoryType === "expense"
                            ? "text-red-600"
                            : categoryType === "debt"
                              ? "text-blue-600"
                              : "text-gray-900"

                      return (
                        <tr key={categoryName} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-white">
                            {categoryName}
                          </td>
                          {years.map((year) => (
                            <td
                              key={`${categoryName}-${year}`}
                              className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass}`}
                            >
                              {pivotedData[categoryName]?.[year]
                                ? `$${pivotedData[categoryName][year].toLocaleString()}`
                                : "—"}
                            </td>
                          ))}
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textColorClass}`}>
                            ${rowTotal.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                    {/* Year totals row */}
                    <tr className="bg-gray-50 font-medium">
                      <td className="px-6 py-4 whitespace-nowrap text-sm sticky left-0 bg-gray-50">Total</td>
                      {years.map((year) => (
                        <td key={`total-${year}`} className="px-6 py-4 whitespace-nowrap text-sm">
                          ${yearTotals[year].toLocaleString()}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        $
                        {Object.values(yearTotals)
                          .reduce((sum, val) => sum + val, 0)
                          .toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 border rounded-lg bg-gray-50">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-muted-foreground">Loading financial data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
