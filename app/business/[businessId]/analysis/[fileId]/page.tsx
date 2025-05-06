"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCashflowAnalysis } from "@/hooks/use-cashflow-analysis"
import { useLastAnalyzedFile } from "@/hooks/use-last-analyzed-file"
import { PivotTable } from "@/components/cashflow/pivot-table/pivot-table"
import { EmptyTableState } from "@/components/empty-table-state"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileText } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function BusinessAnalysisWithFileIdPage({
  params,
}: {
  params: { businessId: string; fileId: string }
}) {
  const router = useRouter()
  const businessId = params.businessId
  const fileId = params.fileId
  const supabase = createClientComponentClient()

  const { data, isLoading, error } = useCashflowAnalysis(fileId)
  const { recentFiles, saveLastFile, navigateToAnalysis } = useLastAnalyzedFile(businessId)
  const [selectedFileId, setSelectedFileId] = useState(fileId)
  const [isFileDeleted, setIsFileDeleted] = useState(false)

  useEffect(() => {
    console.log("🔍 [BusinessAnalysis] Mounted with businessId:", businessId)
    console.log("🔍 [BusinessAnalysis] File ID:", fileId)

    // Check if the current file is deleted
    const checkFileStatus = async () => {
      try {
        const { data, error } = await supabase.from("uploaded_files").select("is_deleted").eq("id", fileId).single()

        if (error || (data && data.is_deleted)) {
          console.log("Current file is deleted or doesn't exist, need to fallback")
          setIsFileDeleted(true)

          // Find the next available file
          if (recentFiles.length > 0) {
            const nextFileId = recentFiles[0].id
            console.log(`Falling back to next available file: ${nextFileId}`)
            navigateToAnalysis(nextFileId)
          } else {
            // No files available, redirect to the analysis page without fileId
            console.log("No files available, redirecting to analysis page")
            router.push(`/business/${businessId}/analysis`)
          }
        } else {
          // File exists and is not deleted
          saveLastFile(fileId)
          setSelectedFileId(fileId)
        }
      } catch (err) {
        console.error("Error checking file status:", err)
      }
    }

    checkFileStatus()
  }, [businessId, fileId, saveLastFile, navigateToAnalysis, router, supabase, recentFiles])

  // Handle file selection change
  const handleFileChange = (newFileId: string) => {
    if (newFileId !== fileId) {
      navigateToAnalysis(newFileId)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // If the file is deleted and we're waiting for redirect, show loading
  if (isFileDeleted) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Analysis</h1>
          <p className="text-muted-foreground">View financial analysis and insights for your business.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading alternative file...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Analysis</h1>
        <p className="text-muted-foreground">View financial analysis and insights for your business.</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
            {data?.file?.filename && (
              <p className="text-sm text-muted-foreground">
                File: <span className="font-medium">{data.file.filename}</span>
              </p>
            )}
          </div>

          {/* File Selection Dropdown */}
          {recentFiles.length > 0 && (
            <div className="w-64">
              <Select value={selectedFileId} onValueChange={handleFileChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a file" />
                </SelectTrigger>
                <SelectContent>
                  {recentFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div className="truncate max-w-[180px]">
                          <span className="block truncate">{file.filename}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(file.created_at)}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading cashflow data...</span>
            </div>
          ) : error ? (
            <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
              <h3 className="font-bold">Error loading cashflow data</h3>
              <p>{error.message}</p>
            </div>
          ) : data && data.records.length > 0 ? (
            <PivotTable
              data={{
                years: data.years || [],
                categoryNames: data.categoryNames || [],
                byCategory: data.byCategory || {},
                categories: data.categories || {},
              }}
              showSummaryCards={true}
            />
          ) : (
            <EmptyTableState
              message="No financial data available"
              actionLabel="Upload File"
              onAction={() => router.push(`/business/${businessId}/tasks`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
