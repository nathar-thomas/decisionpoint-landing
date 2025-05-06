"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { EmptyTableState } from "@/components/empty-table-state"
import { useLastAnalyzedFile } from "@/hooks/use-last-analyzed-file"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function BusinessAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.businessId as string

  const { lastFileId, isLoading, navigateToAnalysis } = useLastAnalyzedFile(businessId)

  useEffect(() => {
    console.log("🔍 [BusinessAnalysis] Mounted with businessId:", businessId)

    // If we have a lastFileId, navigate to the analysis page with that fileId
    if (!isLoading && lastFileId) {
      console.log("📊 [Analysis] Found last analyzed file, redirecting:", lastFileId)
      navigateToAnalysis(lastFileId)
    }
  }, [businessId, isLoading, lastFileId, navigateToAnalysis])

  // Show loading state while checking for last analyzed file
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Analysis</h1>
          <p className="text-muted-foreground">View financial analysis and insights for your business.</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading analysis data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no lastFileId was found, show empty state
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Analysis</h1>
        <p className="text-muted-foreground">View financial analysis and insights for your business.</p>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/10">
          <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
        </div>

        <EmptyTableState
          message="No financial data available for analysis"
          actionLabel="Upload File"
          onAction={() => router.push(`/business/${businessId}/tasks`)}
        />
      </div>
    </div>
  )
}
