"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { EmptyTableState } from "@/components/empty-table-state"
import { useLastAnalyzedFile } from "@/hooks/use-last-analyzed-file"
import { Loader2 } from "lucide-react"

export default function AnalysisPage() {
  const router = useRouter()
  // Using a mock business ID for the cashflow route
  const businessId = "mock-business-1"

  const { lastFileId, isLoading, navigateToAnalysis } = useLastAnalyzedFile(businessId)

  useEffect(() => {
    console.log("🔍 [AnalysisPage] Mounted - No fileId provided")

    // If we have a lastFileId, navigate to the analysis page with that fileId
    if (!isLoading && lastFileId) {
      console.log("📊 [Analysis] Found last analyzed file, redirecting:", lastFileId)
      router.push(`/cashflow/analysis/${lastFileId}`)
    }
  }, [isLoading, lastFileId, router])

  // Show loading state while checking for last analyzed file
  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/10">
          <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading analysis data...</span>
        </div>
      </div>
    )
  }

  // If no lastFileId was found, show empty state
  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b bg-muted/10">
        <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
      </div>

      <EmptyTableState
        message="No financial data available"
        actionLabel="Upload File"
        onAction={() => router.push("/cashflow/tasks")}
      />
    </div>
  )
}
