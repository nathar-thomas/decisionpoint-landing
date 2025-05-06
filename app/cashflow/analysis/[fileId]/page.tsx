"use client"

import { useEffect } from "react"
import { useCashflowAnalysis } from "@/hooks/use-cashflow-analysis"
import { PivotTable } from "@/components/cashflow/pivot-table/pivot-table"
import { EmptyTableState } from "@/components/empty-table-state"
import { BusinessHeader } from "@/components/business-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AnalysisWithFileIdPage({
  params,
}: {
  params: { fileId: string }
}) {
  const router = useRouter()
  const { data, isLoading, error } = useCashflowAnalysis(params.fileId)

  useEffect(() => {
    console.log("🔍 [AnalysisPage] Mounted with fileId:", params.fileId)
    console.log("📊 [Analysis] Data state:", isLoading ? "Loading" : error ? "Error" : data ? "Data found" : "Empty")
  }, [params.fileId, isLoading, error, data])

  const handleUploadAction = () => {
    console.log("🧭 [Navigation] Redirecting to tasks for file upload")
    router.push("/cashflow/tasks")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BusinessHeader
        businessId="mock-business-1"
        title="Analysis"
        description="View financial analysis and insights."
        className="mb-8"
      />

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
          {data?.file?.filename && (
            <p className="text-sm text-muted-foreground">
              File: <span className="font-medium">{data.file.filename}</span>
            </p>
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
              onAction={handleUploadAction}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
