"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCashflowAnalysis } from "@/hooks/use-cashflow-analysis"
import { PivotTable } from "@/components/cashflow/pivot-table/pivot-table"
import { EmptyTableState } from "@/components/empty-table-state"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function BusinessAnalysisWithFileIdPage({
  params,
}: {
  params: { businessId: string; fileId: string }
}) {
  const router = useRouter()
  const businessId = params.businessId
  const fileId = params.fileId

  const { data, isLoading, error } = useCashflowAnalysis(fileId)

  useEffect(() => {
    console.log("🔍 [BusinessAnalysis] Mounted with businessId:", businessId)
    console.log("🔍 [BusinessAnalysis] File ID:", fileId)
    console.log("📊 [Analysis] Data state:", isLoading ? "Loading" : error ? "Error" : data ? "Data found" : "Empty")
  }, [businessId, fileId, isLoading, error, data])

  const handleUploadAction = () => {
    console.log("🧭 [Navigation] Redirecting to tasks for file upload")
    router.push(`/business/${businessId}/tasks`)
  }

  return (
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
  )
}
